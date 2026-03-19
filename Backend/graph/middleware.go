package graph

import (
	"context"
	"strings"

	"github.com/gin-gonic/gin"
	"gsl-backend/utils"
)

// GraphQLAuthMiddleware extracts JWT token from request and adds to context
func GraphQLAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		
		// Extract token from "Bearer <token>"
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString := parts[1]
				claims, err := utils.ValidateToken(tokenString)
				if err == nil {
					// Add user info to context for GraphQL resolvers
					// Use type-safe context keys
					type contextKey string
					const (
						userIDKey    contextKey = "user_id"
						userEmailKey contextKey = "user_email"
						userRoleKey  contextKey = "user_role"
					)
					
					ctx := context.WithValue(c.Request.Context(), userIDKey, claims.UserID)
					ctx = context.WithValue(ctx, userEmailKey, claims.Email)
					ctx = context.WithValue(ctx, userRoleKey, claims.Role)
					c.Request = c.Request.WithContext(ctx)
				}
			}
		}
		
		c.Next()
	}
}

