package chat

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
	"gorm.io/gorm"
	"gsl-backend/models"
	"gsl-backend/services/chat/repository"
)

// ChatService handles chat business logic
type ChatService struct {
	repo *repository.ChatRepository
	nc   *nats.Conn
	js   nats.JetStreamContext
}

// NewChatService creates a new chat service
func NewChatService(db *gorm.DB, nc *nats.Conn, js nats.JetStreamContext) *ChatService {
	return &ChatService{
		repo: repository.NewChatRepository(db),
		nc:   nc,
		js:   js,
	}
}

// SendMessage handles sending a new message
func (s *ChatService) SendMessage(ctx context.Context, msg *models.Message) (*models.Message, error) {
	// 1. Validate chat membership
	if !s.repo.IsParticipant(msg.ChatID.String(), msg.SenderID.String()) {
		return nil, repository.ErrNotParticipant
	}

	// 2. Content moderation (basic check - can be expanded)
	if err := s.moderateContent(msg); err != nil {
		return nil, err
	}

	// 3. Save to PostgreSQL (source of truth)
	if err := s.repo.CreateMessage(msg); err != nil {
		return nil, fmt.Errorf("failed to create message: %w", err)
	}

	// 4. Update chat last_message
	if err := s.repo.UpdateChatLastMessage(msg.ChatID.String(), msg.ID.String()); err != nil {
		log.Printf("⚠️  Failed to update chat last message: %v", err)
	}

	// 5. Publish to NATS for real-time delivery
	if err := s.publishMessageEvent(msg, "sent"); err != nil {
		log.Printf("⚠️  Failed to publish message to NATS: %v", err)
		// Don't fail the request - message is already saved
	}

	// 6. Trigger push notifications for offline users (async)
	go s.sendPushNotifications(msg)

	// 7. Update unread counts (async)
	go s.updateUnreadCounts(msg.ChatID.String(), msg.SenderID.String())

	// 8. Reload message with relationships
	savedMsg, err := s.repo.GetMessageByID(msg.ID.String())
	if err != nil {
		return msg, nil // Return original if reload fails
	}

	return savedMsg, nil
}

// GetMessages retrieves message history from PostgreSQL
func (s *ChatService) GetMessages(chatID string, limit int, beforeID *string) ([]*models.Message, error) {
	return s.repo.GetChatMessages(chatID, limit, beforeID)
}

// CreateDMChat creates a 1-on-1 chat between two users
func (s *ChatService) CreateDMChat(user1ID, user2ID string) (*models.Chat, error) {
	// Check if chat already exists
	existingChat, err := s.repo.GetDMChatBetweenUsers(user1ID, user2ID)
	if err != nil {
		return nil, err
	}
	if existingChat != nil {
		return existingChat, nil
	}

	// Create new chat
	chat := &models.Chat{
		ID:   uuid.New(),
		Type: "dm",
	}

	if err := s.repo.CreateChat(chat); err != nil {
		return nil, fmt.Errorf("failed to create chat: %w", err)
	}

	// Add participants
	participant1 := &models.ChatParticipant{
		ChatID: chat.ID,
		UserID: uuid.MustParse(user1ID),
		Role:   "member",
	}

	participant2 := &models.ChatParticipant{
		ChatID: chat.ID,
		UserID: uuid.MustParse(user2ID),
		Role:   "member",
	}

	if err := s.repo.CreateChatParticipant(participant1); err != nil {
		return nil, fmt.Errorf("failed to add participant 1: %w", err)
	}
	log.Printf("✅ Added participant 1: UserID=%s, ChatID=%s", participant1.UserID, participant1.ChatID)

	if err := s.repo.CreateChatParticipant(participant2); err != nil {
		return nil, fmt.Errorf("failed to add participant 2: %w", err)
	}
	log.Printf("✅ Added participant 2: UserID=%s, ChatID=%s", participant2.UserID, participant2.ChatID)

	// Reload chat with participants
	reloadedChat, err := s.repo.GetChatByID(chat.ID.String())
	if err != nil {
		return nil, fmt.Errorf("failed to reload chat: %w", err)
	}
	
	log.Printf("✅ Chat reloaded: ID=%s, Participants=%d", reloadedChat.ID, len(reloadedChat.Participants))
	for i, p := range reloadedChat.Participants {
		log.Printf("  Participant %d: UserID=%s, Username=%s", i+1, p.UserID, p.User.Username)
	}
	
	return reloadedChat, nil
}

// GetChatByID retrieves a chat by ID
func (s *ChatService) GetChatByID(chatID string) (*models.Chat, error) {
	return s.repo.GetChatByID(chatID)
}

// GetUserChats retrieves all chats for a user
func (s *ChatService) GetUserChats(userID string, limit, offset int) ([]*models.Chat, error) {
	return s.repo.GetUserChats(userID, limit, offset)
}

// GetDMChatBetweenUsers finds existing DM chat
func (s *ChatService) GetDMChatBetweenUsers(user1ID, user2ID string) (*models.Chat, error) {
	return s.repo.GetDMChatBetweenUsers(user1ID, user2ID)
}

// IsParticipant checks if user is a participant
func (s *ChatService) IsParticipant(chatID, userID string) bool {
	return s.repo.IsParticipant(chatID, userID)
}

// MarkMessagesAsRead marks messages as read
func (s *ChatService) MarkMessagesAsRead(chatID, userID string, messageIDs []string) error {
	if err := s.repo.MarkMessagesAsRead(chatID, userID, messageIDs); err != nil {
		return err
	}

	// Publish read receipts to NATS
	for _, msgID := range messageIDs {
		go s.publishReadReceipt(chatID, msgID, userID)
	}

	return nil
}

// UpdateChatSettings updates chat participant settings
func (s *ChatService) UpdateChatSettings(chatID, userID string, muted *bool, archived *bool) error {
	updates := make(map[string]interface{})

	if muted != nil {
		updates["muted"] = *muted
	}
	if archived != nil {
		updates["archived"] = *archived
	}

	if len(updates) == 0 {
		return nil
	}

	return s.repo.UpdateChatParticipant(chatID, userID, updates)
}

// DeleteMessage soft deletes a message
func (s *ChatService) DeleteMessage(messageID, userID string) error {
	return s.repo.DeleteMessage(messageID, userID)
}

// HandleTypingIndicator publishes typing indicator event
func (s *ChatService) HandleTypingIndicator(chatID, userID string, typing bool) error {
	event := map[string]interface{}{
		"chat_id":   chatID,
		"user_id":   userID,
		"typing":    typing,
		"timestamp": time.Now(),
	}

	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	subject := fmt.Sprintf("chat.typing.%s.%s", chatID, userID)
	return s.nc.Publish(subject, data)
}

// HandlePresenceUpdate publishes presence event
func (s *ChatService) HandlePresenceUpdate(userID string, online bool) error {
	event := map[string]interface{}{
		"user_id":   userID,
		"online":    online,
		"last_seen": time.Now(),
	}

	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	subject := fmt.Sprintf("chat.presence.%s", userID)
	return s.nc.Publish(subject, data)
}

// GetUnreadCount gets unread count for a user in a chat
func (s *ChatService) GetUnreadCount(chatID, userID string) (int, error) {
	return s.repo.GetUnreadCount(chatID, userID)
}

// SearchMessages searches for messages in a chat
func (s *ChatService) SearchMessages(chatID, query string, limit int) ([]*models.Message, error) {
	return s.repo.SearchMessages(chatID, query, limit)
}

// SubscribeToChatEvents subscribes to NATS events for a chat
func (s *ChatService) SubscribeToChatEvents(chatID string, handler func(*models.Message)) (*nats.Subscription, error) {
	subject := fmt.Sprintf("chat.message.%s.>", chatID)

	sub, err := s.js.Subscribe(subject, func(msg *nats.Msg) {
		var message models.Message
		if err := json.Unmarshal(msg.Data, &message); err != nil {
			log.Printf("⚠️  Failed to unmarshal message: %v", err)
			msg.Nak()
			return
		}

		handler(&message)
		msg.Ack()
	}, nats.ManualAck())

	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to chat events: %w", err)
	}

	return sub, nil
}

// Private helper methods

func (s *ChatService) publishMessageEvent(msg *models.Message, eventType string) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	subject := fmt.Sprintf("chat.message.%s.%s", msg.ChatID.String(), eventType)

	// Use JetStream publish with message ID for deduplication
	_, err = s.js.Publish(subject, data, nats.MsgId(msg.ID.String()))
	if err != nil {
		return fmt.Errorf("failed to publish to %s: %w", subject, err)
	}

	log.Printf("📤 Published message to NATS: %s", subject)
	return nil
}

func (s *ChatService) publishReadReceipt(chatID, messageID, userID string) {
	event := map[string]interface{}{
		"chat_id":    chatID,
		"message_id": messageID,
		"user_id":    userID,
		"read_at":    time.Now(),
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("⚠️  Failed to marshal read receipt: %v", err)
		return
	}

	subject := fmt.Sprintf("chat.message.%s.read", chatID)
	if err := s.nc.Publish(subject, data); err != nil {
		log.Printf("⚠️  Failed to publish read receipt: %v", err)
	}
}

func (s *ChatService) updateUnreadCounts(chatID, senderID string) {
	// Get all participants except sender
	chat, err := s.repo.GetChatByID(chatID)
	if err != nil {
		log.Printf("⚠️  Failed to get chat for unread update: %v", err)
		return
	}

	for _, participant := range chat.Participants {
		if participant.UserID.String() != senderID && participant.LeftAt == nil {
			if err := s.repo.UpdateUnreadCount(chatID, participant.UserID.String(), true); err != nil {
				log.Printf("⚠️  Failed to update unread count for %s: %v", participant.UserID, err)
			}
		}
	}
}

func (s *ChatService) sendPushNotifications(msg *models.Message) {
	// Get chat participants
	chat, err := s.repo.GetChatByID(msg.ChatID.String())
	if err != nil {
		log.Printf("⚠️  Failed to get chat for push notification: %v", err)
		return
	}

	// Publish notification event for each participant (except sender)
	for _, participant := range chat.Participants {
		if participant.UserID.String() != msg.SenderID.String() && participant.LeftAt == nil {
			notification := map[string]interface{}{
				"user_id": participant.UserID.String(),
				"type":    "new_message",
				"title":   "New Message",
				"body":    truncateString(stringValue(msg.Content), 100),
				"data": map[string]interface{}{
					"chat_id":    msg.ChatID.String(),
					"message_id": msg.ID.String(),
				},
			}

			data, err := json.Marshal(notification)
			if err != nil {
				log.Printf("⚠️  Failed to marshal notification: %v", err)
				continue
			}

			subject := fmt.Sprintf("notification.push.%s", participant.UserID.String())
			if err := s.nc.Publish(subject, data); err != nil {
				log.Printf("⚠️  Failed to publish push notification: %v", err)
			}
		}
	}
}

func (s *ChatService) moderateContent(msg *models.Message) error {
	// Basic content moderation
	if msg.Content != nil && len(*msg.Content) > 10000 {
		return fmt.Errorf("message content too long (max 10000 characters)")
	}

	// TODO: Implement profanity filter
	// TODO: Implement spam detection
	// TODO: Implement image moderation for media messages

	msg.ModerationStatus = "approved"
	return nil
}

// Helper functions

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

func stringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
