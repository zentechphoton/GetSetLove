package gateway

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/nats-io/nats.go"
	ws "gsl-backend/pkg/websocket"
)

// SubscribeToNATSEvents subscribes to NATS subjects and bridges to WebSocket
func SubscribeToNATSEvents(js nats.JetStreamContext, connManager *ws.ConnectionManager) {
	log.Println("🔗 Setting up NATS to WebSocket bridge...")

	// Subscribe to chat message events
	go subscribeToChatMessages(js, connManager)

	// Subscribe to typing events
	go subscribeToTypingEvents(js, connManager)

	// Subscribe to presence events
	go subscribeToPresenceEvents(js, connManager)

	// Subscribe to match events
	go subscribeToMatchEvents(js, connManager)

	// Subscribe to like events
	go subscribeToLikeEvents(js, connManager)

	log.Println("✅ NATS to WebSocket bridge active")
}

// subscribeToChatMessages subscribes to chat message events
func subscribeToChatMessages(js nats.JetStreamContext, connManager *ws.ConnectionManager) {
	subject := "chat.message.*.sent"

	_, err := js.Subscribe(subject, func(msg *nats.Msg) {
		// Extract chatID from subject (chat.message.{chatID}.sent)
		parts := strings.Split(msg.Subject, ".")
		if len(parts) != 4 {
			log.Printf("⚠️  Invalid subject format: %s", msg.Subject)
			msg.Nak()
			return
		}

		chatID := parts[2]

		// Parse message
		var message map[string]interface{}
		if err := json.Unmarshal(msg.Data, &message); err != nil {
			log.Printf("⚠️  Failed to parse message: %v", err)
			msg.Nak()
			return
		}

		// Create WebSocket message
		wsMessage := ws.CreateMessageReceived(message)

		// Broadcast to all connections in this chat
		connManager.BroadcastToChat(chatID, wsMessage)

		msg.Ack()
	}, nats.Durable("ws-bridge-messages"), nats.ManualAck())

	if err != nil {
		log.Printf("❌ Failed to subscribe to chat messages: %v", err)
	} else {
		log.Println("✅ Subscribed to chat messages")
	}
}

// subscribeToTypingEvents subscribes to typing indicator events
func subscribeToTypingEvents(js nats.JetStreamContext, connManager *ws.ConnectionManager) {
	subject := "chat.typing.>"

	_, err := js.Subscribe(subject, func(msg *nats.Msg) {
		// Extract chatID from subject (chat.typing.{chatID}.{userID})
		parts := strings.Split(msg.Subject, ".")
		if len(parts) < 3 {
			msg.Nak()
			return
		}

		chatID := parts[2]

		// Parse typing event
		var event map[string]interface{}
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("⚠️  Failed to parse typing event: %v", err)
			msg.Nak()
			return
		}

		// Create WebSocket message
		wsMessage := ws.CreateMessage(ws.WSMsgTypeTypingEvent, event, "")

		// Broadcast to all connections in this chat
		connManager.BroadcastToChat(chatID, wsMessage)

		msg.Ack()
	}, nats.Durable("ws-bridge-typing"), nats.ManualAck())

	if err != nil {
		log.Printf("❌ Failed to subscribe to typing events: %v", err)
	} else {
		log.Println("✅ Subscribed to typing events")
	}
}

// subscribeToPresenceEvents subscribes to presence events
func subscribeToPresenceEvents(js nats.JetStreamContext, connManager *ws.ConnectionManager) {
	subject := "chat.presence.>"

	_, err := js.Subscribe(subject, func(msg *nats.Msg) {
		// Extract userID from subject (chat.presence.{userID})
		parts := strings.Split(msg.Subject, ".")
		if len(parts) < 3 {
			msg.Nak()
			return
		}

		userID := parts[2]

		// Parse presence event
		var event map[string]interface{}
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("⚠️  Failed to parse presence event: %v", err)
			msg.Nak()
			return
		}

		// Create WebSocket message
		wsMessage := ws.CreateMessage(ws.WSMsgTypePresenceEvent, event, "")

		// Broadcast to the user's connections
		connManager.BroadcastToUser(userID, wsMessage)

		msg.Ack()
	}, nats.Durable("ws-bridge-presence"), nats.ManualAck())

	if err != nil {
		log.Printf("❌ Failed to subscribe to presence events: %v", err)
	} else {
		log.Println("✅ Subscribed to presence events")
	}
}

// subscribeToMatchEvents subscribes to new match events
func subscribeToMatchEvents(js nats.JetStreamContext, connManager *ws.ConnectionManager) {
	subject := "match.new.>"

	_, err := js.Subscribe(subject, func(msg *nats.Msg) {
		// Extract userID from subject (match.new.{userID})
		parts := strings.Split(msg.Subject, ".")
		if len(parts) < 3 {
			msg.Nak()
			return
		}

		userID := parts[2]

		// Parse match event
		var match map[string]interface{}
		if err := json.Unmarshal(msg.Data, &match); err != nil {
			log.Printf("⚠️  Failed to parse match event: %v", err)
			msg.Nak()
			return
		}

		// Create WebSocket message
		wsMessage := ws.CreateMatchEvent(match)

		// Broadcast to the user's connections
		connManager.BroadcastToUser(userID, wsMessage)

		log.Printf("📢 Broadcasted match event to user %s", userID)

		msg.Ack()
	}, nats.Durable("ws-bridge-matches"), nats.ManualAck())

	if err != nil {
		log.Printf("❌ Failed to subscribe to match events: %v", err)
	} else {
		log.Println("✅ Subscribed to match events")
	}
}

// subscribeToLikeEvents subscribes to like notification events
func subscribeToLikeEvents(js nats.JetStreamContext, connManager *ws.ConnectionManager) {
	subject := "match.like.>"

	_, err := js.Subscribe(subject, func(msg *nats.Msg) {
		// Extract userID from subject (match.like.{userID})
		parts := strings.Split(msg.Subject, ".")
		if len(parts) < 3 {
			msg.Nak()
			return
		}

		userID := parts[2]

		// Parse like event
		var event map[string]interface{}
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("⚠️  Failed to parse like event: %v", err)
			msg.Nak()
			return
		}

		// Create WebSocket message
		wsMessage := ws.CreateMessage(ws.WSMsgTypeLikeEvent, event, "")

		// Broadcast to the user's connections
		connManager.BroadcastToUser(userID, wsMessage)

		log.Printf("💖 Broadcasted like event to user %s", userID)

		msg.Ack()
	}, nats.Durable("ws-bridge-likes"), nats.ManualAck())

	if err != nil {
		log.Printf("❌ Failed to subscribe to like events: %v", err)
	} else {
		log.Println("✅ Subscribed to like events")
	}
}

// GetBridgeStatistics returns statistics about the NATS bridge
func GetBridgeStatistics(js nats.JetStreamContext) map[string]interface{} {
	stats := make(map[string]interface{})

	consumers := []string{
		"ws-bridge-messages",
		"ws-bridge-typing",
		"ws-bridge-presence",
		"ws-bridge-matches",
		"ws-bridge-likes",
	}

	for _, consumer := range consumers {
		// Get consumer info from different streams
		// This is a simplified version
		stats[consumer] = map[string]interface{}{
			"status": "active",
		}
	}

	return stats
}
