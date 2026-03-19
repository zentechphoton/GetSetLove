package matching

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"sort"
	"time"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
	"gorm.io/gorm"
	"gsl-backend/models"
	"gsl-backend/services/matching/repository"
	"gsl-backend/services/matching/scorer"
)

// MatchingService handles matching business logic
type MatchingService struct {
	repo   *repository.MatchingRepository
	scorer *scorer.MatchScorer
	nc     *nats.Conn
	js     nats.JetStreamContext
	db     *gorm.DB
}

// NewMatchingService creates a new matching service
func NewMatchingService(db *gorm.DB, nc *nats.Conn, js nats.JetStreamContext) *MatchingService {
	return &MatchingService{
		repo:   repository.NewMatchingRepository(db),
		scorer: scorer.NewMatchScorer(),
		nc:     nc,
		js:     js,
		db:     db,
	}
}

// GenerateSuggestions creates match suggestions for a user
func (s *MatchingService) GenerateSuggestions(ctx context.Context, userID string, limit int) ([]*models.MatchSuggestion, error) {
	// 1. Load user profile & preferences
	userProfile, err := s.repo.GetUserProfile(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user profile: %w", err)
	}

	userPrefs, err := s.repo.GetUserPreferences(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user preferences: %w", err)
	}

	// 2. Get candidate pool (apply hard filters in DB)
	candidates, err := s.repo.GetMatchCandidates(userID, userPrefs, 100)
	if err != nil {
		return nil, fmt.Errorf("failed to get candidates: %w", err)
	}

	if len(candidates) == 0 {
		log.Printf("No candidates found for user %s", userID)
		return []*models.MatchSuggestion{}, nil
	}

	// 3. Score each candidate
	suggestions := make([]*models.MatchSuggestion, 0, len(candidates))
	batchID := uuid.New()

	for _, candidate := range candidates {
		// Get candidate's preferences
		candidatePrefs, err := s.repo.GetUserPreferences(candidate.UserID.String())
		if err != nil {
			log.Printf("⚠️  Failed to get preferences for candidate %s: %v", candidate.UserID, err)
			continue
		}

		// Calculate match score
		score := s.scorer.CalculateMatchScore(
			&userProfile.User,
			userProfile,
			userPrefs,
			&candidate.User,
			candidate,
			candidatePrefs,
		)

		// Only include if score meets threshold
		if score >= 50.0 {
			scoreBreakdown := s.scorer.GetScoreBreakdown(
				&userProfile.User,
				userProfile,
				userPrefs,
				&candidate.User,
				candidate,
				candidatePrefs,
			)

			suggestion := &models.MatchSuggestion{
				UserID:          uuid.MustParse(userID),
				SuggestedUserID: candidate.UserID,
				Score:           score,
				ScoreBreakdown:  scoreBreakdown,
				BatchID:         &batchID,
			}

			suggestions = append(suggestions, suggestion)
		}
	}

	// 4. Sort by score (descending)
	sort.Slice(suggestions, func(i, j int) bool {
		return suggestions[i].Score > suggestions[j].Score
	})

	// 5. Apply diversity/exploration filters
	suggestions = s.applyDiversityFilters(suggestions)

	// 6. Assign ranks
	for i, suggestion := range suggestions {
		rank := i + 1
		suggestion.Rank = &rank
	}

	// 7. Limit to requested size
	if len(suggestions) > limit {
		suggestions = suggestions[:limit]
	}

	// 8. Save to database
	if err := s.repo.SaveMatchSuggestions(suggestions); err != nil {
		log.Printf("⚠️  Failed to save suggestions: %v", err)
	}

	// 9. Publish event to NATS
	s.publishSuggestionsReady(userID, len(suggestions))

	log.Printf("✅ Generated %d suggestions for user %s", len(suggestions), userID)
	return suggestions, nil
}

// ProcessLike handles when a user likes another user
func (s *MatchingService) ProcessLike(ctx context.Context, fromUserID, toUserID, likeType string) (*LikeResult, error) {
	// 1. Validate users exist
	// TODO: Add user validation

	// 2. Create like record
	like := &models.Like{
		FromUserID: uuid.MustParse(fromUserID),
		ToUserID:   uuid.MustParse(toUserID),
		LikeType:   likeType,
	}

	if err := s.repo.CreateLike(like); err != nil {
		if err == repository.ErrAlreadyLiked {
			return &LikeResult{Success: false, Matched: false}, err
		}
		return nil, fmt.Errorf("failed to create like: %w", err)
	}

	// 3. Check for mutual like
	mutualLike, err := s.repo.GetLike(toUserID, fromUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check mutual like: %w", err)
	}

	if mutualLike != nil && mutualLike.LikeType != "pass" {
		// It's a match!
		match, err := s.createMatch(fromUserID, toUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to create match: %w", err)
		}

		return &LikeResult{
			Success: true,
			Matched: true,
			Match:   match,
		}, nil
	}

	// Not a mutual match, but notify the liked user
	s.publishLikeEvent(toUserID, fromUserID, likeType)

	return &LikeResult{
		Success: true,
		Matched: false,
	}, nil
}

// GetSuggestions retrieves existing suggestions for a user
func (s *MatchingService) GetSuggestions(userID string, limit int) ([]*models.MatchSuggestion, error) {
	suggestions, err := s.repo.GetMatchSuggestions(userID, limit)
	if err != nil {
		return nil, err
	}

	// Mark suggestions as shown
	for _, suggestion := range suggestions {
		go s.repo.MarkSuggestionShown(suggestion.ID.String())
	}

	return suggestions, nil
}

// GetUserMatches retrieves all matches for a user
func (s *MatchingService) GetUserMatches(userID string, limit int, status string) ([]*models.Match, error) {
	return s.repo.GetUserMatches(userID, limit, status)
}

// Unmatch removes a match
func (s *MatchingService) Unmatch(matchID string) error {
	return s.repo.DeleteMatch(matchID)
}

// GetMatchStatistics retrieves match statistics
func (s *MatchingService) GetMatchStatistics(userID string) (map[string]interface{}, error) {
	return s.repo.GetMatchStatistics(userID)
}

// UpdatePreferences updates user preferences
func (s *MatchingService) UpdatePreferences(userID string, prefs *models.UserPreferences) error {
	return s.repo.UpdateUserPreferences(userID, prefs)
}

// GetPreferences gets user preferences
func (s *MatchingService) GetPreferences(userID string) (*models.UserPreferences, error) {
	return s.repo.GetUserPreferences(userID)
}

// StartSuggestionRefreshWorker starts background worker to refresh suggestions
func (s *MatchingService) StartSuggestionRefreshWorker(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.refreshAllUserSuggestions()
		}
	}
}

// Private helper methods

func (s *MatchingService) createMatch(user1ID, user2ID string) (*models.Match, error) {
	// Calculate match score
	user1Profile, _ := s.repo.GetUserProfile(user1ID)
	user2Profile, _ := s.repo.GetUserProfile(user2ID)
	user1Prefs, _ := s.repo.GetUserPreferences(user1ID)
	user2Prefs, _ := s.repo.GetUserPreferences(user2ID)

	var matchScore float64
	if user1Profile != nil && user2Profile != nil {
		matchScore = s.scorer.CalculateMatchScore(
			&user1Profile.User,
			user1Profile,
			user1Prefs,
			&user2Profile.User,
			user2Profile,
			user2Prefs,
		)
	}

	match := &models.Match{
		User1ID:    uuid.MustParse(user1ID),
		User2ID:    uuid.MustParse(user2ID),
		MatchScore: &matchScore,
		Status:     "active",
	}

	if err := s.repo.CreateMatch(match); err != nil {
		return nil, err
	}

	// Reload match with relationships
	savedMatch, err := s.repo.GetMatch(match.ID.String())
	if err != nil {
		return match, nil
	}

	// Publish match events to NATS
	s.publishMatchEvent(savedMatch)

	log.Printf("✅ Created match between %s and %s (score: %.2f)", user1ID, user2ID, matchScore)

	return savedMatch, nil
}

func (s *MatchingService) publishMatchEvent(match *models.Match) {
	data, err := json.Marshal(match)
	if err != nil {
		log.Printf("⚠️  Failed to marshal match event: %v", err)
		return
	}

	// Publish to both users
	subject1 := fmt.Sprintf("match.new.%s", match.User1ID.String())
	subject2 := fmt.Sprintf("match.new.%s", match.User2ID.String())

	if err := s.nc.Publish(subject1, data); err != nil {
		log.Printf("⚠️  Failed to publish match event to user1: %v", err)
	}

	if err := s.nc.Publish(subject2, data); err != nil {
		log.Printf("⚠️  Failed to publish match event to user2: %v", err)
	}

	log.Printf("📤 Published match event to NATS")
}

func (s *MatchingService) publishLikeEvent(toUserID, fromUserID, likeType string) {
	event := map[string]interface{}{
		"to_user_id":   toUserID,
		"from_user_id": fromUserID,
		"like_type":    likeType,
		"timestamp":    time.Now(),
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("⚠️  Failed to marshal like event: %v", err)
		return
	}

	subject := fmt.Sprintf("match.like.%s", toUserID)
	if err := s.nc.Publish(subject, data); err != nil {
		log.Printf("⚠️  Failed to publish like event: %v", err)
	}
}

func (s *MatchingService) publishSuggestionsReady(userID string, count int) {
	event := map[string]interface{}{
		"user_id":   userID,
		"count":     count,
		"timestamp": time.Now(),
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("⚠️  Failed to marshal suggestions event: %v", err)
		return
	}

	subject := fmt.Sprintf("match.suggestion.%s", userID)
	if err := s.nc.Publish(subject, data); err != nil {
		log.Printf("⚠️  Failed to publish suggestions event: %v", err)
	}
}

func (s *MatchingService) applyDiversityFilters(suggestions []*models.MatchSuggestion) []*models.MatchSuggestion {
	if len(suggestions) == 0 {
		return suggestions
	}

	// Epsilon-greedy: 10% exploration
	explorationRate := 0.10
	numExplore := int(float64(len(suggestions)) * explorationRate)

	if numExplore > 0 && len(suggestions) > numExplore {
		// Shuffle a portion of the lower-scored suggestions
		midPoint := len(suggestions) / 2
		if midPoint < len(suggestions) {
			exploreCandidates := suggestions[midPoint:]
			rand.Shuffle(len(exploreCandidates), func(i, j int) {
				exploreCandidates[i], exploreCandidates[j] = exploreCandidates[j], exploreCandidates[i]
			})

			// Replace some top suggestions with random ones
			for i := 0; i < numExplore && i < len(exploreCandidates); i++ {
				insertPos := len(suggestions) - numExplore + i
				if insertPos < len(suggestions) {
					suggestions[insertPos] = exploreCandidates[i]
				}
			}
		}
	}

	return suggestions
}

func (s *MatchingService) refreshAllUserSuggestions() {
	// Get all active users
	var users []models.User
	s.db.Where("is_verified = ?", true).
		Where("updated_at > ?", time.Now().Add(-30*24*time.Hour)).
		Find(&users)

	log.Printf("🔄 Refreshing suggestions for %d users", len(users))

	for _, user := range users {
		go func(userID string) {
			_, err := s.GenerateSuggestions(context.Background(), userID, 20)
			if err != nil {
				log.Printf("⚠️  Failed to refresh suggestions for user %s: %v", userID, err)
			}
		}(user.ID)
	}
}

// LikeResult represents the result of a like action
type LikeResult struct {
	Success bool          `json:"success"`
	Matched bool          `json:"matched"`
	Match   *models.Match `json:"match,omitempty"`
}
