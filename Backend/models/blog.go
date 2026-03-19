package models

import (
	"time"

	"gorm.io/gorm"
)

type Blog struct {
	ID        string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Title     string         `json:"title" gorm:"not null"`
	Slug      string         `json:"slug" gorm:"unique;not null;index"`
	Excerpt   string         `json:"excerpt" gorm:"type:text"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Image     string         `json:"image" gorm:"type:text"`
	Status    string         `json:"status" gorm:"type:varchar(20);default:'draft';index"` // draft, published
	AuthorID  string         `json:"author_id" gorm:"type:uuid;not null;index"`
	Author    User           `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for Blog model
func (Blog) TableName() string {
	return "blogs"
}

// BlogSettings stores admin settings for blog feature
type BlogSettings struct {
	ID             string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserBlogAccess bool      `json:"user_blog_access" gorm:"default:false"` // If true, users can create blogs
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// TableName specifies the table name for BlogSettings model
func (BlogSettings) TableName() string {
	return "blog_settings"
}

// GraphQL compatibility methods (not used in REST API)
func (b *Blog) FeaturedImage() string {
	return b.Image
}

func (b *Blog) IsPublished() bool {
	return b.Status == "published"
}

func (b *Blog) Views() int {
	return 0 // Not implemented yet
}

func (b *Blog) Tags() string {
	return "" // Not implemented yet
}
