package database

import (
	"fmt"
	"log"
	"os"
	"strings"

	"gsl-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase initializes the database connection
func InitDatabase() {
	// Get database connection string from environment
	dsn := os.Getenv("DATABASE_URL")

	// Fallback to individual components
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "postgres"
	}
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "gsl_db"
	}
	port := strings.TrimSpace(os.Getenv("DB_PORT"))
	if port == "" {
		port = "5432"
	} else {
		// Extract only numeric characters from port (in case it has extra text like "5432run")
		var portBuilder strings.Builder
		for _, r := range port {
			if r >= '0' && r <= '9' {
				portBuilder.WriteRune(r)
			}
		}
		port = portBuilder.String()
		if port == "" {
			port = "5432"
		}
	}
	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}

	if dsn == "" {
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			host, user, password, dbname, port, sslmode)
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		// Check if error is "database does not exist"
		if strings.Contains(err.Error(), "does not exist") || strings.Contains(err.Error(), "3D000") {
			log.Println("Database 'gsl_db' does not exist. Attempting to create it...")

			// Connect to default 'postgres' database to create 'gsl_db'
			var defaultDSN string
			if dsn != "" {
				// Replace database name in connection string
				defaultDSN = strings.ReplaceAll(dsn, "dbname=gsl_db", "dbname=postgres")
				defaultDSN = strings.ReplaceAll(defaultDSN, "/gsl_db?", "/postgres?")
				defaultDSN = strings.ReplaceAll(defaultDSN, "/gsl_db\"", "/postgres\"")
			} else {
				defaultDSN = fmt.Sprintf("host=%s user=%s password=%s dbname=postgres port=%s sslmode=%s",
					host, user, password, port, sslmode)
			}

			// Create temporary connection to postgres database
			tempDB, tempErr := gorm.Open(postgres.Open(defaultDSN), &gorm.Config{
				Logger: logger.Default.LogMode(logger.Silent),
			})

			if tempErr != nil {
				log.Fatal("Failed to connect to PostgreSQL server to create database:", tempErr)
			}

			// Create database
			createDBErr := tempDB.Exec("CREATE DATABASE gsl_db").Error
			if createDBErr != nil {
				// Check if database already exists
				if !strings.Contains(createDBErr.Error(), "already exists") {
					log.Fatal("Failed to create database 'gsl_db':", createDBErr)
				}
				log.Println("Database 'gsl_db' already exists.")
			} else {
				log.Println("Database 'gsl_db' created successfully.")
			}

			// Close temporary connection
			sqlDB, _ := tempDB.DB()
			sqlDB.Close()

			// Now try to connect to gsl_db again
			DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
				Logger: logger.Default.LogMode(logger.Info),
			})

			if err != nil {
				log.Fatal("Failed to connect to database after creation:", err)
			}
		} else {
			log.Fatal("Failed to connect to database:", err)
		}
	}

	log.Println("Database connected successfully")

	// Auto-migrate models
	err = DB.AutoMigrate(
		&models.UserSettings{},
		&models.VerificationRequest{},
		&models.User{},
		// Add other models here
	)

	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migration completed")
}
