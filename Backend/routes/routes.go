package routes

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"gsl-backend/database"
	"gsl-backend/graph"
	"gsl-backend/handlers"
	"gsl-backend/middleware"
	"gsl-backend/models"
	"gsl-backend/pkg/natsutil"
	ws "gsl-backend/pkg/websocket"
	"gsl-backend/services/chat"
	"gsl-backend/services/gateway"
)

// SetupRoutes configures all application routes
func SetupRoutes(r *gin.Engine) {
	log.Println("Setting up routes...")
	// Public routes
	public := r.Group("/api")
	{
		// Health check
		public.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "message": "Server is running"})
		})

		// Blog health check
		public.GET("/blogs/health", func(c *gin.Context) {
			// Test database connection
			var count int64
			if err := database.DB.Model(&models.Blog{}).Count(&count).Error; err != nil {
				c.JSON(500, gin.H{
					"status":  "error",
					"message": "Database connection failed",
					"error":   err.Error(),
				})
				return
			}
			c.JSON(200, gin.H{
				"status":      "ok",
				"message":     "Blog system is working",
				"total_blogs": count,
			})
		})

		// Authentication routes (public)
		auth := public.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/logout", handlers.Logout)
		}

		// Public blog routes
		public.GET("/blogs", handlers.GetPublicBlogs)
		public.GET("/blogs/featured", handlers.GetFeaturedBlog)
		public.GET("/blogs/slug/:slug", handlers.GetBlogBySlug)
		public.GET("/blogs/settings", handlers.GetBlogSettings)

		// Public news routes
		public.GET("/news", handlers.GetPublicNews)
		public.GET("/news/featured", handlers.GetFeaturedNews)
		public.GET("/news/slug/:slug", handlers.GetNewsBySlug)
	}

	// Protected routes (require authentication)
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes
		protected.GET("/auth/me", handlers.GetCurrentUser)

		// User dashboard routes
		user := protected.Group("/user")
		{
			user.GET("/dashboard", handlers.UserDashboard)
			user.GET("/matches", handlers.GetMatches)
			user.GET("/messages", handlers.GetMessages)
			user.GET("/profile", handlers.GetUserProfile)
			user.GET("/settings", handlers.GetUserSettings)
			user.PUT("/settings", handlers.UpdateUserSettings)
			user.POST("/verification/request", handlers.RequestVerification)
			log.Println("✅ Registered route: POST /api/user/verification/request")

			// User blog routes
			user.GET("/blogs", handlers.GetBlogs)
			user.GET("/blogs/:id", handlers.GetBlog)
			user.POST("/blogs", handlers.CreateBlog)
			user.PUT("/blogs/:id", handlers.UpdateBlog)
			user.DELETE("/blogs/:id", handlers.DeleteBlog)
			user.POST("/blogs/upload-image", handlers.UploadBlogImage)
			user.GET("/blogs/settings", handlers.GetBlogSettings)
		}
		
		// Chat routes (protected)
		chat := protected.Group("/chat")
		{
			chat.GET("/:id/messages", handlers.GetChatMessages)
		}
	}

	// Admin routes (require admin role)
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.RequireAdmin())
	{
		// Test endpoint to verify admin routes work
		admin.GET("/test", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "Admin routes are working!"})
		})
		
		admin.GET("/dashboard", handlers.AdminDashboard)
		admin.GET("/users", handlers.GetUsers)
		admin.GET("/users/:id", handlers.GetUser)
		admin.PUT("/users/:id", handlers.UpdateUser)
		admin.PUT("/users/:id/role", handlers.UpdateUserRole)
		admin.DELETE("/users/:id", handlers.DeleteUser)
		admin.POST("/users/:id/verify", handlers.VerifyUser)
		admin.POST("/users/:id/unverify", handlers.UnverifyUser)
		
		// Verification request routes
		admin.GET("/verification-requests", handlers.GetVerificationRequests)
		admin.POST("/verification-requests/:id/approve", handlers.ApproveVerificationRequest)
		admin.POST("/verification-requests/:id/reject", handlers.RejectVerificationRequest)
		
		// Match routes - IMPORTANT: Register before other routes that might conflict
		log.Println("Registering admin match routes...")
		admin.GET("/matches", handlers.GetAdminMatches)
		admin.POST("/matches", func(c *gin.Context) {
			log.Printf("🔵 POST /api/admin/matches route handler called - Method: %s, Path: %s", c.Request.Method, c.Request.URL.Path)
			handlers.CreateMatch(c)
		})
		admin.DELETE("/matches/:id", handlers.DeleteMatch)
		log.Println("✅ Admin match routes registered: GET, POST, DELETE /api/admin/matches")
		admin.GET("/reports", handlers.GetReports)
		admin.GET("/settings", handlers.AdminSettings)

		// Blog routes - IMPORTANT: More specific routes first
		log.Println("Registering admin blog routes...")
		admin.GET("/blogs/stats", handlers.GetBlogStats)
		admin.POST("/blogs/upload-image", handlers.UploadBlogImage)
		admin.GET("/blogs/settings", handlers.GetBlogSettings)
		admin.PUT("/blogs/settings", handlers.UpdateBlogSettings)
		admin.GET("/blogs/:id", handlers.GetBlog)
		admin.PUT("/blogs/:id", handlers.UpdateBlog)
		admin.DELETE("/blogs/:id", handlers.DeleteBlog)
		admin.GET("/blogs", handlers.GetBlogs)
		admin.POST("/blogs", handlers.CreateBlog)
		log.Println("Admin blog routes registered successfully")

		// News routes - IMPORTANT: More specific routes first
		log.Println("Registering admin news routes...")
		admin.GET("/news/stats", handlers.GetNewsStats)
		admin.POST("/news/upload-image", handlers.UploadNewsImage)
		admin.GET("/news/:id", handlers.GetNewsItem)
		admin.PUT("/news/:id", handlers.UpdateNews)
		admin.DELETE("/news/:id", handlers.DeleteNews)
		admin.GET("/news", handlers.GetNews)
		admin.POST("/news", handlers.CreateNews)
		log.Println("Admin news routes registered successfully")
	}

	// GraphQL routes with gqlgen
	graphqlGroup := r.Group("/graphql")
	graphqlGroup.Use(graph.GraphQLAuthMiddleware()) // Add auth middleware for GraphQL
	{
		graphqlGroup.POST("", graph.GraphQLHandler())
		graphqlGroup.GET("", graph.GraphQLHandler())
		graphqlGroup.OPTIONS("", graph.GraphQLHandler())
	}

	// GraphQL Playground (development only)
	if gin.Mode() != gin.ReleaseMode {
		r.GET("/playground", graph.GraphQLPlaygroundHandler())
	}

	// WebSocket route for chat
	setupWebSocketRoute(r)
}

// setupWebSocketRoute initializes and registers the WebSocket route
func setupWebSocketRoute(r *gin.Engine) {
	// Initialize NATS connection
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://localhost:4222"
	}

	nc, js, err := natsutil.ConnectNATS(natsutil.JetStreamConfig{
		URL:           natsURL,
		MaxReconnects: 10,
		ReconnectWait: 2 * time.Second,
	})
	if err != nil {
		log.Printf("⚠️  Warning: Failed to connect to NATS: %v. WebSocket features may be limited.", err)
		// Continue without NATS - WebSocket will work but real-time features may be limited
		nc = nil
		js = nil
	}

	// Initialize services
	var chatService *chat.ChatService
	var connManager *ws.ConnectionManager

	if database.DB != nil && nc != nil && js != nil {
		chatService = chat.NewChatService(database.DB, nc, js)
		connManager = ws.NewConnectionManager()

		// Start connection manager
		go connManager.Run()

		// Start NATS to WebSocket bridge
		go gateway.SubscribeToNATSEvents(js, connManager)

		log.Println("✅ WebSocket services initialized")
	} else {
		log.Println("⚠️  Warning: WebSocket services not fully initialized")
	}

	// Register WebSocket route
	r.GET("/ws/chat", gateway.ChatWebSocketHandler(nc, js, chatService, connManager))
}
