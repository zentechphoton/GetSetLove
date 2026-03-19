package websocket

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Connection represents a WebSocket connection
type Connection struct {
	ID        string
	UserID    string
	Conn      *websocket.Conn
	Send      chan []byte
	ChatRooms map[string]bool
	LastPing  time.Time
	mutex     sync.RWMutex
}

// BroadcastMessage represents a message to be broadcast
type BroadcastMessage struct {
	Target  string // "chat", "user", or "all"
	ID      string // chatID or userID
	Message []byte
}

// ConnectionManager manages all WebSocket connections
type ConnectionManager struct {
	Connections map[string]*Connection      // connID -> Connection
	UserConns   map[string][]*Connection    // userID -> []*Connection (multi-device)
	ChatConns   map[string][]*Connection    // chatID -> []*Connection
	Register    chan *Connection
	Unregister  chan *Connection
	Broadcast   chan *BroadcastMessage
	mutex       sync.RWMutex
}

// NewConnectionManager creates a new connection manager
func NewConnectionManager() *ConnectionManager {
	return &ConnectionManager{
		Connections: make(map[string]*Connection),
		UserConns:   make(map[string][]*Connection),
		ChatConns:   make(map[string][]*Connection),
		Register:    make(chan *Connection, 256),
		Unregister:  make(chan *Connection, 256),
		Broadcast:   make(chan *BroadcastMessage, 1024),
	}
}

// Run starts the connection manager event loop
func (cm *ConnectionManager) Run() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case conn := <-cm.Register:
			cm.registerConnection(conn)

		case conn := <-cm.Unregister:
			cm.unregisterConnection(conn)

		case msg := <-cm.Broadcast:
			cm.broadcastMessage(msg)

		case <-ticker.C:
			cm.cleanupStaleConnections()
		}
	}
}

// registerConnection registers a new connection
func (cm *ConnectionManager) registerConnection(conn *Connection) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// Add to connections map
	cm.Connections[conn.ID] = conn

	// Add to user connections
	if cm.UserConns[conn.UserID] == nil {
		cm.UserConns[conn.UserID] = make([]*Connection, 0)
	}
	cm.UserConns[conn.UserID] = append(cm.UserConns[conn.UserID], conn)

	log.Printf("✅ Connection registered: %s (user: %s, total: %d)", conn.ID, conn.UserID, len(cm.Connections))
}

// unregisterConnection unregisters a connection
func (cm *ConnectionManager) unregisterConnection(conn *Connection) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// Remove from connections map
	delete(cm.Connections, conn.ID)

	// Remove from user connections
	if conns, ok := cm.UserConns[conn.UserID]; ok {
		filtered := make([]*Connection, 0)
		for _, c := range conns {
			if c.ID != conn.ID {
				filtered = append(filtered, c)
			}
		}
		if len(filtered) > 0 {
			cm.UserConns[conn.UserID] = filtered
		} else {
			delete(cm.UserConns, conn.UserID)
		}
	}

	// Remove from all chat rooms
	for chatID := range conn.ChatRooms {
		cm.removeFromChatRoom(conn, chatID)
	}

	// Close the connection
	close(conn.Send)

	log.Printf("❌ Connection unregistered: %s (user: %s, remaining: %d)", conn.ID, conn.UserID, len(cm.Connections))
}

// broadcastMessage broadcasts a message to the target
func (cm *ConnectionManager) broadcastMessage(msg *BroadcastMessage) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	switch msg.Target {
	case "chat":
		if conns, ok := cm.ChatConns[msg.ID]; ok {
			for _, conn := range conns {
				select {
				case conn.Send <- msg.Message:
				default:
					log.Printf("⚠️  Failed to send to connection %s (buffer full)", conn.ID)
				}
			}
		}

	case "user":
		if conns, ok := cm.UserConns[msg.ID]; ok {
			for _, conn := range conns {
				select {
				case conn.Send <- msg.Message:
				default:
					log.Printf("⚠️  Failed to send to connection %s (buffer full)", conn.ID)
				}
			}
		}

	case "all":
		for _, conn := range cm.Connections {
			select {
			case conn.Send <- msg.Message:
			default:
				log.Printf("⚠️  Failed to send to connection %s (buffer full)", conn.ID)
			}
		}
	}
}

// BroadcastToChat broadcasts a message to all connections in a chat
func (cm *ConnectionManager) BroadcastToChat(chatID string, message []byte) {
	cm.Broadcast <- &BroadcastMessage{
		Target:  "chat",
		ID:      chatID,
		Message: message,
	}
}

// BroadcastToUser broadcasts a message to all connections of a user
func (cm *ConnectionManager) BroadcastToUser(userID string, message []byte) {
	cm.Broadcast <- &BroadcastMessage{
		Target:  "user",
		ID:      userID,
		Message: message,
	}
}

// BroadcastToAll broadcasts a message to all connections
func (cm *ConnectionManager) BroadcastToAll(message []byte) {
	cm.Broadcast <- &BroadcastMessage{
		Target:  "all",
		Message: message,
	}
}

// SubscribeToChatRoom subscribes a connection to a chat room
func (cm *ConnectionManager) SubscribeToChatRoom(connID, chatID string) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	conn, ok := cm.Connections[connID]
	if !ok {
		return
	}

	conn.mutex.Lock()
	conn.ChatRooms[chatID] = true
	conn.mutex.Unlock()

	// Add to chat connections
	if cm.ChatConns[chatID] == nil {
		cm.ChatConns[chatID] = make([]*Connection, 0)
	}
	cm.ChatConns[chatID] = append(cm.ChatConns[chatID], conn)

	log.Printf("📥 Connection %s subscribed to chat %s", connID, chatID)
}

// UnsubscribeFromChatRoom unsubscribes a connection from a chat room
func (cm *ConnectionManager) UnsubscribeFromChatRoom(connID, chatID string) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	conn, ok := cm.Connections[connID]
	if !ok {
		return
	}

	conn.mutex.Lock()
	delete(conn.ChatRooms, chatID)
	conn.mutex.Unlock()

	cm.removeFromChatRoom(conn, chatID)

	log.Printf("📤 Connection %s unsubscribed from chat %s", connID, chatID)
}

// removeFromChatRoom removes a connection from a chat room (internal)
func (cm *ConnectionManager) removeFromChatRoom(conn *Connection, chatID string) {
	if conns, ok := cm.ChatConns[chatID]; ok {
		filtered := make([]*Connection, 0)
		for _, c := range conns {
			if c.ID != conn.ID {
				filtered = append(filtered, c)
			}
		}
		if len(filtered) > 0 {
			cm.ChatConns[chatID] = filtered
		} else {
			delete(cm.ChatConns, chatID)
		}
	}
}

// GetUserConnections retrieves all connections for a user
func (cm *ConnectionManager) GetUserConnections(userID string) []*Connection {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	if conns, ok := cm.UserConns[userID]; ok {
		return conns
	}
	return nil
}

// GetConnection retrieves a connection by ID
func (cm *ConnectionManager) GetConnection(connID string) *Connection {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	return cm.Connections[connID]
}

// GetStats retrieves connection statistics
func (cm *ConnectionManager) GetStats() map[string]interface{} {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	return map[string]interface{}{
		"total_connections": len(cm.Connections),
		"total_users":       len(cm.UserConns),
		"total_chat_rooms":  len(cm.ChatConns),
	}
}

// cleanupStaleConnections removes connections that haven't pinged recently
func (cm *ConnectionManager) cleanupStaleConnections() {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	staleThreshold := time.Now().Add(-2 * time.Minute)
	staleConns := make([]*Connection, 0)

	for _, conn := range cm.Connections {
		if conn.LastPing.Before(staleThreshold) {
			staleConns = append(staleConns, conn)
		}
	}

	if len(staleConns) > 0 {
		log.Printf("🧹 Cleaning up %d stale connections", len(staleConns))
		for _, conn := range staleConns {
			go func(c *Connection) {
				cm.Unregister <- c
			}(conn)
		}
	}
}

// IsUserOnline checks if a user has any active connections
func (cm *ConnectionManager) IsUserOnline(userID string) bool {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()

	conns, ok := cm.UserConns[userID]
	return ok && len(conns) > 0
}
