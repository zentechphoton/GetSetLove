package models

import (
	"time"

	"gorm.io/gorm"
)

type News struct {
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

// TableName specifies the table name for News model
func (News) TableName() string {
	return "news"
}

// GraphQL compatibility methods (not used in REST API)
func (n *News) FeaturedImage() string {
	return n.Image
}

func (n *News) IsPublished() bool {
	return n.Status == "published"
}

func (n *News) Views() int {
	return 0 // Not implemented yet
}

func (n *News) Tags() string {
	return "" // Not implemented yet
}

func (n *News) Category() string {
	return "" // Not implemented yet
}
