package websocket

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/nats-io/nats.go"
	"gsl-backend/models"
	"gsl-backend/services/chat"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period (must be less than pongWait)
	pingPeriod = 30 * time.Second

	// Maximum message size allowed from peer
	maxMessageSize = 512 * 1024 // 512KB
)

// WritePump pumps messages from the hub to the websocket connection
func (c *Connection) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Channel was closed
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			err := c.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Printf("⚠️  Write error for connection %s: %v", c.ID, err)
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ReadPump pumps messages from the websocket connection to the hub
func (c *Connection) ReadPump(
	connManager *ConnectionManager,
	chatService *chat.ChatService,
	js nats.JetStreamContext,
) {
	defer func() {
		connManager.Unregister <- c
		c.Conn.Close()

		// Publish offline presence
		if chatService != nil {
			chatService.HandlePresenceUpdate(c.UserID, false)
		}
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		c.LastPing = time.Now()
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("⚠️  Read error for connection %s: %v", c.ID, err)
			}
			break
		}

		// Parse and handle message
		wsMsg, err := ParseMessage(message)
		if err != nil {
			log.Printf("⚠️  Failed to parse message from connection %s: %v", c.ID, err)
			c.Send <- CreateErrorMessage("PARSE_ERROR", "Invalid message format", "")
			continue
		}

		// Handle message
		HandleIncomingMessage(c, wsMsg, connManager, chatService, js)
	}
}

// HandleIncomingMessage handles incoming WebSocket messages
func HandleIncomingMessage(
	conn *Connection,
	msg *WSMessage,
	connManager *ConnectionManager,
	chatService *chat.ChatService,
	js nats.JetStreamContext,
) {
	switch msg.Type {
	case WSMsgTypeSendMessage:
		handleSendMessage(conn, msg, chatService)

	case WSMsgTypeTypingStart:
		handleTyping(conn, msg, chatService, true)

	case WSMsgTypeTypingStop:
		handleTyping(conn, msg, chatService, false)

	case WSMsgTypeMarkRead:
		handleMarkRead(conn, msg, chatService)

	case WSMsgTypeSubscribe:
		handleSubscribe(conn, msg, connManager, chatService)

	case WSMsgTypeUnsubscribe:
		handleUnsubscribe(conn, msg, connManager)

	case WSMsgTypePing:
		handlePing(conn, msg)

	default:
		conn.Send <- CreateErrorMessage("UNKNOWN_TYPE", "Unknown message type: "+msg.Type, msg.RequestID)
	}
}

// Message handler functions

func handleSendMessage(conn *Connection, msg *WSMessage, chatService *chat.ChatService) {
	// Parse payload
	payloadBytes, err := json.Marshal(msg.Payload)
	if err != nil {
		conn.Send <- CreateErrorMessage("INVALID_PAYLOAD", "Invalid message payload", msg.RequestID)
		return
	}

	var payload SendMessagePayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		conn.Send <- CreateErrorMessage("INVALID_PAYLOAD", "Invalid message payload", msg.RequestID)
		return
	}

	// Create message model using chat service
	if chatService != nil {
		messageModel := &models.Message{
			ChatID:     uuid.MustParse(payload.ChatID),
			SenderID:   uuid.MustParse(conn.UserID),
			Content:    payload.Content,
			MediaURL:   payload.MediaURL,
			MessageType: "text",
			Status:     "sent",
		}

		// Set media type if media URL is provided
		if payload.MediaURL != nil && *payload.MediaURL != "" {
			mediaType := "image" // Default to image, can be enhanced to detect type
			messageModel.MediaType = &mediaType
			messageModel.MessageType = "media"
		}

		if payload.ReplyTo != nil {
			replyToID := uuid.MustParse(*payload.ReplyTo)
			messageModel.ReplyToMessageID = &replyToID
		}

		// Send message via chat service
		savedMessage, err := chatService.SendMessage(context.Background(), messageModel)
		if err != nil {
			conn.Send <- CreateErrorMessage("SEND_ERROR", err.Error(), msg.RequestID)
			return
		}

		// Send acknowledgement with saved message
		conn.Send <- CreateMessageAck(payload.TempID, savedMessage, msg.RequestID)
		log.Printf("✉️  Message sent from user %s to chat %s", conn.UserID, payload.ChatID)
	} else {
		// Fallback if chat service is not available
		mockMessage := map[string]interface{}{
			"id":        payload.TempID,
			"chat_id":   payload.ChatID,
			"sender_id": conn.UserID,
			"content":   payload.Content,
			"created_at": time.Now(),
		}
		conn.Send <- CreateMessageAck(payload.TempID, mockMessage, msg.RequestID)
		log.Printf("⚠️  Message sent without chat service (mock mode)")
	}
}

func handleTyping(conn *Connection, msg *WSMessage, chatService *chat.ChatService, typing bool) {
	payloadBytes, err := json.Marshal(msg.Payload)
	if err != nil {
		return
	}

	var payload TypingPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return
	}

	// Publish typing event via chat service
	if chatService != nil {
		chatService.HandleTypingIndicator(payload.ChatID, conn.UserID, typing)
	}
}

func handleMarkRead(conn *Connection, msg *WSMessage, chatService *chat.ChatService) {
	payloadBytes, err := json.Marshal(msg.Payload)
	if err != nil {
		conn.Send <- CreateErrorMessage("INVALID_PAYLOAD", "Invalid payload", msg.RequestID)
		return
	}

	var payload MarkReadPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		conn.Send <- CreateErrorMessage("INVALID_PAYLOAD", "Invalid payload", msg.RequestID)
		return
	}

	// Mark messages as read via chat service
	if chatService != nil {
		err := chatService.MarkMessagesAsRead(payload.ChatID, conn.UserID, payload.MessageIDs)
		if err != nil {
			conn.Send <- CreateErrorMessage("MARK_READ_ERROR", err.Error(), msg.RequestID)
			return
		}
	}

	log.Printf("✓ Marked %d messages as read in chat %s", len(payload.MessageIDs), payload.ChatID)
}

func handleSubscribe(conn *Connection, msg *WSMessage, connManager *ConnectionManager, chatService *chat.ChatService) {
	payloadBytes, err := json.Marshal(msg.Payload)
	if err != nil {
		conn.Send <- CreateErrorMessage("INVALID_PAYLOAD", "Invalid payload", msg.RequestID)
		return
	}

	var payload SubscribePayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		conn.Send <- CreateErrorMessage("INVALID_PAYLOAD", "Invalid payload", msg.RequestID)
		return
	}

	// Verify user is a participant
	if chatService != nil && !chatService.IsParticipant(payload.ChatID, conn.UserID) {
		conn.Send <- CreateErrorMessage("NOT_AUTHORIZED", "Not a participant in this chat", msg.RequestID)
		return
	}

	// Subscribe to chat room
	connManager.SubscribeToChatRoom(conn.ID, payload.ChatID)

	log.Printf("📥 Connection %s subscribed to chat %s", conn.ID, payload.ChatID)
}

func handleUnsubscribe(conn *Connection, msg *WSMessage, connManager *ConnectionManager) {
	payloadBytes, err := json.Marshal(msg.Payload)
	if err != nil {
		return
	}

	var payload SubscribePayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return
	}

	// Unsubscribe from chat room
	connManager.UnsubscribeFromChatRoom(conn.ID, payload.ChatID)

	log.Printf("📤 Connection %s unsubscribed from chat %s", conn.ID, payload.ChatID)
}

func handlePing(conn *Connection, msg *WSMessage) {
	conn.Send <- CreatePongMessage(msg.RequestID)
}
