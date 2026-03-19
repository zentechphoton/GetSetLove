package models

import (
	"time"
)

// Settings is a stub model for future settings feature
type Settings struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Key         string    `json:"key" gorm:"unique;not null;index"`
	Value       string    `json:"value" gorm:"type:text"`
	Description *string   `json:"description,omitempty" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Settings) TableName() string {
	return "settings"
}







