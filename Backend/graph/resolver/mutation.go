package resolver

import (
	"context"
	"errors"
	"strings"
	"gsl-backend/database"
	"gsl-backend/models"
	"gsl-backend/utils"
)

// AuthResponse represents the response after login/register
type AuthResponse struct {
	Token string
	User  *User
}

// User represents a user in GraphQL
type User struct {
	ID         string
	Username   string
	Email      string
	FirstName  *string
	LastName   *string
	Avatar     *string
	Role       string
	IsVerified bool
	IsPremium  bool
	CreatedAt  string
	UpdatedAt  string
}

// toUser converts a models.User to resolver.User
func toUser(u *models.User) *User {
	var firstName, lastName, avatar *string
	if u.FirstName != "" {
		firstName = &u.FirstName
	}
	if u.LastName != "" {
		lastName = &u.LastName
	}
	if u.Avatar != "" {
		avatar = &u.Avatar
	}

	return &User{
		ID:         u.ID,
		Username:   u.Username,
		Email:      u.Email,
		FirstName:  firstName,
		LastName:   lastName,
		Avatar:     avatar,
		Role:       u.Role,
		IsVerified: u.IsVerified,
		IsPremium:  u.IsPremium,
		CreatedAt:  u.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:  u.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// Register is the resolver for the register field.
func (r *Resolver) Register(ctx context.Context, input RegisterInput) (*AuthResponse, error) {
	// Check if user already exists (normalize email to lowercase)
	var existingUser models.User
	if err := database.DB.Where("email = ? OR username = ?", strings.ToLower(input.Email), input.Username).First(&existingUser).Error; err == nil {
		return nil, errors.New("user with this email or username already exists")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	// Prepare first name and last name
	var firstName, lastName string
	if input.FirstName != nil {
		firstName = *input.FirstName
	}
	if input.LastName != nil {
		lastName = *input.LastName
	}

	// Create user (normalize email to lowercase)
	user := models.User{
		Username:  input.Username,
		Email:     strings.ToLower(input.Email),
		Password:  hashedPassword,
		FirstName: firstName,
		LastName:  lastName,
		Role:      "user", // Default role
		IsVerified: false,
		IsPremium:  false,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return nil, errors.New("failed to create user")
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	return &AuthResponse{
		Token: token,
		User:  toUser(&user),
	}, nil
}

// Login is the resolver for the login field.
func (r *Resolver) Login(ctx context.Context, input LoginInput) (*AuthResponse, error) {
	// Find user
	var user models.User
	if err := database.DB.Where("email = ?", strings.ToLower(input.Email)).First(&user).Error; err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check password
	if !utils.CheckPasswordHash(input.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	return &AuthResponse{
		Token: token,
		User:  toUser(&user),
	}, nil
}

// Logout is the resolver for the logout field.
func (r *Resolver) Logout(ctx context.Context) (bool, error) {
	// In a stateless JWT system, logout is typically handled client-side
	// You can implement token blacklisting here if needed
	return true, nil
}

