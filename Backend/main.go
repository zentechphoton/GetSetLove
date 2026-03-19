package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gsl-backend/database"
	"gsl-backend/routes"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	database.InitDatabase()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	r := gin.Default()

	// Configure trusted proxies (fix security warning)
	// For development, trust localhost only
	// For production, set specific proxy IPs
	if os.Getenv("GIN_MODE") == "release" {
		// In production, trust specific proxies or set to nil if behind a reverse proxy
		r.SetTrustedProxies([]string{"127.0.0.1", "::1"})
	} else {
		// In development, trust localhost only
		r.SetTrustedProxies([]string{"127.0.0.1", "::1"})
	}

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		os.Getenv("FRONTEND_URL"),
		"http://localhost:3000",
		"http://localhost:3001",
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// Setup routes
	routes.SetupRoutes(r)

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}





