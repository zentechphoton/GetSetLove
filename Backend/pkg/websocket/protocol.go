package websocket

import (
	"encoding/json"
	"fmt"
)

// WebSocket message types
const (
	// Client -> Server
	WSMsgTypeAuth          = "auth"
	WSMsgTypeSendMessage   = "message.send"
	WSMsgTypeTypingStart   = "typing.start"
	WSMsgTypeTypingStop    = "typing.stop"
	WSMsgTypeMarkDelivered = "message.delivered"
	WSMsgTypeMarkRead      = "message.read"
	WSMsgTypeSubscribe     = "subscribe"
	WSMsgTypeUnsubscribe   = "unsubscribe"
	WSMsgTypePing          = "ping"

	// Server -> Client
	WSMsgTypeAuthSuccess     = "auth.success"
	WSMsgTypeAuthError       = "auth.error"
	WSMsgTypeMessageReceived = "message.received"
	WSMsgTypeMessageAck      = "message.ack"
	WSMsgTypeMessageError    = "message.error"
	WSMsgTypeTypingEvent     = "typing.event"
	WSMsgTypePresenceEvent   = "presence.event"
	WSMsgTypeMatchEvent      = "match.new"
	WSMsgTypeLikeEvent       = "match.like"
	WSMsgTypePong            = "pong"
	WSMsgTypeError           = "error"
)

// WSMessage represents a WebSocket message
type WSMessage struct {
	Type      string      `json:"type"`
	RequestID string      `json:"request_id,omitempty"`
	Payload   interface{} `json:"payload"`
}

// Payload structures

// SendMessagePayload for sending a message
type SendMessagePayload struct {
	ChatID   string  `json:"chat_id"`
	Content  *string `json:"content,omitempty"`
	MediaURL *string `json:"media_url,omitempty"`
	TempID   string  `json:"temp_id"` // Client-generated ID for optimistic UI
	ReplyTo  *string `json:"reply_to,omitempty"`
}

// MessageAckPayload for acknowledging a message
type MessageAckPayload struct {
	TempID  string      `json:"temp_id"`
	Message interface{} `json:"message"`
}

// TypingPayload for typing indicators
type TypingPayload struct {
	ChatID string `json:"chat_id"`
	UserID string `json:"user_id,omitempty"` // Omitted from client, added by server
	Typing bool   `json:"typing"`
}

// SubscribePayload for subscribing to a chat
type SubscribePayload struct {
	ChatID string `json:"chat_id"`
}

// MarkReadPayload for marking messages as read
type MarkReadPayload struct {
	ChatID     string   `json:"chat_id"`
	MessageIDs []string `json:"message_ids"`
}

// ErrorPayload for error messages
type ErrorPayload struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// ParseMessage parses a JSON message into WSMessage
func ParseMessage(data []byte) (*WSMessage, error) {
	var msg WSMessage
	if err := json.Unmarshal(data, &msg); err != nil {
		return nil, fmt.Errorf("failed to parse message: %w", err)
	}

	return &msg, nil
}

// CreateMessage creates a JSON-encoded WebSocket message
func CreateMessage(msgType string, payload interface{}, requestID string) []byte {
	msg := WSMessage{
		Type:      msgType,
		Payload:   payload,
		RequestID: requestID,
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return []byte(fmt.Sprintf(`{"type":"error","payload":{"message":"Failed to encode message: %s"}}`, err))
	}

	return data
}

// CreateErrorMessage creates an error message
func CreateErrorMessage(code, message string, requestID string) []byte {
	return CreateMessage(WSMsgTypeError, ErrorPayload{
		Code:    code,
		Message: message,
	}, requestID)
}

// CreatePongMessage creates a pong response
func CreatePongMessage(requestID string) []byte {
	return CreateMessage(WSMsgTypePong, map[string]interface{}{
		"timestamp": nil,
	}, requestID)
}

// CreateAuthSuccessMessage creates an auth success message
func CreateAuthSuccessMessage(userID string) []byte {
	return CreateMessage(WSMsgTypeAuthSuccess, map[string]interface{}{
		"user_id": userID,
		"status":  "authenticated",
	}, "")
}

// CreateAuthErrorMessage creates an auth error message
func CreateAuthErrorMessage(message string) []byte {
	return CreateErrorMessage("AUTH_ERROR", message, "")
}

// CreateMessageAck creates a message acknowledgement
func CreateMessageAck(tempID string, message interface{}, requestID string) []byte {
	return CreateMessage(WSMsgTypeMessageAck, MessageAckPayload{
		TempID:  tempID,
		Message: message,
	}, requestID)
}

// CreateMessageReceived creates a message received event
func CreateMessageReceived(message interface{}) []byte {
	return CreateMessage(WSMsgTypeMessageReceived, map[string]interface{}{
		"message": message,
	}, "")
}

// CreateTypingEvent creates a typing indicator event
func CreateTypingEvent(chatID, userID string, typing bool) []byte {
	return CreateMessage(WSMsgTypeTypingEvent, TypingPayload{
		ChatID: chatID,
		UserID: userID,
		Typing: typing,
	}, "")
}

// CreatePresenceEvent creates a presence event
func CreatePresenceEvent(userID string, online bool) []byte {
	return CreateMessage(WSMsgTypePresenceEvent, map[string]interface{}{
		"user_id": userID,
		"online":  online,
	}, "")
}

// CreateMatchEvent creates a match event
func CreateMatchEvent(match interface{}) []byte {
	return CreateMessage(WSMsgTypeMatchEvent, map[string]interface{}{
		"match": match,
	}, "")
}

// CreateLikeEvent creates a like event
func CreateLikeEvent(fromUserID string) []byte {
	return CreateMessage(WSMsgTypeLikeEvent, map[string]interface{}{
		"from_user_id": fromUserID,
	}, "")
}
