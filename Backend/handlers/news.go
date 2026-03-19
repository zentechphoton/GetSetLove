package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gsl-backend/database"
	"gsl-backend/models"
	"gsl-backend/utils"
	"gorm.io/gorm"
)

// GetNewsStats gets news statistics (admin only)
func GetNewsStats(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var totalNews int64
	var publishedNews int64
	var draftNews int64

	if err := database.DB.Model(&models.News{}).Count(&totalNews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get stats: %v", err)})
		return
	}

	if err := database.DB.Model(&models.News{}).Where("status = ?", "published").Count(&publishedNews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get stats: %v", err)})
		return
	}

	if err := database.DB.Model(&models.News{}).Where("status = ?", "draft").Count(&draftNews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get stats: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_news":     totalNews,
		"published_news": publishedNews,
		"draft_news":     draftNews,
	})
}

// GetNews gets all news (admin only)
func GetNews(c *gin.Context) {
	userRole := c.GetString("user_role")

	var news []models.News
	// Preload Author - handle gracefully if author doesn't exist
	query := database.DB.Preload("Author")

	if userRole != "admin" && userRole != "super_admin" {
		// Regular users cannot access news management
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := query.Order("created_at DESC").Find(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch news: %v", err)})
		return
	}

	// Return empty array if no news found (not an error)
	if news == nil {
		news = []models.News{}
	}

	c.JSON(http.StatusOK, news)
}

// GetPublicNews gets all published news (public)
func GetPublicNews(c *gin.Context) {
	var news []models.News
	query := database.DB.Preload("Author").Where("status = ?", "published")
	
	if err := query.Order("created_at DESC").Find(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch news: %v", err)})
		return
	}

	// Return empty array if no news found (not an error)
	if news == nil {
		news = []models.News{}
	}

	c.JSON(http.StatusOK, news)
}

// GetFeaturedNews gets the latest published news (public)
func GetFeaturedNews(c *gin.Context) {
	var newsItem models.News
	if err := database.DB.Preload("Author").Where("status = ?", "published").Order("created_at DESC").First(&newsItem).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, nil)
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch featured news"})
		return
	}

	c.JSON(http.StatusOK, newsItem)
}

// GetNewsBySlug gets a news item by slug (public)
func GetNewsBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var newsItem models.News
	if err := database.DB.Preload("Author").Where("slug = ? AND status = ?", slug, "published").First(&newsItem).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "News not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch news"})
		return
	}

	c.JSON(http.StatusOK, newsItem)
}

// GetNewsItem gets a single news item by ID
func GetNewsItem(c *gin.Context) {
	id := c.Param("id")
	userRole := c.GetString("user_role")

	var newsItem models.News
	query := database.DB.Preload("Author").Where("id = ?", id)

	if userRole != "admin" && userRole != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := query.First(&newsItem).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "News not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch news"})
		return
	}

	c.JSON(http.StatusOK, newsItem)
}

// CreateNews creates a new news item (admin only)
func CreateNews(c *gin.Context) {
	userID := c.GetString("user_id")
	userRole := c.GetString("user_role")

	if userRole != "admin" && userRole != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can create news"})
		return
	}

	var req struct {
		Title   string `json:"title" binding:"required"`
		Slug    string `json:"slug"`
		Excerpt string `json:"excerpt"`
		Content string `json:"content" binding:"required"`
		Image   string `json:"image"`
		Status  string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log received data for debugging
	fmt.Printf("CreateNews - Received request: Title=%s, Image=%s, Status=%s\n", req.Title, req.Image, req.Status)

	// Generate slug if not provided
	slug := req.Slug
	if slug == "" {
		slug = GenerateSlug(req.Title)
		// Ensure uniqueness
		var count int64
		database.DB.Model(&models.News{}).Where("slug = ?", slug).Count(&count)
		if count > 0 {
			slug = fmt.Sprintf("%s-%d", slug, time.Now().Unix())
		}
	} else {
		// Check if slug already exists
		var existingNews models.News
		if err := database.DB.Where("slug = ?", slug).First(&existingNews).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Slug already exists"})
			return
		}
	}

	// Validate status
	status := req.Status
	if status == "" {
		status = "draft"
	}
	if status != "draft" && status != "published" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status. Must be 'draft' or 'published'"})
		return
	}

	newsItem := models.News{
		Title:    req.Title,
		Slug:     slug,
		Excerpt:  req.Excerpt,
		Content:  req.Content,
		Image:    req.Image, // Save image URL (can be empty string)
		Status:   status,
		AuthorID: userID,
	}

	fmt.Printf("CreateNews - Creating news with Image=%s, Status=%s\n", newsItem.Image, newsItem.Status)

	if err := database.DB.Create(&newsItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create news: %v", err)})
		return
	}

	// Load author
	database.DB.Preload("Author").First(&newsItem, newsItem.ID)

	fmt.Printf("CreateNews - News created successfully with ID=%s, Image=%s, Status=%s\n", newsItem.ID, newsItem.Image, newsItem.Status)

	c.JSON(http.StatusCreated, newsItem)
}

// UpdateNews updates a news item
func UpdateNews(c *gin.Context) {
	id := c.Param("id")
	userRole := c.GetString("user_role")

	if userRole != "admin" && userRole != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can update news"})
		return
	}

	var newsItem models.News
	query := database.DB.Where("id = ?", id)

	if err := query.First(&newsItem).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "News not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch news"})
		return
	}

	var req struct {
		Title   string `json:"title"`
		Slug    string `json:"slug"`
		Excerpt string `json:"excerpt"`
		Content string `json:"content"`
		Image   string `json:"image"`
		Status  string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	if req.Title != "" {
		newsItem.Title = req.Title
		// Regenerate slug if title changed and slug not provided
		if req.Slug == "" {
			newsItem.Slug = GenerateSlug(req.Title)
			// Ensure uniqueness
			var count int64
			database.DB.Model(&models.News{}).Where("slug = ? AND id != ?", newsItem.Slug, id).Count(&count)
			if count > 0 {
				newsItem.Slug = fmt.Sprintf("%s-%d", newsItem.Slug, time.Now().Unix())
			}
		}
	}

	if req.Slug != "" {
		// Check if slug already exists (excluding current news)
		var existingNews models.News
		if err := database.DB.Where("slug = ? AND id != ?", req.Slug, id).First(&existingNews).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Slug already exists"})
			return
		}
		newsItem.Slug = req.Slug
	}

	if req.Excerpt != "" {
		newsItem.Excerpt = req.Excerpt
	}

	if req.Content != "" {
		newsItem.Content = req.Content
	}

	if req.Image != "" {
		newsItem.Image = req.Image
	}

	if req.Status != "" {
		if req.Status != "draft" && req.Status != "published" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status. Must be 'draft' or 'published'"})
			return
		}
		newsItem.Status = req.Status
	}

	if err := database.DB.Save(&newsItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update news"})
		return
	}

	// Load author
	database.DB.Preload("Author").First(&newsItem, newsItem.ID)

	c.JSON(http.StatusOK, newsItem)
}

// DeleteNews deletes a news item
func DeleteNews(c *gin.Context) {
	id := c.Param("id")
	userRole := c.GetString("user_role")

	if userRole != "admin" && userRole != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can delete news"})
		return
	}

	var newsItem models.News
	query := database.DB.Where("id = ?", id)

	if err := query.First(&newsItem).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "News not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch news"})
		return
	}

	if err := database.DB.Delete(&newsItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete news"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "News deleted successfully"})
}

// UploadNewsImage handles image upload to Cloudinary for news
func UploadNewsImage(c *gin.Context) {
	// Verify user is authenticated (middleware should handle this, but double-check)
	userID := c.GetString("user_id")
	userRole := c.GetString("user_role")
	
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	if userRole != "admin" && userRole != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can upload news images"})
		return
	}
	
	// Debug: Check if Cloudinary env vars are loaded
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")
	fmt.Printf("Cloudinary Config - Name: %s, Key: %s, Secret: %s\n", 
		cloudName, apiKey, strings.Repeat("*", len(apiSecret)))
	
	if cloudName == "" || apiKey == "" || apiSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloudinary not configured"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}

	// Validate file size (max 10MB)
	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 10MB limit"})
		return
	}

	// Open file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer src.Close()

	// Upload to Cloudinary
	fmt.Printf("Uploading news image file: %s, size: %d bytes\n", file.Filename, file.Size)
	imageURL, err := utils.UploadImage(src, file.Filename)
	if err != nil {
		fmt.Printf("ERROR in UploadNewsImage: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload image: %v", err)})
		return
	}

	// Validate that we got a URL
	if imageURL == "" {
		fmt.Printf("CRITICAL ERROR: UploadImage returned empty URL without error!\n")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload succeeded but no URL was returned"})
		return
	}

	fmt.Printf("UploadNewsImage - SUCCESS: Image uploaded, URL: %s\n", imageURL)
	c.JSON(http.StatusOK, gin.H{"url": imageURL})
}

