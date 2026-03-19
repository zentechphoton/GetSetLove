package main

import (
	"fmt"
	"log"

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

	// Admin user credentials
	adminEmail := "admin@datingapp.com"
	adminUsername := "admin"
	adminPassword := "Admin123!"
	adminFirstName := "Admin"
	adminLastName := "User"

	// Check if admin already exists
	var existingAdmin models.User
	if err := database.DB.Where("email = ? OR username = ?", adminEmail, adminUsername).First(&existingAdmin).Error; err == nil {
		fmt.Printf("Admin user already exists:\n")
		fmt.Printf("Email: %s\n", existingAdmin.Email)
		fmt.Printf("Username: %s\n", existingAdmin.Username)
		fmt.Printf("Role: %s\n", existingAdmin.Role)
		fmt.Println("\nTo reset admin password, delete the user first or use SQL directly.")
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(adminPassword)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Create admin user
	admin := models.User{
		Username:  adminUsername,
		Email:     adminEmail,
		Password:  hashedPassword,
		FirstName: adminFirstName,
		LastName:  adminLastName,
		Role:      "super_admin",
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
}

