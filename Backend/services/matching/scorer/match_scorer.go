package scorer

import (
	"math"
	"strings"
	"time"

	"gsl-backend/models"
)

// Scoring weights (must sum to 1.0)
const (
	WeightAge              = 0.20
	WeightDistance         = 0.15
	WeightInterests        = 0.25
	WeightProfileQuality   = 0.10
	WeightActivity         = 0.15
	WeightMutualPreference = 0.15
)

// MatchScorer handles match scoring calculations
type MatchScorer struct{}

// NewMatchScorer creates a new match scorer
func NewMatchScorer() *MatchScorer {
	return &MatchScorer{}
}

// CalculateMatchScore computes the overall compatibility score
func (ms *MatchScorer) CalculateMatchScore(
	user1 *models.User,
	user1Profile *models.UserProfileExtended,
	user1Prefs *models.UserPreferences,
	user2 *models.User,
	user2Profile *models.UserProfileExtended,
	user2Prefs *models.UserPreferences,
) float64 {
	score := 0.0

	// 1. Age compatibility
	ageScore := ms.ScoreAge(user1, user1Prefs, user2, user2Prefs)
	score += ageScore * WeightAge

	// 2. Distance
	distScore := ms.ScoreDistance(user1Profile, user2Profile, user1Prefs)
	score += distScore * WeightDistance

	// 3. Interests overlap
	interestScore := ms.ScoreInterests(user1Prefs, user2Prefs)
	score += interestScore * WeightInterests

	// 4. Profile quality
	qualityScore := ms.ScoreProfileQuality(user2Profile)
	score += qualityScore * WeightProfileQuality

	// 5. Activity/engagement
	activityScore := ms.ScoreActivity(user2Profile)
	score += activityScore * WeightActivity

	// 6. Mutual preferences
	mutualScore := ms.ScoreMutualPreferences(user1, user1Prefs, user2, user2Prefs)
	score += mutualScore * WeightMutualPreference

	return math.Round(score*100) / 100 // Round to 2 decimal places
}

// GetScoreBreakdown returns detailed score breakdown
func (ms *MatchScorer) GetScoreBreakdown(
	user1 *models.User,
	user1Profile *models.UserProfileExtended,
	user1Prefs *models.UserPreferences,
	user2 *models.User,
	user2Profile *models.UserProfileExtended,
	user2Prefs *models.UserPreferences,
) map[string]interface{} {
	ageScore := ms.ScoreAge(user1, user1Prefs, user2, user2Prefs)
	distScore := ms.ScoreDistance(user1Profile, user2Profile, user1Prefs)
	interestScore := ms.ScoreInterests(user1Prefs, user2Prefs)
	qualityScore := ms.ScoreProfileQuality(user2Profile)
	activityScore := ms.ScoreActivity(user2Profile)
	mutualScore := ms.ScoreMutualPreferences(user1, user1Prefs, user2, user2Prefs)

	return map[string]interface{}{
		"age_score":          ageScore,
		"distance_score":     distScore,
		"interests_score":    interestScore,
		"quality_score":      qualityScore,
		"activity_score":     activityScore,
		"mutual_prefs_score": mutualScore,
		"weights": map[string]float64{
			"age":              WeightAge,
			"distance":         WeightDistance,
			"interests":        WeightInterests,
			"profile_quality":  WeightProfileQuality,
			"activity":         WeightActivity,
			"mutual_preference": WeightMutualPreference,
		},
	}
}

// ScoreAge calculates age compatibility score (0-100)
func (ms *MatchScorer) ScoreAge(
	user1 *models.User,
	user1Prefs *models.UserPreferences,
	user2 *models.User,
	user2Prefs *models.UserPreferences,
) float64 {
	user1Age := calculateAge(user1.CreatedAt) // Placeholder - should use birthdate
	user2Age := calculateAge(user2.CreatedAt)

	// Check if user2 is within user1's age preference
	if user2Age < user1Prefs.MinAge || user2Age > user1Prefs.MaxAge {
		return 0.0
	}

	// Check mutual preference
	if user1Age < user2Prefs.MinAge || user1Age > user2Prefs.MaxAge {
		return 50.0 // One-way preference
	}

	// Calculate how centered the ages are in each other's range
	user1Range := float64(user1Prefs.MaxAge - user1Prefs.MinAge)
	user2Range := float64(user2Prefs.MaxAge - user2Prefs.MinAge)

	if user1Range == 0 || user2Range == 0 {
		return 100.0
	}

	// Calculate normalized position in range
	user2Position := float64(user2Age-user1Prefs.MinAge) / user1Range
	user1Position := float64(user1Age-user2Prefs.MinAge) / user2Range

	// Prefer ages closer to the middle of the range
	score1 := 100 * (1 - math.Abs(user2Position-0.5)*2)
	score2 := 100 * (1 - math.Abs(user1Position-0.5)*2)

	return (score1 + score2) / 2
}

// ScoreDistance calculates distance-based score (0-100)
func (ms *MatchScorer) ScoreDistance(
	profile1 *models.UserProfileExtended,
	profile2 *models.UserProfileExtended,
	prefs *models.UserPreferences,
) float64 {
	if profile1.Latitude == nil || profile1.Longitude == nil ||
		profile2.Latitude == nil || profile2.Longitude == nil {
		return 50.0 // Neutral score if no location
	}

	distance := haversineDistance(
		*profile1.Latitude, *profile1.Longitude,
		*profile2.Latitude, *profile2.Longitude,
	)

	maxDistance := float64(prefs.MaxDistanceKm)

	if distance > maxDistance {
		return 0.0
	}

	// Linear decay from 100 at 0km to 0 at max_distance
	score := 100 * (1 - distance/maxDistance)

	return math.Max(0, score)
}

// ScoreInterests calculates interest overlap score (0-100)
func (ms *MatchScorer) ScoreInterests(
	prefs1 *models.UserPreferences,
	prefs2 *models.UserPreferences,
) float64 {
	if len(prefs1.Interests) == 0 || len(prefs2.Interests) == 0 {
		return 50.0 // Neutral if no interests specified
	}

	// Convert to sets
	set1 := make(map[string]bool)
	for _, interest := range prefs1.Interests {
		set1[strings.ToLower(interest)] = true
	}

	set2 := make(map[string]bool)
	for _, interest := range prefs2.Interests {
		set2[strings.ToLower(interest)] = true
	}

	// Calculate Jaccard similarity
	intersection := 0
	for interest := range set1 {
		if set2[interest] {
			intersection++
		}
	}

	union := len(set1) + len(set2) - intersection

	if union == 0 {
		return 50.0
	}

	// Jaccard index × 100
	return float64(intersection) / float64(union) * 100
}

// ScoreProfileQuality calculates profile completeness score (0-100)
func (ms *MatchScorer) ScoreProfileQuality(profile *models.UserProfileExtended) float64 {
	score := 0.0
	components := 0

	// Photo count (max 6 photos)
	photoCount := len(profile.PhotoURLs)
	if photoCount > 0 {
		photoScore := math.Min(float64(photoCount)/6.0, 1.0) * 100
		score += photoScore
		components++
	}

	// Bio completeness
	if profile.Bio != nil {
		bioLength := len(*profile.Bio)
		if bioLength >= 50 && bioLength <= 500 {
			score += 100
		} else if bioLength > 0 {
			score += 50
		}
		components++
	}

	// Verification badge
	if profile.VerifiedPhoto {
		score += 100
		components++
	}

	// Profile completeness score
	if profile.ProfileCompleteness > 0 {
		score += float64(profile.ProfileCompleteness)
		components++
	}

	if components == 0 {
		return 0.0
	}

	return score / float64(components)
}

// ScoreActivity calculates engagement/activity score (0-100)
func (ms *MatchScorer) ScoreActivity(profile *models.UserProfileExtended) float64 {
	score := 0.0
	components := 0

	// Last active recency
	if profile.LastActiveAt != nil {
		hoursSinceActive := time.Since(*profile.LastActiveAt).Hours()

		switch {
		case hoursSinceActive < 1: // Active within 1 hour
			score += 100
		case hoursSinceActive < 24: // Active today
			score += 80
		case hoursSinceActive < 72: // Active in last 3 days
			score += 60
		case hoursSinceActive < 168: // Active in last week
			score += 40
		default:
			score += 20
		}
		components++
	}

	// Response rate
	if profile.ResponseRate > 0 {
		score += profile.ResponseRate
		components++
	}

	if components == 0 {
		return 50.0
	}

	return score / float64(components)
}

// ScoreMutualPreferences calculates compatibility of mutual preferences (0-100)
func (ms *MatchScorer) ScoreMutualPreferences(
	user1 *models.User,
	prefs1 *models.UserPreferences,
	user2 *models.User,
	prefs2 *models.UserPreferences,
) float64 {
	score := 0.0
	checks := 0

	// Gender/orientation compatibility
	if len(prefs1.GenderPreference) > 0 {
		if contains(prefs1.GenderPreference, user2.Role) { // Using Role as placeholder for gender
			score += 100
		}
		checks++
	}

	if len(prefs2.GenderPreference) > 0 {
		if contains(prefs2.GenderPreference, user1.Role) {
			score += 100
		}
		checks++
	}

	// Relationship goals alignment
	if len(prefs1.RelationshipGoals) > 0 && len(prefs2.RelationshipGoals) > 0 {
		hasCommonGoal := false
		for _, goal1 := range prefs1.RelationshipGoals {
			if contains(prefs2.RelationshipGoals, goal1) {
				hasCommonGoal = true
				break
			}
		}
		if hasCommonGoal {
			score += 100
		}
		checks++
	}

	// Deal-breakers check
	// If any deal-breaker matches, return 0
	if len(prefs1.Dealbreakers) > 0 || len(prefs2.Dealbreakers) > 0 {
		// TODO: Implement deal-breaker matching logic
		// For now, assume no deal-breakers matched
		checks++
	}

	if checks == 0 {
		return 100.0 // No preferences set, assume compatible
	}

	return score / float64(checks)
}

// Helper functions

func calculateAge(createdAt time.Time) int {
	// Placeholder - should calculate from birthdate
	// For now, return random age between 21-45
	years := time.Since(createdAt).Hours() / 24 / 365
	return int(years) % 25 + 21
}

func haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadiusKm = 6371.0

	dLat := degreesToRadians(lat2 - lat1)
	dLon := degreesToRadians(lon2 - lon1)

	lat1Rad := degreesToRadians(lat1)
	lat2Rad := degreesToRadians(lat2)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(lat1Rad)*math.Cos(lat2Rad)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadiusKm * c
}

func degreesToRadians(deg float64) float64 {
	return deg * math.Pi / 180
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if strings.EqualFold(s, item) {
			return true
		}
	}
	return false
}
