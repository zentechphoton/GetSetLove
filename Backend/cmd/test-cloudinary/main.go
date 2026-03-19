package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("Testing Cloudinary credentials...")

	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Load environment variables
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	fmt.Printf("Cloud Name: %s\n", cloudName)
	fmt.Printf("API Key: %s\n", apiKey)
	fmt.Printf("API Secret: %s\n", strings.Repeat("*", len(apiSecret)))

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		fmt.Println("❌ Missing Cloudinary credentials")
		return
	}

	// Initialize Cloudinary
	ctx := context.Background()
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		fmt.Printf("❌ Failed to initialize Cloudinary: %v\n", err)
		return
	}

	fmt.Println("✅ Cloudinary initialized successfully")

	// Test upload with a simple text file
	testData := "Hello Cloudinary Test"
	
	uploadResult, err := cld.Upload.Upload(
		ctx,
		strings.NewReader(testData),
		uploader.UploadParams{
			PublicID:     "test-upload",
			ResourceType: "raw",
		},
	)
	
	if err != nil {
		fmt.Printf("❌ Upload failed: %v\n", err)
		return
	}

	fmt.Println("✅ Upload successful!")
	fmt.Printf("SecureURL: %s\n", uploadResult.SecureURL)
	fmt.Printf("URL: %s\n", uploadResult.URL)
	fmt.Printf("PublicID: %s\n", uploadResult.PublicID)
}