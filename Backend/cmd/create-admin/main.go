package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"gsl-backend/database"
	"gsl-backend/models"
	"gsl-backend/utils"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	database.InitDatabase()

	// Admin user credentials - you can modify these or pass as arguments
	adminEmail := "admin2@datingapp.com"
	adminUsername := "admin2"
	adminPassword := "Admin123!@#"
	adminFirstName := "Admin"
	adminLastName := "User 2"
	adminRole := "admin" // or "super_admin"

	// Check for command line arguments
	if len(os.Args) > 1 {
		adminEmail = os.Args[1]
	}
	if len(os.Args) > 2 {
		adminUsername = os.Args[2]
	}
	if len(os.Args) > 3 {
		adminPassword = os.Args[3]
	}
	if len(os.Args) > 4 {
		adminRole = os.Args[4]
	}

	// Validate role
	if adminRole != "admin" && adminRole != "super_admin" {
		log.Fatal("Role must be either 'admin' or 'super_admin'")
	}

	// Normalize email to lowercase
	adminEmail = strings.ToLower(adminEmail)

	// Check if admin already exists
	var existingAdmin models.User
	if err := database.DB.Where("email = ? OR username = ?", adminEmail, adminUsername).First(&existingAdmin).Error; err == nil {
		fmt.Printf("❌ Admin user already exists:\n")
		fmt.Printf("Email: %s\n", existingAdmin.Email)
		fmt.Printf("Username: %s\n", existingAdmin.Username)
		fmt.Printf("Role: %s\n", existingAdmin.Role)
		fmt.Println("\nTo create a different admin, use different email/username.")
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(adminPassword)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Create admin user
	admin := models.User{
		Username:   adminUsername,
		Email:      adminEmail,
		Password:   hashedPassword,
		FirstName:  adminFirstName,
		LastName:   adminLastName,
		Role:       adminRole,
		IsVerified: true,
		IsPremium:  false,
	}

	if err := database.DB.Create(&admin).Error; err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	fmt.Println("✅ Admin user created successfully!")
	fmt.Println("\n📋 Admin Credentials:")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("Email:    %s\n", adminEmail)
	fmt.Printf("Username: %s\n", adminUsername)
	fmt.Printf("Password: %s\n", adminPassword)
	fmt.Printf("Role:     %s\n", admin.Role)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println("\n⚠️  IMPORTANT: Change this password after first login!")
	fmt.Println("\n💡 Usage: go run cmd/create-admin/main.go [email] [username] [password] [role]")
}





