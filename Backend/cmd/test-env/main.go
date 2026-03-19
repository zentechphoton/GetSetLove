package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("Testing environment variables...")
	
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY") 
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")
	
	fmt.Printf("CLOUDINARY_CLOUD_NAME: '%s' (length: %d)\n", cloudName, len(cloudName))
	fmt.Printf("CLOUDINARY_API_KEY: '%s' (length: %d)\n", apiKey, len(apiKey))
	fmt.Printf("CLOUDINARY_API_SECRET: '%s' (length: %d)\n", apiSecret, len(apiSecret))
	
	if cloudName == "" || apiKey == "" || apiSecret == "" {
		fmt.Println("❌ Cloudinary credentials are missing!")
		fmt.Println("Make sure your .env file is in the same directory and contains:")
		fmt.Println("CLOUDINARY_CLOUD_NAME=your_cloud_name")
		fmt.Println("CLOUDINARY_API_KEY=your_api_key") 
		fmt.Println("CLOUDINARY_API_SECRET=your_api_secret")
	} else {
		fmt.Println("✅ All Cloudinary credentials are set")
	}
}