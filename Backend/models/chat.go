package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Chat represents a conversation between users
type Chat struct {
	ID              uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Type            string     `gorm:"type:varchar(20);not null" json:"type"` // 'dm' or 'group'
	CreatedAt       time.Time  `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"not null;default:now()" json:"updated_at"`
	LastMessageID   *uuid.UUID `gorm:"type:uuid" json:"last_message_id,omitempty"`
	LastMessageAt   *time.Time `json:"last_message_at,omitempty"`
	Metadata        JSONMap    `gorm:"type:jsonb;default:'{}'" json:"metadata,omitempty"`

	// Relationships
	Participants    []ChatParticipant `gorm:"foreignKey:ChatID" json:"participants,omitempty"`
	Messages        []Message         `gorm:"foreignKey:ChatID" json:"messages,omitempty"`
	LastMessage     *Message          `gorm:"foreignKey:LastMessageID" json:"last_message,omitempty"`
}

// ChatParticipant represents a user's participation in a chat
type ChatParticipant struct {
	ID                uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ChatID            uuid.UUID  `gorm:"type:uuid;not null" json:"chat_id"`
	UserID            uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	Role              string     `gorm:"type:varchar(20);default:'member'" json:"role"` // 'admin' or 'member'
	JoinedAt          time.Time  `gorm:"not null;default:now()" json:"joined_at"`
	LeftAt            *time.Time `json:"left_at,omitempty"`
	Muted             bool       `gorm:"default:false" json:"muted"`
	Archived          bool       `gorm:"default:false" json:"archived"`
	LastReadMessageID *uuid.UUID `gorm:"type:uuid" json:"last_read_message_id,omitempty"`
	LastReadAt        *time.Time `json:"last_read_at,omitempty"`
	UnreadCount       int        `gorm:"default:0" json:"unread_count"`

	// Relationships
	Chat              Chat       `gorm:"foreignKey:ChatID" json:"chat,omitempty"`
	User              User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// Message represents a message in a chat
type Message struct {
	ID                 uuid.UUID       `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ChatID             uuid.UUID       `gorm:"type:uuid;not null;index:idx_messages_chat_created" json:"chat_id"`
	SenderID           uuid.UUID       `gorm:"type:uuid;not null;index" json:"sender_id"`

	// Content
	Content            *string         `gorm:"type:text" json:"content,omitempty"`
	MediaType          *string         `gorm:"type:varchar(20)" json:"media_type,omitempty"` // 'image', 'video', 'audio', 'file'
	MediaURL           *string         `gorm:"type:text" json:"media_url,omitempty"`
	MediaMetadata      JSONMap         `gorm:"type:jsonb" json:"media_metadata,omitempty"`

	// Message metadata
	ReplyToMessageID   *uuid.UUID      `gorm:"type:uuid" json:"reply_to_message_id,omitempty"`
	MessageType        string          `gorm:"type:varchar(20);default:'text'" json:"message_type"` // 'text', 'media', 'system'
	Status             string          `gorm:"type:varchar(20);default:'sent'" json:"status"` // 'sent', 'delivered', 'read', 'failed'

	// Timestamps
	CreatedAt          time.Time       `gorm:"not null;default:now();index:idx_messages_chat_created" json:"created_at"`
	UpdatedAt          *time.Time      `json:"updated_at,omitempty"`
	DeletedAt          gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`

	// Ordering
	SequenceNumber     int64           `gorm:"autoIncrement;not null" json:"sequence_number"`

	// Moderation
	IsFlagged          bool            `gorm:"default:false" json:"is_flagged"`
	ModerationStatus   string          `gorm:"type:varchar(20);default:'pending'" json:"moderation_status"`

	// Metadata
	Metadata           JSONMap         `gorm:"type:jsonb;default:'{}'" json:"metadata,omitempty"`

	// Relationships
	Chat               Chat            `gorm:"foreignKey:ChatID" json:"chat,omitempty"`
	Sender             User            `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	ReplyTo            *Message        `gorm:"foreignKey:ReplyToMessageID" json:"reply_to,omitempty"`
	Receipts           []MessageReceipt `gorm:"foreignKey:MessageID" json:"receipts,omitempty"`
}

// MessageReceipt tracks message delivery and read status
type MessageReceipt struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	MessageID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_receipt_unique" json:"message_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_receipt_unique" json:"user_id"`
	Status    string    `gorm:"type:varchar(20);not null;uniqueIndex:idx_receipt_unique" json:"status"` // 'delivered' or 'read'
	Timestamp time.Time `gorm:"not null;default:now()" json:"timestamp"`

	// Relationships
	Message   Message   `gorm:"foreignKey:MessageID" json:"message,omitempty"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName overrides
func (Chat) TableName() string {
	return "chats"
}

func (ChatParticipant) TableName() string {
	return "chat_participants"
}

func (Message) TableName() string {
	return "messages"
}

func (MessageReceipt) TableName() string {
	return "message_receipts"
}

// BeforeCreate hook for Chat
func (c *Chat) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook for Message
func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
