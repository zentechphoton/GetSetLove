package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID         string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Username   string    `json:"username" gorm:"unique;not null"`
	Email      string    `json:"email" gorm:"unique;not null"`
	Password   string    `json:"-" gorm:"not null"`
	FirstName  string    `json:"first_name" gorm:"column:first_name"`
	LastName   string    `json:"last_name" gorm:"column:last_name"`
	Avatar     string    `json:"avatar"`
	Role       string    `json:"role" gorm:"type:varchar(20);default:'user'"` // user, admin, super_admin
	IsVerified bool      `json:"is_verified" gorm:"default:false"`
	IsPremium  bool      `json:"is_premium" gorm:"default:false"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for User model
func (User) TableName() string {
	return "users"
}











