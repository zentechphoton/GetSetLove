package repository

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gsl-backend/models"
)

var (
	ErrChatNotFound       = errors.New("chat not found")
	ErrNotParticipant     = errors.New("user is not a participant")
	ErrMessageNotFound    = errors.New("message not found")
	ErrInvalidChatType    = errors.New("invalid chat type")
)

// ChatRepository handles database operations for chats
type ChatRepository struct {
	db *gorm.DB
}

// NewChatRepository creates a new chat repository
func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

// CreateChat creates a new chat
func (r *ChatRepository) CreateChat(chat *models.Chat) error {
	return r.db.Create(chat).Error
}

// GetChatByID retrieves a chat by ID with participants
func (r *ChatRepository) GetChatByID(chatID string) (*models.Chat, error) {
	var chat models.Chat
	err := r.db.
		Preload("Participants", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User")
		}).
		Preload("LastMessage", func(db *gorm.DB) *gorm.DB {
			return db.Preload("Sender")
		}).
		Where("id = ?", chatID).
		First(&chat).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrChatNotFound
		}
		return nil, err
	}

	return &chat, nil
}

// GetUserChats retrieves all chats for a user
func (r *ChatRepository) GetUserChats(userID string, limit, offset int) ([]*models.Chat, error) {
	var chats []*models.Chat

	// Parse userID to UUID to ensure proper type matching
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID format: %w", err)
	}

	// Debug: Check if user has any chat participants (including zero timestamp)
	var participantCount int64
	r.db.Model(&models.ChatParticipant{}).
		Where("user_id = ?", userUUID).
		Where("(left_at IS NULL OR left_at = '0001-01-01 00:00:00+00')").
		Count(&participantCount)
	
	if participantCount == 0 {
		// No participants found - return empty array
		return []*models.Chat{}, nil
	}

	// First, get chat IDs that the user is a participant of
	var chatIDs []uuid.UUID
	err = r.db.
		Model(&models.ChatParticipant{}).
		Distinct("chat_id").
		Where("user_id = ?", userUUID).
		Where("(left_at IS NULL OR left_at = '0001-01-01 00:00:00+00')").
		Pluck("chat_id", &chatIDs).
		Error

	if err != nil {
		return nil, err
	}

	if len(chatIDs) == 0 {
		return []*models.Chat{}, nil
	}

	// Now fetch the actual chats with all relationships
	err = r.db.
		Where("id IN ?", chatIDs).
		Preload("Participants", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User")
		}).
		Preload("LastMessage", func(db *gorm.DB) *gorm.DB {
			return db.Preload("Sender")
		}).
		Order("last_message_at DESC NULLS LAST, created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&chats).Error

	if err != nil {
		return nil, err
	}

	return chats, nil
}

// GetDMChatBetweenUsers finds existing DM chat between two users
func (r *ChatRepository) GetDMChatBetweenUsers(user1ID, user2ID string) (*models.Chat, error) {
	var chat models.Chat

	err := r.db.
		Where("type = ?", "dm").
		Where("id IN (SELECT chat_id FROM chat_participants WHERE user_id = ?)", user1ID).
		Where("id IN (SELECT chat_id FROM chat_participants WHERE user_id = ?)", user2ID).
		Preload("Participants.User").
		Preload("LastMessage").
		First(&chat).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Not an error, just doesn't exist
		}
		return nil, err
	}

	return &chat, nil
}

// CreateChatParticipant adds a participant to a chat
func (r *ChatRepository) CreateChatParticipant(participant *models.ChatParticipant) error {
	return r.db.Create(participant).Error
}

// GetChatParticipant retrieves a specific chat participant
func (r *ChatRepository) GetChatParticipant(chatID, userID string) (*models.ChatParticipant, error) {
	var participant models.ChatParticipant
	err := r.db.
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		First(&participant).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotParticipant
		}
		return nil, err
	}

	return &participant, nil
}

// IsParticipant checks if a user is a participant in a chat
func (r *ChatRepository) IsParticipant(chatID, userID string) bool {
	var count int64
	r.db.Model(&models.ChatParticipant{}).
		Where("chat_id = ? AND user_id = ? AND left_at IS NULL", chatID, userID).
		Count(&count)

	return count > 0
}

// CreateMessage creates a new message
func (r *ChatRepository) CreateMessage(message *models.Message) error {
	return r.db.Create(message).Error
}

// GetChatMessages retrieves messages for a chat
func (r *ChatRepository) GetChatMessages(chatID string, limit int, beforeID *string) ([]*models.Message, error) {
	var messages []*models.Message

	query := r.db.
		Where("chat_id = ? AND deleted_at IS NULL", chatID).
		Preload("Sender").
		Preload("ReplyTo").
		Order("created_at DESC")

	// Pagination using cursor (beforeID)
	if beforeID != nil && *beforeID != "" {
		var beforeMsg models.Message
		if err := r.db.Where("id = ?", *beforeID).First(&beforeMsg).Error; err == nil {
			query = query.Where("created_at < ?", beforeMsg.CreatedAt)
		}
	}

	err := query.Limit(limit).Find(&messages).Error
	if err != nil {
		return nil, err
	}

	// Reverse to chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

// GetMessageByID retrieves a specific message
func (r *ChatRepository) GetMessageByID(messageID string) (*models.Message, error) {
	var message models.Message
	err := r.db.
		Preload("Sender").
		Preload("ReplyTo").
		Where("id = ?", messageID).
		First(&message).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMessageNotFound
		}
		return nil, err
	}

	return &message, nil
}

// UpdateChatLastMessage updates the last message reference in a chat
func (r *ChatRepository) UpdateChatLastMessage(chatID string, messageID string) error {
	msgUUID, err := uuid.Parse(messageID)
	if err != nil {
		return err
	}

	now := time.Now()
	return r.db.Model(&models.Chat{}).
		Where("id = ?", chatID).
		Updates(map[string]interface{}{
			"last_message_id": msgUUID,
			"last_message_at": now,
			"updated_at":      now,
		}).Error
}

// UpdateUnreadCount updates the unread count for a participant
func (r *ChatRepository) UpdateUnreadCount(chatID, userID string, increment bool) error {
	if increment {
		return r.db.Model(&models.ChatParticipant{}).
			Where("chat_id = ? AND user_id = ?", chatID, userID).
			UpdateColumn("unread_count", gorm.Expr("unread_count + ?", 1)).Error
	}

	return r.db.Model(&models.ChatParticipant{}).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		Update("unread_count", 0).Error
}

// MarkMessagesAsRead marks messages as read and creates receipts
func (r *ChatRepository) MarkMessagesAsRead(chatID, userID string, messageIDs []string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Create read receipts
		for _, msgID := range messageIDs {
			receipt := &models.MessageReceipt{
				MessageID: uuid.MustParse(msgID),
				UserID:    uuid.MustParse(userID),
				Status:    "read",
				Timestamp: time.Now(),
			}

			// Use ON CONFLICT DO NOTHING to avoid duplicates
			if err := tx.Create(receipt).Error; err != nil {
				// Ignore duplicate key errors
				if !errors.Is(err, gorm.ErrDuplicatedKey) {
					return err
				}
			}
		}

		// Update participant's last read info
		if len(messageIDs) > 0 {
			lastMsgID := messageIDs[len(messageIDs)-1]
			now := time.Now()

			err := tx.Model(&models.ChatParticipant{}).
				Where("chat_id = ? AND user_id = ?", chatID, userID).
				Updates(map[string]interface{}{
					"last_read_message_id": lastMsgID,
					"last_read_at":         now,
					"unread_count":         0,
				}).Error

			if err != nil {
				return err
			}
		}

		return nil
	})
}

// CreateMessageReceipt creates a delivery/read receipt
func (r *ChatRepository) CreateMessageReceipt(receipt *models.MessageReceipt) error {
	return r.db.Create(receipt).Error
}

// GetMessageReceipts retrieves all receipts for a message
func (r *ChatRepository) GetMessageReceipts(messageID string) ([]*models.MessageReceipt, error) {
	var receipts []*models.MessageReceipt
	err := r.db.
		Where("message_id = ?", messageID).
		Preload("User").
		Find(&receipts).Error

	if err != nil {
		return nil, err
	}

	return receipts, nil
}

// UpdateChatParticipant updates participant settings
func (r *ChatRepository) UpdateChatParticipant(chatID, userID string, updates map[string]interface{}) error {
	return r.db.Model(&models.ChatParticipant{}).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		Updates(updates).Error
}

// DeleteMessage soft deletes a message
func (r *ChatRepository) DeleteMessage(messageID, userID string) error {
	var message models.Message
	err := r.db.Where("id = ? AND sender_id = ?", messageID, userID).First(&message).Error
	if err != nil {
		return err
	}

	return r.db.Delete(&message).Error
}

// GetUnreadCount gets unread message count for a user in a chat
func (r *ChatRepository) GetUnreadCount(chatID, userID string) (int, error) {
	var participant models.ChatParticipant
	err := r.db.
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		First(&participant).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, ErrNotParticipant
		}
		return 0, err
	}

	return participant.UnreadCount, nil
}

// GetChatStatistics retrieves statistics for a chat
func (r *ChatRepository) GetChatStatistics(chatID string) (map[string]interface{}, error) {
	var totalMessages int64
	var participants int64

	r.db.Model(&models.Message{}).Where("chat_id = ?", chatID).Count(&totalMessages)
	r.db.Model(&models.ChatParticipant{}).Where("chat_id = ? AND left_at IS NULL", chatID).Count(&participants)

	return map[string]interface{}{
		"total_messages": totalMessages,
		"participants":   participants,
	}, nil
}

// SearchMessages searches for messages in a chat
func (r *ChatRepository) SearchMessages(chatID string, query string, limit int) ([]*models.Message, error) {
	var messages []*models.Message

	searchPattern := fmt.Sprintf("%%%s%%", query)

	err := r.db.
		Where("chat_id = ? AND deleted_at IS NULL", chatID).
		Where("content ILIKE ?", searchPattern).
		Preload("Sender").
		Order("created_at DESC").
		Limit(limit).
		Find(&messages).Error

	if err != nil {
		return nil, err
	}

	return messages, nil
}
