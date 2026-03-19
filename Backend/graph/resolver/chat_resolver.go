package resolver

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/nats-io/nats.go"
	"gsl-backend/models"
	"gsl-backend/utils"
)

// Chat Queries

func (r *Resolver) Chat(ctx context.Context, id string) (*models.Chat, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Get chat
	chat, err := r.ChatService.GetChatByID(id)
	if err != nil {
		return nil, err
	}

	// Verify user is participant
	if !r.ChatService.IsParticipant(id, user.ID) {
		return nil, errors.New("not authorized to access this chat")
	}

	return chat, nil
}

func (r *Resolver) MyChats(ctx context.Context, limit *int, offset *int) ([]*models.Chat, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	limitVal := 20
	if limit != nil {
		limitVal = *limit
	}

	offsetVal := 0
	if offset != nil {
		offsetVal = *offset
	}

	return r.ChatService.GetUserChats(user.ID, limitVal, offsetVal)
}

func (r *Resolver) ChatMessages(ctx context.Context, chatID string, limit *int, before *string) ([]*models.Message, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Verify user is participant
	if !r.ChatService.IsParticipant(chatID, user.ID) {
		return nil, errors.New("not authorized to access this chat")
	}

	limitVal := 50
	if limit != nil {
		limitVal = *limit
	}

	return r.ChatService.GetMessages(chatID, limitVal, before)
}

func (r *Resolver) ChatParticipants(ctx context.Context, chatID string) ([]*models.ChatParticipant, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Verify user is participant
	if !r.ChatService.IsParticipant(chatID, user.ID) {
		return nil, errors.New("not authorized to access this chat")
	}

	// Get chat with participants
	chat, err := r.ChatService.GetChatByID(chatID)
	if err != nil {
		return nil, err
	}

	// Convert to slice of pointers
	participants := make([]*models.ChatParticipant, len(chat.Participants))
	for i := range chat.Participants {
		participants[i] = &chat.Participants[i]
	}
	return participants, nil
}

// Chat Mutations

func (r *Resolver) CreateDMChat(ctx context.Context, participantID string) (*models.Chat, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Check if chat already exists
	existingChat, err := r.ChatService.GetDMChatBetweenUsers(user.ID, participantID)
	if err == nil && existingChat != nil {
		return existingChat, nil
	}

	// Create new DM chat
	return r.ChatService.CreateDMChat(user.ID, participantID)
}

func (r *Resolver) MarkMessagesRead(ctx context.Context, chatID string, messageIDs []string) (bool, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return false, errors.New("unauthorized")
	}

	// Verify user is participant
	if !r.ChatService.IsParticipant(chatID, user.ID) {
		return false, errors.New("not authorized")
	}

	err := r.ChatService.MarkMessagesAsRead(chatID, user.ID, messageIDs)
	return err == nil, err
}

func (r *Resolver) ArchiveChat(ctx context.Context, chatID string, archived bool) (bool, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return false, errors.New("unauthorized")
	}

	// Verify user is participant
	if !r.ChatService.IsParticipant(chatID, user.ID) {
		return false, errors.New("not authorized")
	}

	err := r.ChatService.UpdateChatSettings(chatID, user.ID, nil, &archived)
	return err == nil, err
}

func (r *Resolver) MuteChat(ctx context.Context, chatID string, muted bool) (bool, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return false, errors.New("unauthorized")
	}

	// Verify user is participant
	if !r.ChatService.IsParticipant(chatID, user.ID) {
		return false, errors.New("not authorized")
	}

	err := r.ChatService.UpdateChatSettings(chatID, user.ID, &muted, nil)
	return err == nil, err
}

func (r *Resolver) DeleteMessage(ctx context.Context, messageID string) (bool, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return false, errors.New("unauthorized")
	}

	err := r.ChatService.DeleteMessage(messageID, user.ID)
	return err == nil, err
}

// Chat Subscriptions

func (r *Resolver) ChatTyping(ctx context.Context, chatID string) (<-chan *TypingEvent, error) {
	user := utils.GetUserFromContext(ctx)
	if user == nil {
		return nil, errors.New("unauthorized")
	}

	// Verify user is participant
	if !r.ChatService.IsParticipant(chatID, user.ID) {
		return nil, errors.New("not authorized")
	}

	// Create channel for events
	events := make(chan *TypingEvent, 10)

	// Subscribe to NATS subject
	subject := fmt.Sprintf("chat.typing.%s.>", chatID)
	sub, err := r.JS.Subscribe(subject, func(msg *nats.Msg) {
		var event TypingEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			return
		}

		// Don't send own typing events back
		if event.UserID != user.ID {
			select {
			case events <- &event:
			case <-ctx.Done():
				return
			}
		}
		msg.Ack()
	}, nats.ManualAck())

	if err != nil {
		close(events)
		return nil, err
	}

	// Cleanup on context cancel
	go func() {
		<-ctx.Done()
		sub.Unsubscribe()
		close(events)
	}()

	return events, nil
}

func (r *Resolver) UserPresence(ctx context.Context, userID string) (<-chan *PresenceEvent, error) {
	// Create channel for events
	events := make(chan *PresenceEvent, 10)

	// Subscribe to NATS subject
	subject := fmt.Sprintf("chat.presence.%s", userID)
	sub, err := r.JS.Subscribe(subject, func(msg *nats.Msg) {
		var event PresenceEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			return
		}

		select {
		case events <- &event:
		case <-ctx.Done():
			return
		}
		msg.Ack()
	}, nats.ManualAck())

	if err != nil {
		close(events)
		return nil, err
	}

	// Cleanup on context cancel
	go func() {
		<-ctx.Done()
		sub.Unsubscribe()
		close(events)
	}()

	return events, nil
}

// TypingEvent represents a typing indicator event
type TypingEvent struct {
	ChatID    string `json:"chat_id"`
	UserID    string `json:"user_id"`
	Typing    bool   `json:"typing"`
	Timestamp string `json:"timestamp"`
}

// PresenceEvent represents a presence event
type PresenceEvent struct {
	UserID   string  `json:"user_id"`
	Online   bool    `json:"online"`
	LastSeen *string `json:"last_seen,omitempty"`
}
