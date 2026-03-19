package models

import (
	"time"

	"gorm.io/gorm"
)

// VerificationRequest represents a user's request for profile verification
type VerificationRequest struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID      string    `json:"user_id" gorm:"type:uuid;not null;index"`
	User        User      `json:"user" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	DocumentURL string    `json:"document_url" gorm:"type:text"`
	Message     string    `json:"message" gorm:"type:text"`
	Status      string    `json:"status" gorm:"type:varchar(20);default:'pending'"` // pending, approved, rejected
	ReviewedBy  *string   `json:"reviewed_by" gorm:"type:uuid;index"`               // Admin user ID who reviewed
	ReviewedAt  *time.Time `json:"reviewed_at"`
	RejectionReason string `json:"rejection_reason" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (VerificationRequest) TableName() string {
	return "verification_requests"
}

