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

// GenerateSlug generates a URL-friendly slug from title
func GenerateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "'", "")
	slug = strings.ReplaceAll(slug, "\"", "")
	slug = strings.ReplaceAll(slug, ",", "")
	slug = strings.ReplaceAll(slug, ".", "")
	slug = strings.ReplaceAll(slug, "!", "")
	slug = strings.ReplaceAll(slug, "?", "")
	slug = strings.ReplaceAll(slug, "&", "and")
	slug = strings.ReplaceAll(slug, "/", "-")
	slug = strings.ReplaceAll(slug, "\\", "-")
	return slug
}

// GetBlogSettings gets blog settings (public endpoint)
func GetBlogSettings(c *gin.Context) {
	var settings models.BlogSettings
	if err := database.DB.First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// If no settings exist, create default
			settings = models.BlogSettings{
				UserBlogAccess: false,
			}
			if createErr := database.DB.Create(&settings).Error; createErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create settings: %v", createErr)})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch settings: %v", err)})
			return
		}
	}
	c.JSON(http.StatusOK, settings)
}

// UpdateBlogSettings updates blog settings (admin only)
func UpdateBlogSettings(c *gin.Context) {
	var req struct {
		UserBlogAccess bool `json:"user_blog_access"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var settings models.BlogSettings
	if err := database.DB.First(&settings).Error; err != nil {
		// Create if doesn't exist
		settings = models.BlogSettings{
			UserBlogAccess: req.UserBlogAccess,
		}
		if err := database.DB.Create(&settings).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create settings"})
			return
		}
	} else {
		settings.UserBlogAccess = req.UserBlogAccess
		if err := database.DB.Save(&settings).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
			return
		}
	}

	c.JSON(http.StatusOK, settings)
}

// GetBlogStats gets blog statistics (admin only)
func GetBlogStats(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var totalBlogs int64
	var publishedBlogs int64
	var draftBlogs int64

	if err := database.DB.Model(&models.Blog{}).Count(&totalBlogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get stats: %v", err)})
		return
	}

	if err := database.DB.Model(&models.Blog{}).Where("status = ?", "published").Count(&publishedBlogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get stats: %v", err)})
		return
	}

	if err := database.DB.Model(&models.Blog{}).Where("status = ?", "draft").Count(&draftBlogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get stats: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_blogs":     totalBlogs,
		"published_blogs": publishedBlogs,
		"draft_blogs":     draftBlogs,
	})
}

// GetBlogs gets all blogs (admin) or user's blogs (user)
func GetBlogs(c *gin.Context) {
	userID := c.GetString("user_id")
	userRole := c.GetString("user_role")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var blogs []models.Blog
	// Preload Author - handle gracefully if author doesn't exist
	query := database.DB.Preload("Author")

	if userRole != "admin" && userRole != "super_admin" {
		// Regular users only see their own blogs
		query = query.Where("author_id = ?", userID)
	}

	if err := query.Order("created_at DESC").Find(&blogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch blogs: %v", err)})
		return
	}

	// Return empty array if no blogs found (not an error)
	if blogs == nil {
		blogs = []models.Blog{}
	}

	c.JSON(http.StatusOK, blogs)
}

// GetPublicBlogs gets all published blogs (public)
func GetPublicBlogs(c *gin.Context) {
	var blogs []models.Blog
	query := database.DB.Preload("Author").Where("status = ?", "published")
	
	if err := query.Order("created_at DESC").Find(&blogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch blogs: %v", err)})
		return
	}

	// Return empty array if no blogs found (not an error)
	if blogs == nil {
		blogs = []models.Blog{}
	}

	c.JSON(http.StatusOK, blogs)
}

// GetFeaturedBlog gets the latest published blog (public)
func GetFeaturedBlog(c *gin.Context) {
	var blog models.Blog
	if err := database.DB.Preload("Author").Where("status = ?", "published").Order("created_at DESC").First(&blog).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, nil)
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch featured blog"})
		return
	}

	c.JSON(http.StatusOK, blog)
}

// GetBlogBySlug gets a blog by slug (public)
func GetBlogBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var blog models.Blog
	if err := database.DB.Preload("Author").Where("slug = ? AND status = ?", slug, "published").First(&blog).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blog"})
		return
	}

	c.JSON(http.StatusOK, blog)
}

// GetBlog gets a single blog by ID
func GetBlog(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")
	userRole := c.GetString("user_role")

	var blog models.Blog
	query := database.DB.Preload("Author").Where("id = ?", id)

	if userRole != "admin" && userRole != "super_admin" {
		// Regular users can only access their own blogs
		query = query.Where("author_id = ?", userID)
	}

	if err := query.First(&blog).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blog"})
		return
	}

	c.JSON(http.StatusOK, blog)
}

// CreateBlog creates a new blog
func CreateBlog(c *gin.Context) {
	userID := c.GetString("user_id")
	userRole := c.GetString("user_role")

	// Check if user blog access is enabled for regular users
	if userRole != "admin" && userRole != "super_admin" {
		var settings models.BlogSettings
		if err := database.DB.First(&settings).Error; err != nil || !settings.UserBlogAccess {
			c.JSON(http.StatusForbidden, gin.H{"error": "User blog creation is disabled"})
			return
		}
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
	fmt.Printf("CreateBlog - Received request: Title=%s, Image=%s, Status=%s\n", req.Title, req.Image, req.Status)

	// Generate slug if not provided
	slug := req.Slug
	if slug == "" {
		slug = GenerateSlug(req.Title)
		// Ensure uniqueness
		var count int64
		database.DB.Model(&models.Blog{}).Where("slug = ?", slug).Count(&count)
		if count > 0 {
			slug = fmt.Sprintf("%s-%d", slug, time.Now().Unix())
		}
	} else {
		// Check if slug already exists
		var existingBlog models.Blog
		if err := database.DB.Where("slug = ?", slug).First(&existingBlog).Error; err == nil {
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

	blog := models.Blog{
		Title:    req.Title,
		Slug:     slug,
		Excerpt:  req.Excerpt,
		Content:  req.Content,
		Image:    req.Image, // Save image URL (can be empty string)
		Status:   status,
		AuthorID: userID,
	}

	fmt.Printf("CreateBlog - Creating blog with Image=%s, Status=%s\n", blog.Image, blog.Status)

	if err := database.DB.Create(&blog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create blog: %v", err)})
		return
	}

	// Load author
	database.DB.Preload("Author").First(&blog, blog.ID)

	fmt.Printf("CreateBlog - Blog created successfully with ID=%s, Image=%s, Status=%s\n", blog.ID, blog.Image, blog.Status)

	c.JSON(http.StatusCreated, blog)
}

// UpdateBlog updates a blog
func UpdateBlog(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")
	userRole := c.GetString("user_role")

	var blog models.Blog
	query := database.DB.Where("id = ?", id)

	if userRole != "admin" && userRole != "super_admin" {
		query = query.Where("author_id = ?", userID)
	}

	if err := query.First(&blog).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blog"})
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
		blog.Title = req.Title
		// Regenerate slug if title changed and slug not provided
		if req.Slug == "" {
			blog.Slug = GenerateSlug(req.Title)
			// Ensure uniqueness
			var count int64
			database.DB.Model(&models.Blog{}).Where("slug = ? AND id != ?", blog.Slug, id).Count(&count)
			if count > 0 {
				blog.Slug = fmt.Sprintf("%s-%d", blog.Slug, time.Now().Unix())
			}
		}
	}

	if req.Slug != "" {
		// Check if slug already exists (excluding current blog)
		var existingBlog models.Blog
		if err := database.DB.Where("slug = ? AND id != ?", req.Slug, id).First(&existingBlog).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Slug already exists"})
			return
		}
		blog.Slug = req.Slug
	}

	if req.Excerpt != "" {
		blog.Excerpt = req.Excerpt
	}

	if req.Content != "" {
		blog.Content = req.Content
	}

	if req.Image != "" {
		blog.Image = req.Image
	}

	if req.Status != "" {
		if req.Status != "draft" && req.Status != "published" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status. Must be 'draft' or 'published'"})
			return
		}
		blog.Status = req.Status
	}

	if err := database.DB.Save(&blog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update blog"})
		return
	}

	// Load author
	database.DB.Preload("Author").First(&blog, blog.ID)

	c.JSON(http.StatusOK, blog)
}

// DeleteBlog deletes a blog
func DeleteBlog(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")
	userRole := c.GetString("user_role")

	var blog models.Blog
	query := database.DB.Where("id = ?", id)

	if userRole != "admin" && userRole != "super_admin" {
		query = query.Where("author_id = ?", userID)
	}

	if err := query.First(&blog).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blog"})
		return
	}

	if err := database.DB.Delete(&blog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog deleted successfully"})
}

// UploadBlogImage handles image upload to Cloudinary
func UploadBlogImage(c *gin.Context) {
	// Verify user is authenticated (middleware should handle this, but double-check)
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
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
	fmt.Printf("Uploading file: %s, size: %d bytes\n", file.Filename, file.Size)
	imageURL, err := utils.UploadImage(src, file.Filename)
	if err != nil {
		fmt.Printf("ERROR in UploadBlogImage: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload image: %v", err)})
		return
	}

	// Validate that we got a URL
	if imageURL == "" {
		fmt.Printf("CRITICAL ERROR: UploadImage returned empty URL without error!\n")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload succeeded but no URL was returned"})
		return
	}

	fmt.Printf("UploadBlogImage - SUCCESS: Image uploaded, URL: %s\n", imageURL)
	fmt.Printf("URL Length: %d characters\n", len(imageURL))
	fmt.Printf("URL Valid: %v\n", len(imageURL) > 0 && (strings.HasPrefix(imageURL, "http://") || strings.HasPrefix(imageURL, "https://")))
	c.JSON(http.StatusOK, gin.H{"url": imageURL})
}

