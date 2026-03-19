package graph

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"gsl-backend/graph/generated"
)

// GraphQLHandler creates a Gin handler for GraphQL using gqlgen
func GraphQLHandler() gin.HandlerFunc {
	// Create resolver from graph package (schema.resolvers.go expects this)
	resolver := &Resolver{}

	// Create executable schema
	executableSchema := generated.NewExecutableSchema(generated.Config{
		Resolvers: resolver,
	})

	// Create GraphQL handler
	h := handler.NewDefaultServer(executableSchema)
	
	// Add error presenter to log errors
	h.SetErrorPresenter(func(ctx context.Context, e error) *gqlerror.Error {
		err := graphql.DefaultErrorPresenter(ctx, e)
		// Log the error for debugging
		if err != nil {
			log.Printf("GraphQL Error: %v", err)
		}
		return err
	})

	// Configure transports
	h.AddTransport(transport.POST{})
	h.AddTransport(transport.GET{})
	h.AddTransport(transport.Options{})

	return func(c *gin.Context) {
		// Get context from Gin (with auth info from middleware)
		// The middleware already set the context values, so use the request context
		ctx := c.Request.Context()

		// Serve GraphQL request with the context
		h.ServeHTTP(c.Writer, c.Request.WithContext(ctx))
	}
}

// GraphQLPlaygroundHandler creates a Gin handler for GraphQL Playground
func GraphQLPlaygroundHandler() gin.HandlerFunc {
	h := playground.Handler("GraphQL Playground", "/graphql")
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

// GraphQLRequest represents a GraphQL request (for backward compatibility)
type GraphQLRequest struct {
	Query         string                 `json:"query"`
	Variables     map[string]interface{} `json:"variables"`
	OperationName string                 `json:"operationName"`
}

// GraphQLHandlerLegacy is the old handler (kept for reference, but not used)
func GraphQLHandlerLegacy() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req GraphQLRequest

		if c.Request.Method == "GET" {
			req.Query = c.Query("query")
			if variables := c.Query("variables"); variables != "" {
				json.Unmarshal([]byte(variables), &req.Variables)
			}
		} else {
			body, err := io.ReadAll(c.Request.Body)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
				return
			}

			if err := json.Unmarshal(body, &req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
				return
			}
		}

		if req.Query == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Query is required"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Use GraphQLHandler() instead"})
	}
}

