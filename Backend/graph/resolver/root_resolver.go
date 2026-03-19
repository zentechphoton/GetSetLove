package resolver

import (
	"github.com/nats-io/nats.go"
	"gorm.io/gorm"
	"gsl-backend/graph/generated"
	"gsl-backend/services/chat"
	"gsl-backend/services/matching"
)

// Resolver is the root resolver
type Resolver struct {
	DB              *gorm.DB
	NC              *nats.Conn
	JS              nats.JetStreamContext
	ChatService     *chat.ChatService
	MatchingService *matching.MatchingService
}

// NewResolver creates a new root resolver
func NewResolver(
	db *gorm.DB,
	nc *nats.Conn,
	js nats.JetStreamContext,
	chatService *chat.ChatService,
	matchingService *matching.MatchingService,
) *Resolver {
	return &Resolver{
		DB:              db,
		NC:              nc,
		JS:              js,
		ChatService:     chatService,
		MatchingService: matchingService,
	}
}

// RegisterInput represents registration input
type RegisterInput struct {
	Username  string
	Email     string
	Password  string
	FirstName *string
	LastName  *string
}

// LoginInput represents login input
type LoginInput struct {
	Email    string
	Password string
}

// Mutation returns the mutation resolver
func (r *Resolver) Mutation() generated.MutationResolver {
	return r
}

// Query returns the query resolver
func (r *Resolver) Query() generated.QueryResolver {
	return r
}