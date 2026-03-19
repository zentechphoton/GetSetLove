package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// UserPreferences stores user's matching preferences
type UserPreferences struct {
	UserID           uuid.UUID      `gorm:"type:uuid;primary_key" json:"user_id"`
	MinAge           int            `gorm:"default:18" json:"min_age"`
	MaxAge           int            `gorm:"default:99" json:"max_age"`
	MaxDistanceKm    int            `gorm:"default:50" json:"max_distance_km"`
	GenderPreference pq.StringArray `gorm:"type:varchar(50)[]" json:"gender_preference"`
	RelationshipGoals pq.StringArray `gorm:"type:varchar(50)[]" json:"relationship_goals"`
	Interests        pq.StringArray `gorm:"type:varchar(100)[]" json:"interests"`
	Dealbreakers     pq.StringArray `gorm:"type:varchar(100)[]" json:"dealbreakers"`
	VerifiedOnly     bool           `gorm:"default:false" json:"verified_only"`
	PremiumOnly      bool           `gorm:"default:false" json:"premium_only"`
	UpdatedAt        time.Time      `gorm:"not null;default:now()" json:"updated_at"`

	// Relationships
	User             User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// UserProfileExtended stores extended profile data for matching
type UserProfileExtended struct {
	UserID             uuid.UUID      `gorm:"type:uuid;primary_key" json:"user_id"`
	Bio                *string        `gorm:"type:text" json:"bio,omitempty"`
	HeightCm           *int           `json:"height_cm,omitempty"`
	Education          *string        `gorm:"type:varchar(100)" json:"education,omitempty"`
	Occupation         *string        `gorm:"type:varchar(100)" json:"occupation,omitempty"`
	Religion           *string        `gorm:"type:varchar(50)" json:"religion,omitempty"`
	Smoking            *string        `gorm:"type:varchar(20)" json:"smoking,omitempty"`
	Drinking           *string        `gorm:"type:varchar(20)" json:"drinking,omitempty"`
	Latitude           *float64       `gorm:"type:decimal(10,8)" json:"latitude,omitempty"`
	Longitude          *float64       `gorm:"type:decimal(11,8)" json:"longitude,omitempty"`
	City               *string        `gorm:"type:varchar(100)" json:"city,omitempty"`
	Country            *string        `gorm:"type:varchar(100)" json:"country,omitempty"`
	ResponseRate       float64        `gorm:"type:decimal(5,2);default:0.0" json:"response_rate"`
	ProfileCompleteness int           `gorm:"default:0" json:"profile_completeness"`
	LastActiveAt       *time.Time     `json:"last_active_at,omitempty"`
	PhotoURLs          pq.StringArray `gorm:"type:text[]" json:"photo_urls"`
	VerifiedPhoto      bool           `gorm:"default:false" json:"verified_photo"`
	UpdatedAt          time.Time      `gorm:"not null;default:now()" json:"updated_at"`

	// Computed fields for matching
	Age                *int           `gorm:"-" json:"age,omitempty"`
	Interests          pq.StringArray `gorm:"-" json:"interests,omitempty"`

	// Relationships
	User               User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// Match represents a mutual match between two users
type Match struct {
	ID              uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	User1ID         uuid.UUID  `gorm:"type:uuid;not null;index:idx_matches_user1" json:"user1_id"`
	User2ID         uuid.UUID  `gorm:"type:uuid;not null;index:idx_matches_user2" json:"user2_id"`
	MatchedAt       time.Time  `gorm:"not null;default:now()" json:"matched_at"`
	MatchScore      *float64   `gorm:"type:decimal(5,2)" json:"match_score,omitempty"`
	MatchReason     *string    `gorm:"type:text" json:"match_reason,omitempty"`
	Status          string     `gorm:"type:varchar(20);default:'active'" json:"status"` // 'active', 'unmatched', 'blocked'
	ChatID          *uuid.UUID `gorm:"type:uuid" json:"chat_id,omitempty"`
	FirstMessageAt  *time.Time `json:"first_message_at,omitempty"`

	// Relationships
	User1           User       `gorm:"foreignKey:User1ID" json:"user1,omitempty"`
	User2           User       `gorm:"foreignKey:User2ID" json:"user2,omitempty"`
	Chat            *Chat      `gorm:"foreignKey:ChatID" json:"chat,omitempty"`
}

// Like represents a like/pass/superlike action
type Like struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FromUserID  uuid.UUID `gorm:"type:uuid;not null;index:idx_likes_from_user" json:"from_user_id"`
	ToUserID    uuid.UUID `gorm:"type:uuid;not null;index:idx_likes_to_user" json:"to_user_id"`
	CreatedAt   time.Time `gorm:"not null;default:now()" json:"created_at"`
	LikeType    string    `gorm:"type:varchar(20);default:'like'" json:"like_type"` // 'like', 'superlike', 'pass'

	// Relationships
	FromUser    User      `gorm:"foreignKey:FromUserID" json:"from_user,omitempty"`
	ToUser      User      `gorm:"foreignKey:ToUserID" json:"to_user,omitempty"`
}

// MatchSuggestion represents a generated match suggestion
type MatchSuggestion struct {
	ID              uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;not null;index:idx_suggestions_user_score" json:"user_id"`
	SuggestedUserID uuid.UUID  `gorm:"type:uuid;not null" json:"suggested_user_id"`
	Score           float64    `gorm:"type:decimal(5,2);not null;index:idx_suggestions_user_score" json:"score"`
	ScoreBreakdown  JSONMap    `gorm:"type:jsonb" json:"score_breakdown,omitempty"`
	GeneratedAt     time.Time  `gorm:"not null;default:now()" json:"generated_at"`
	ShownAt         *time.Time `gorm:"index:idx_suggestions_shown" json:"shown_at,omitempty"`
	Interaction     *string    `gorm:"type:varchar(20)" json:"interaction,omitempty"` // 'like', 'pass', 'superlike'
	InteractedAt    *time.Time `json:"interacted_at,omitempty"`
	Rank            *int       `json:"rank,omitempty"`
	BatchID         *uuid.UUID `gorm:"type:uuid" json:"batch_id,omitempty"`

	// Relationships
	User            User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	SuggestedUser   User       `gorm:"foreignKey:SuggestedUserID" json:"suggested_user,omitempty"`
}

// TableName overrides
func (UserPreferences) TableName() string {
	return "user_preferences"
}

func (UserProfileExtended) TableName() string {
	return "user_profiles_extended"
}

func (Match) TableName() string {
	return "matches"
}

func (Like) TableName() string {
	return "likes"
}

func (MatchSuggestion) TableName() string {
	return "match_suggestions"
}

// BeforeCreate hooks
func (m *Match) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	// Ensure user1_id < user2_id for uniqueness constraint
	if m.User1ID.String() > m.User2ID.String() {
		m.User1ID, m.User2ID = m.User2ID, m.User1ID
	}
	return nil
}

func (l *Like) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}

func (ms *MatchSuggestion) BeforeCreate(tx *gorm.DB) error {
	if ms.ID == uuid.Nil {
		ms.ID = uuid.New()
	}
	return nil
}

// Helper methods

// GetOtherUserID returns the other user's ID in a match
func (m *Match) GetOtherUserID(currentUserID string) string {
	if m.User1ID.String() == currentUserID {
		return m.User2ID.String()
	}
	return m.User1ID.String()
}

// IsActive checks if match is active
func (m *Match) IsActive() bool {
	return m.Status == "active"
}
