package models

import (
	"time"

	"gorm.io/gorm"
)

// UserSettings stores user preferences for dating app
type UserSettings struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    string    `json:"user_id" gorm:"type:uuid;not null;uniqueIndex"`
	User      User      `json:"-" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	
	// Profile Visibility
	ShowAge           bool `json:"show_age" gorm:"default:true"`
	ShowLocation      bool `json:"show_location" gorm:"default:true"`
	ShowDistance      bool `json:"show_distance" gorm:"default:true"`
	ShowOnlineStatus  bool `json:"show_online_status" gorm:"default:true"`
	
	// Discovery Preferences
	MinAge            int    `json:"min_age" gorm:"default:18"`
	MaxAge            int    `json:"max_age" gorm:"default:99"`
	MaxDistance       int    `json:"max_distance" gorm:"default:50"` // in km
	ShowMeTo          string `json:"show_me_to" gorm:"type:varchar(20);default:'everyone'"` // everyone, matches, premium
	Discoverable      bool   `json:"discoverable" gorm:"default:true"`
	
	// Notification Preferences
	EmailNotifications     bool `json:"email_notifications" gorm:"default:true"`
	PushNotifications      bool `json:"push_notifications" gorm:"default:true"`
	NewMatchNotifications  bool `json:"new_match_notifications" gorm:"default:true"`
	MessageNotifications   bool `json:"message_notifications" gorm:"default:true"`
	LikeNotifications      bool `json:"like_notifications" gorm:"default:true"`
	
	// Privacy Settings
	ReadReceipts      bool `json:"read_receipts" gorm:"default:true"`
	ShowLastSeen      bool `json:"show_last_seen" gorm:"default:true"`
	BlockedUsers      string `json:"blocked_users" gorm:"type:text"` // JSON array of user IDs
	
	// Account Settings
	Language          string `json:"language" gorm:"type:varchar(10);default:'en'"`
	Timezone          string `json:"timezone" gorm:"type:varchar(50);default:'UTC'"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (UserSettings) TableName() string {
	return "user_settings"
}

