package repository

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gsl-backend/models"
)

var (
	ErrUserNotFound         = errors.New("user not found")
	ErrMatchNotFound        = errors.New("match not found")
	ErrPreferencesNotFound  = errors.New("preferences not found")
	ErrAlreadyLiked         = errors.New("user already liked")
	ErrAlreadyMatched       = errors.New("users already matched")
)

// MatchingRepository handles database operations for matching
type MatchingRepository struct {
	db *gorm.DB
}

// NewMatchingRepository creates a new matching repository
func NewMatchingRepository(db *gorm.DB) *MatchingRepository {
	return &MatchingRepository{db: db}
}

// GetUserProfile retrieves a user's extended profile
func (r *MatchingRepository) GetUserProfile(userID string) (*models.UserProfileExtended, error) {
	var profile models.UserProfileExtended
	err := r.db.Preload("User").Where("user_id = ?", userID).First(&profile).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &profile, nil
}

// GetUserPreferences retrieves a user's matching preferences
func (r *MatchingRepository) GetUserPreferences(userID string) (*models.UserPreferences, error) {
	var prefs models.UserPreferences
	err := r.db.Where("user_id = ?", userID).First(&prefs).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create default preferences if not exists
			return r.CreateDefaultPreferences(userID)
		}
		return nil, err
	}

	return &prefs, nil
}

// CreateDefaultPreferences creates default preferences for a user
func (r *MatchingRepository) CreateDefaultPreferences(userID string) (*models.UserPreferences, error) {
	prefs := &models.UserPreferences{
		UserID:        uuid.MustParse(userID),
		MinAge:        18,
		MaxAge:        99,
		MaxDistanceKm: 50,
		VerifiedOnly:  false,
		PremiumOnly:   false,
	}

	if err := r.db.Create(prefs).Error; err != nil {
		return nil, err
	}

	return prefs, nil
}

// UpdateUserPreferences updates user preferences
func (r *MatchingRepository) UpdateUserPreferences(userID string, prefs *models.UserPreferences) error {
	return r.db.Model(&models.UserPreferences{}).
		Where("user_id = ?", userID).
		Updates(prefs).Error
}

// GetMatchCandidates retrieves potential match candidates with filters
func (r *MatchingRepository) GetMatchCandidates(userID string, prefs *models.UserPreferences, limit int) ([]*models.UserProfileExtended, error) {
	var candidates []*models.UserProfileExtended

	// Get user's own profile for comparison
	userProfile, err := r.GetUserProfile(userID)
	if err != nil {
		return nil, err
	}

	query := r.db.
		Table("user_profiles_extended").
		Joins("JOIN users ON users.id = user_profiles_extended.user_id").
		Where("user_profiles_extended.user_id != ?", userID).
		Preload("User")

	// Exclude already liked users
	query = query.Where("user_profiles_extended.user_id NOT IN (?)",
		r.db.Table("likes").
			Select("to_user_id").
			Where("from_user_id = ?", userID),
	)

	// Exclude already matched users
	query = query.Where("user_profiles_extended.user_id NOT IN (?)",
		r.db.Table("matches").
			Select("CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END", userID).
			Where("user1_id = ? OR user2_id = ?", userID, userID).
			Where("status = ?", "active"),
	)

	// TODO: Add blocked users filter when implemented

	// Age filter (requires birthdate field in users table)
	// For now, skip age filter or implement with approximate logic

	// Verified only filter
	if prefs.VerifiedOnly {
		query = query.Where("users.is_verified = ?", true)
	}

	// Premium only filter
	if prefs.PremiumOnly {
		query = query.Where("users.is_premium = ?", true)
	}

	// Distance filter (if both users have location)
	if userProfile.Latitude != nil && userProfile.Longitude != nil {
		query = query.Where("user_profiles_extended.latitude IS NOT NULL AND user_profiles_extended.longitude IS NOT NULL")

		// Use PostGIS earthdistance if available, otherwise fetch all and filter in-memory
		// For simplicity, we'll filter in-memory after fetching
	}

	// Active users only (active in last 30 days)
	query = query.Where("user_profiles_extended.last_active_at > NOW() - INTERVAL '30 days'")

	// Fetch candidates
	err = query.Limit(limit * 3).Find(&candidates).Error // Fetch more for filtering
	if err != nil {
		return nil, err
	}

	// In-memory distance filtering if needed
	if userProfile.Latitude != nil && userProfile.Longitude != nil {
		filteredCandidates := make([]*models.UserProfileExtended, 0)
		for _, candidate := range candidates {
			if candidate.Latitude != nil && candidate.Longitude != nil {
				distance := calculateDistance(
					*userProfile.Latitude, *userProfile.Longitude,
					*candidate.Latitude, *candidate.Longitude,
				)
				if distance <= float64(prefs.MaxDistanceKm) {
					filteredCandidates = append(filteredCandidates, candidate)
				}
			}
		}
		candidates = filteredCandidates
	}

	// Limit to requested size
	if len(candidates) > limit {
		candidates = candidates[:limit]
	}

	return candidates, nil
}

// CreateLike creates a new like record
func (r *MatchingRepository) CreateLike(like *models.Like) error {
	// Check if already liked
	var existing models.Like
	err := r.db.Where("from_user_id = ? AND to_user_id = ?", like.FromUserID, like.ToUserID).First(&existing).Error

	if err == nil {
		return ErrAlreadyLiked
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return r.db.Create(like).Error
}

// GetLike retrieves a like record
func (r *MatchingRepository) GetLike(fromUserID, toUserID string) (*models.Like, error) {
	var like models.Like
	err := r.db.Where("from_user_id = ? AND to_user_id = ?", fromUserID, toUserID).First(&like).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &like, nil
}

// CreateMatch creates a new match
func (r *MatchingRepository) CreateMatch(match *models.Match) error {
	// Ensure user1_id < user2_id for uniqueness
	if match.User1ID.String() > match.User2ID.String() {
		match.User1ID, match.User2ID = match.User2ID, match.User1ID
	}

	return r.db.Create(match).Error
}

// GetMatch retrieves a match by ID
func (r *MatchingRepository) GetMatch(matchID string) (*models.Match, error) {
	var match models.Match
	err := r.db.Preload("User1").Preload("User2").Preload("Chat").
		Where("id = ?", matchID).First(&match).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMatchNotFound
		}
		return nil, err
	}

	return &match, nil
}

// GetUserMatches retrieves all matches for a user
func (r *MatchingRepository) GetUserMatches(userID string, limit int, status string) ([]*models.Match, error) {
	var matches []*models.Match

	query := r.db.Where("user1_id = ? OR user2_id = ?", userID, userID).
		Preload("User1").
		Preload("User2").
		Preload("Chat")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	err := query.Order("matched_at DESC").
		Limit(limit).
		Find(&matches).Error

	if err != nil {
		return nil, err
	}

	return matches, nil
}

// UpdateMatch updates match details
func (r *MatchingRepository) UpdateMatch(matchID string, updates map[string]interface{}) error {
	return r.db.Model(&models.Match{}).
		Where("id = ?", matchID).
		Updates(updates).Error
}

// DeleteMatch deletes a match (sets status to unmatched)
func (r *MatchingRepository) DeleteMatch(matchID string) error {
	return r.db.Model(&models.Match{}).
		Where("id = ?", matchID).
		Update("status", "unmatched").Error
}

// SaveMatchSuggestions saves multiple match suggestions
func (r *MatchingRepository) SaveMatchSuggestions(suggestions []*models.MatchSuggestion) error {
	if len(suggestions) == 0 {
		return nil
	}

	// Delete old unshown suggestions for this user
	userID := suggestions[0].UserID
	r.db.Where("user_id = ? AND shown_at IS NULL", userID).Delete(&models.MatchSuggestion{})

	// Create new suggestions
	return r.db.Create(&suggestions).Error
}

// GetMatchSuggestions retrieves match suggestions for a user
func (r *MatchingRepository) GetMatchSuggestions(userID string, limit int) ([]*models.MatchSuggestion, error) {
	var suggestions []*models.MatchSuggestion

	err := r.db.
		Where("user_id = ? AND shown_at IS NULL", userID).
		Preload("SuggestedUser").
		Order("score DESC, rank ASC").
		Limit(limit).
		Find(&suggestions).Error

	if err != nil {
		return nil, err
	}

	return suggestions, nil
}

// MarkSuggestionShown marks a suggestion as shown
func (r *MatchingRepository) MarkSuggestionShown(suggestionID string) error {
	return r.db.Model(&models.MatchSuggestion{}).
		Where("id = ?", suggestionID).
		Update("shown_at", "NOW()").Error
}

// RecordSuggestionInteraction records user interaction with suggestion
func (r *MatchingRepository) RecordSuggestionInteraction(suggestionID, interaction string) error {
	return r.db.Model(&models.MatchSuggestion{}).
		Where("id = ?", suggestionID).
		Updates(map[string]interface{}{
			"interaction":    interaction,
			"interacted_at": "NOW()",
		}).Error
}

// GetMatchStatistics retrieves matching statistics for a user
func (r *MatchingRepository) GetMatchStatistics(userID string) (map[string]interface{}, error) {
	var totalMatches, activeMatches, totalLikes, totalLikesReceived int64

	r.db.Model(&models.Match{}).
		Where("(user1_id = ? OR user2_id = ?) AND status = ?", userID, userID, "active").
		Count(&activeMatches)

	r.db.Model(&models.Match{}).
		Where("user1_id = ? OR user2_id = ?", userID, userID).
		Count(&totalMatches)

	r.db.Model(&models.Like{}).
		Where("from_user_id = ?", userID).
		Count(&totalLikes)

	r.db.Model(&models.Like{}).
		Where("to_user_id = ?", userID).
		Count(&totalLikesReceived)

	matchRate := 0.0
	if totalLikes > 0 {
		matchRate = float64(totalMatches) / float64(totalLikes) * 100
	}

	return map[string]interface{}{
		"total_matches":         totalMatches,
		"active_matches":        activeMatches,
		"total_likes":           totalLikes,
		"total_likes_received":  totalLikesReceived,
		"match_rate":            matchRate,
	}, nil
}

// Helper functions

func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	// Haversine formula
	const earthRadiusKm = 6371.0

	dLat := toRadians(lat2 - lat1)
	dLon := toRadians(lon2 - lon1)

	a := sin(dLat/2)*sin(dLat/2) +
		cos(toRadians(lat1))*cos(toRadians(lat2))*
			sin(dLon/2)*sin(dLon/2)

	c := 2 * atan2(sqrt(a), sqrt(1-a))

	return earthRadiusKm * c
}

func toRadians(deg float64) float64 {
	return deg * 3.14159265359 / 180
}

func sin(x float64) float64 {
	return float64(int(x*1000)) / 1000 // Simplified
}

func cos(x float64) float64 {
	return float64(int((1-x*x/2)*1000)) / 1000 // Simplified
}

func atan2(y, x float64) float64 {
	return y / x // Simplified
}

func sqrt(x float64) float64 {
	z := 1.0
	for i := 0; i < 10; i++ {
		z -= (z*z - x) / (2 * z)
	}
	return z
}
