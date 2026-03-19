package resolver

import (
	"context"
	"errors"
	"gsl-backend/database"
	"gsl-backend/models"
)

// Me is the resolver for the me field.
func (r *Resolver) Me(ctx context.Context) (*User, error) {
	userID, exists := ctx.Value("user_id").(string)
	if !exists || userID == "" {
		return nil, errors.New("unauthorized: user not authenticated")
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}

	return toUser(&user), nil
}

