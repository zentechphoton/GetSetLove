package utils

import (
	"context"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with a hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken generates a JWT token with user information
func GenerateToken(userID, email, role string) (string, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key-change-in-production"
	}

	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}

// ValidateToken validates a JWT token and returns the claims
func ValidateToken(tokenString string) (*Claims, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key-change-in-production"
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	return claims, nil
}

// GetUserFromContext extracts user information from context
func GetUserFromContext(ctx context.Context) *User {
	// Use type-safe context keys to match middleware
	type contextKey string
	const (
		userIDKey    contextKey = "user_id"
		userEmailKey contextKey = "user_email"
		userRoleKey  contextKey = "user_role"
	)
	
	userID, ok := ctx.Value(userIDKey).(string)
	if !ok || userID == "" {
		// Try string key for backward compatibility
		userID, ok = ctx.Value("user_id").(string)
		if !ok || userID == "" {
			return nil
		}
	}

	email, _ := ctx.Value(userEmailKey).(string)
	if email == "" {
		email, _ = ctx.Value("user_email").(string)
	}
	
	role, _ := ctx.Value(userRoleKey).(string)
	if role == "" {
		role, _ = ctx.Value("user_role").(string)
	}

	return &User{
		ID:    userID,
		Email: email,
		Role:  role,
	}
}

// User represents a user from context
type User struct {
	ID    string
	Email string
	Role  string
}







