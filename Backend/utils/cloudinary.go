package utils

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// UploadImage uploads an image to Cloudinary and returns the secure URL
func UploadImage(file multipart.File, filename string) (string, error) {
	// Get Cloudinary credentials from environment
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return "", fmt.Errorf("Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file")
	}

	// Validate credentials are not just whitespace
	cloudName = strings.TrimSpace(cloudName)
	apiKey = strings.TrimSpace(apiKey)
	apiSecret = strings.TrimSpace(apiSecret)

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return "", fmt.Errorf("Cloudinary credentials are empty or contain only whitespace")
	}

	fmt.Printf("Initializing Cloudinary with cloud name: %s, API key: %s\n", cloudName, apiKey)

	// Initialize Cloudinary
	ctx := context.Background()
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return "", fmt.Errorf("failed to initialize Cloudinary (check your credentials): %v", err)
	}
	
	fmt.Printf("Cloudinary initialized successfully\n")

	// Reset file position to beginning
	if seeker, ok := file.(io.Seeker); ok {
		if _, err := seeker.Seek(0, io.SeekStart); err != nil {
			return "", fmt.Errorf("failed to reset file position: %v", err)
		}
	}

	// Create temporary file to avoid file reading issues
	tmpFile, err := os.CreateTemp("", "cloudinary-upload-*"+filepath.Ext(filename))
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %v", err)
	}
	tmpFileName := tmpFile.Name()
	defer os.Remove(tmpFileName) // Clean up temp file

	// Copy file content to temp file
	_, err = io.Copy(tmpFile, file)
	if err != nil {
		tmpFile.Close()
		return "", fmt.Errorf("failed to copy file: %v", err)
	}

	// Close temp file after writing
	tmpFile.Close()

	// Generate a unique public ID from filename
	ext := filepath.Ext(filename)
	publicID := strings.TrimSuffix(filename, ext)
	// Remove any path separators and sanitize
	publicID = strings.ReplaceAll(publicID, "/", "_")
	publicID = strings.ReplaceAll(publicID, "\\", "_")
	
	// Add folder prefix
	publicID = fmt.Sprintf("gsl-blogs/%s", publicID)

	// Check if temp file exists and has content
	fileInfo, err := os.Stat(tmpFileName)
	if err != nil {
		return "", fmt.Errorf("failed to stat temp file: %v", err)
	}
	if fileInfo.Size() == 0 {
		return "", fmt.Errorf("temp file is empty")
	}
	fmt.Printf("Temp file created: %s, size: %d bytes\n", tmpFileName, fileInfo.Size())

	// Open the temp file for reading
	fileReader, err := os.Open(tmpFileName)
	if err != nil {
		return "", fmt.Errorf("failed to open temp file for reading: %v", err)
	}
	defer fileReader.Close()

	// Upload with explicit parameters using file reader
	overwrite := true
	fmt.Printf("Uploading to Cloudinary with PublicID: %s\n", publicID)
	
	uploadResult, err := cld.Upload.Upload(
		ctx,
		fileReader, // Use file reader
		uploader.UploadParams{
			PublicID:     publicID,
			ResourceType: "image",
			Overwrite:    &overwrite,
		},
	)
	if err != nil {
		fmt.Printf("Cloudinary upload error: %v\n", err)
		fmt.Printf("Error type: %T\n", err)
		fmt.Printf("Error details: %+v\n", err)
		return "", fmt.Errorf("failed to upload image to Cloudinary: %v", err)
	}

	// Check if uploadResult is nil
	if uploadResult == nil {
		return "", fmt.Errorf("Cloudinary upload returned nil result - upload may have failed silently. Check your Cloudinary credentials and account status")
	}

	// Debug: Print full upload result
	fmt.Printf("Cloudinary upload result received:\n")
	fmt.Printf("  Result is nil: %v\n", uploadResult == nil)
	if uploadResult != nil {
		fmt.Printf("  PublicID: '%s' (empty: %v)\n", uploadResult.PublicID, uploadResult.PublicID == "")
		fmt.Printf("  Format: '%s' (empty: %v)\n", uploadResult.Format, uploadResult.Format == "")
		fmt.Printf("  SecureURL: '%s' (empty: %v)\n", uploadResult.SecureURL, uploadResult.SecureURL == "")
		fmt.Printf("  URL: '%s' (empty: %v)\n", uploadResult.URL, uploadResult.URL == "")
		fmt.Printf("  Width: %d\n", uploadResult.Width)
		fmt.Printf("  Height: %d\n", uploadResult.Height)
		fmt.Printf("  Bytes: %d\n", uploadResult.Bytes)
		fmt.Printf("  CreatedAt: %v\n", uploadResult.CreatedAt)
		fmt.Printf("  ResourceType: '%s' (empty: %v)\n", uploadResult.ResourceType, uploadResult.ResourceType == "")
		
		// Check if result looks invalid (all fields empty)
		if uploadResult.PublicID == "" && uploadResult.Format == "" && uploadResult.SecureURL == "" && 
		   uploadResult.URL == "" && uploadResult.ResourceType == "" {
			fmt.Printf("WARNING: Upload result appears to be empty/invalid. This may indicate:\n")
			fmt.Printf("  1. Invalid Cloudinary credentials\n")
			fmt.Printf("  2. Cloudinary account restrictions (quota, suspended, etc.)\n")
			fmt.Printf("  3. Network/connectivity issues\n")
		}
	}

	// Try to get URL from multiple sources
	var imageURL string
	
	// First priority: SecureURL
	if uploadResult.SecureURL != "" {
		imageURL = uploadResult.SecureURL
		fmt.Printf("Using SecureURL: %s\n", imageURL)
		return imageURL, nil
	}
	
	// Second priority: Regular URL
	if uploadResult.URL != "" {
		imageURL = uploadResult.URL
		fmt.Printf("Using URL: %s\n", imageURL)
		return imageURL, nil
	}
	
	// Third priority: Construct from PublicID and cloud name
	// Even if PublicID is empty, try using the one we sent
	actualPublicID := uploadResult.PublicID
	if actualPublicID == "" {
		actualPublicID = publicID // Use the one we sent
		fmt.Printf("WARNING: UploadResult.PublicID is empty, using sent PublicID: %s\n", actualPublicID)
	}
	
	if actualPublicID != "" && cloudName != "" {
		format := uploadResult.Format
		if format == "" && ext != "" {
			format = strings.TrimPrefix(ext, ".")
		}
		if format == "" {
			format = "jpg" // Default fallback
		}
		
		imageURL = fmt.Sprintf("https://res.cloudinary.com/%s/image/upload/%s.%s", 
			cloudName, actualPublicID, format)
		fmt.Printf("Constructed URL from PublicID: %s\n", imageURL)
		return imageURL, nil
	}

	// If we get here, we have no way to construct a URL
	errorDetails := fmt.Sprintf("PublicID: '%s', Format: '%s', SecureURL: '%s', URL: '%s'", 
		uploadResult.PublicID, uploadResult.Format, uploadResult.SecureURL, uploadResult.URL)
	return "", fmt.Errorf("Cloudinary upload failed - no URLs returned. Check Cloudinary credentials and account status. Details: %s", errorDetails)
}

// DeleteImage deletes an image from Cloudinary
func DeleteImage(publicID string) error {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		return fmt.Errorf("Cloudinary credentials not configured")
	}

	ctx := context.Background()
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return fmt.Errorf("failed to initialize Cloudinary: %v", err)
	}

	_, err = cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})

	return err
}