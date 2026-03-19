package resolver

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
	"gsl-backend/models"
	"gsl-backend/services/matching"
	"gsl-backend/utils"
)

// Matching Queries

func (r *Resolver) MyMatches(ctx context.Context, limit *int, status *string) ([]*models.Match, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	limitVal := 20
	if limit != nil {
		limitVal = *limit
	}

	statusVal := "active"
	if status != nil {
		statusVal = *status
	}

	return r.MatchingService.GetUserMatches(user.ID, limitVal, statusVal)
}

func (r *Resolver) MatchSuggestions(ctx context.Context, limit *int) ([]*models.MatchSuggestion, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	limitVal := 10
	if limit != nil {
		limitVal = *limit
	}

	return r.MatchingService.GetSuggestions(user.ID, limitVal)
}

func (r *Resolver) MatchStatistics(ctx context.Context) (map[string]interface{}, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	return r.MatchingService.GetMatchStatistics(user.ID)
}

func (r *Resolver) MyPreferences(ctx context.Context) (*models.UserPreferences, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	return r.MatchingService.GetPreferences(user.ID)
}

// Matching Mutations

func (r *Resolver) LikeUser(ctx context.Context, userID string, likeType *string) (*matching.LikeResult, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Don't allow liking yourself
	if user.ID == userID {
		return nil, errors.New("cannot like yourself")
	}

	typeVal := "like"
	if likeType != nil {
		typeVal = *likeType
	}

	return r.MatchingService.ProcessLike(ctx, user.ID, userID, typeVal)
}

func (r *Resolver) Unmatch(ctx context.Context, matchID string) (bool, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return false, errors.New("unauthorized")
	}

	// TODO: Verify user is part of this match before unmatchin

	err := r.MatchingService.Unmatch(matchID)
	return err == nil, err
}

func (r *Resolver) ReportUser(ctx context.Context, userID string, reason string) (bool, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return false, errors.New("unauthorized")
	}

	// TODO: Implement user reporting logic
	// This would typically:
	// 1. Create a report record in the database
	// 2. Notify admins/moderators
	// 3. Optionally trigger automatic actions (e.g., unmatch, block)

	// For now, just return success
	return true, nil
}

func (r *Resolver) RefreshSuggestions(ctx context.Context) ([]*models.MatchSuggestion, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	return r.MatchingService.GenerateSuggestions(ctx, user.ID, 20)
}

func (r *Resolver) UpdatePreferences(ctx context.Context, input PreferencesInput) (*models.UserPreferences, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Build preferences object from input
	userID, err := uuid.Parse(user.ID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}
	
	prefs := &models.UserPreferences{
		UserID: userID,
	}

	if input.MinAge != nil {
		prefs.MinAge = *input.MinAge
	}
	if input.MaxAge != nil {
		prefs.MaxAge = *input.MaxAge
	}
	if input.MaxDistanceKm != nil {
		prefs.MaxDistanceKm = *input.MaxDistanceKm
	}
	if input.GenderPreference != nil {
		prefs.GenderPreference = input.GenderPreference
	}
	if input.RelationshipGoals != nil {
		prefs.RelationshipGoals = input.RelationshipGoals
	}
	if input.Interests != nil {
		prefs.Interests = input.Interests
	}
	if input.Dealbreakers != nil {
		prefs.Dealbreakers = input.Dealbreakers
	}
	if input.VerifiedOnly != nil {
		prefs.VerifiedOnly = *input.VerifiedOnly
	}
	if input.PremiumOnly != nil {
		prefs.PremiumOnly = *input.PremiumOnly
	}

	err = r.MatchingService.UpdatePreferences(user.ID, prefs)
	if err != nil {
		return nil, err
	}

	return r.MatchingService.GetPreferences(user.ID)
}

// Matching Subscriptions

func (r *Resolver) NewMatch(ctx context.Context) (<-chan *models.Match, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Create channel for events
	matches := make(chan *models.Match, 10)

	// Subscribe to NATS subject
	subject := fmt.Sprintf("match.new.%s", user.ID)
	sub, err := r.JS.Subscribe(subject, func(msg *nats.Msg) {
		var match models.Match
		if err := json.Unmarshal(msg.Data, &match); err != nil {
			return
		}

		select {
		case matches <- &match:
		case <-ctx.Done():
			return
		}
		msg.Ack()
	}, nats.ManualAck())

	if err != nil {
		close(matches)
		return nil, err
	}

	// Cleanup on context cancel
	go func() {
		<-ctx.Done()
		sub.Unsubscribe()
		close(matches)
	}()

	return matches, nil
}

func (r *Resolver) NewLike(ctx context.Context) (<-chan *LikeNotification, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Create channel for events
	likes := make(chan *LikeNotification, 10)

	// Subscribe to NATS subject
	subject := fmt.Sprintf("match.like.%s", user.ID)
	sub, err := r.JS.Subscribe(subject, func(msg *nats.Msg) {
		var event map[string]interface{}
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			return
		}

		// TODO: Load full user object
		fromUserID, ok := event["from_user_id"].(string)
		if !ok {
			return
		}

		timestamp, _ := event["timestamp"].(string)

		notification := &LikeNotification{
			FromUserID: fromUserID,
			Timestamp:  timestamp,
		}

		select {
		case likes <- notification:
		case <-ctx.Done():
			return
		}
		msg.Ack()
	}, nats.ManualAck())

	if err != nil {
		close(likes)
		return nil, err
	}

	// Cleanup on context cancel
	go func() {
		<-ctx.Done()
		sub.Unsubscribe()
		close(likes)
	}()

	return likes, nil
}

func (r *Resolver) SystemNotification(ctx context.Context) (<-chan *Notification, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Create channel for events
	notifications := make(chan *Notification, 10)

	// Subscribe to NATS subject
	subject := fmt.Sprintf("notification.push.%s", user.ID)
	sub, err := r.JS.Subscribe(subject, func(msg *nats.Msg) {
		var notif Notification
		if err := json.Unmarshal(msg.Data, &notif); err != nil {
			return
		}

		select {
		case notifications <- &notif:
		case <-ctx.Done():
			return
		}
		msg.Ack()
	}, nats.ManualAck())

	if err != nil {
		close(notifications)
		return nil, err
	}

	// Cleanup on context cancel
	go func() {
		<-ctx.Done()
		sub.Unsubscribe()
		close(notifications)
	}()

	return notifications, nil
}

// Input types

type PreferencesInput struct {
	MinAge            *int      `json:"minAge,omitempty"`
	MaxAge            *int      `json:"maxAge,omitempty"`
	MaxDistanceKm     *int      `json:"maxDistanceKm,omitempty"`
	GenderPreference  []string  `json:"genderPreference,omitempty"`
	RelationshipGoals []string  `json:"relationshipGoals,omitempty"`
	Interests         []string  `json:"interests,omitempty"`
	Dealbreakers      []string  `json:"dealbreakers,omitempty"`
	VerifiedOnly      *bool     `json:"verifiedOnly,omitempty"`
	PremiumOnly       *bool     `json:"premiumOnly,omitempty"`
}

// Event types

type LikeNotification struct {
	FromUserID string `json:"from_user_id"`
	Timestamp  string `json:"timestamp"`
}

type Notification struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`
	Title     string                 `json:"title"`
	Body      string                 `json:"body"`
	Data      map[string]interface{} `json:"data,omitempty"`
	CreatedAt string                 `json:"created_at"`
}
