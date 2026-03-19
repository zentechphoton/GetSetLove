package handlers

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
	"gsl-backend/database"
	"gsl-backend/models"
	"gsl-backend/pkg/natsutil"
	"gsl-backend/services/chat"
)

// GetUsers returns a list of all users (admin only)
func GetUsers(c *gin.Context) {
	var users []models.User
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Search filter
	search := c.Query("search")
	query := database.DB.Model(&models.User{})
	
	if search != "" {
		query = query.Where("username ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Get total count
	var total int64
	query.Count(&total)

	// Get users
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Format response (exclude passwords)
	var userList []gin.H
	for _, user := range users {
		userList = append(userList, gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"first_name":  user.FirstName,
			"last_name":   user.LastName,
			"avatar":      user.Avatar,
			"role":        user.Role,
			"is_verified": user.IsVerified,
			"is_premium":  user.IsPremium,
			"created_at":  user.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"users": userList,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GetUser returns a single user by ID (admin only)
func GetUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          user.ID,
		"username":    user.Username,
		"email":       user.Email,
		"first_name":  user.FirstName,
		"last_name":   user.LastName,
		"avatar":      user.Avatar,
		"role":        user.Role,
		"is_verified": user.IsVerified,
		"is_premium":  user.IsPremium,
		"created_at":  user.CreatedAt,
		"updated_at":  user.UpdatedAt,
	})
}

// UpdateUserRole updates a user's role (admin only)
func UpdateUserRole(c *gin.Context) {
	userID := c.Param("id")

	var req struct {
		Role string `json:"role" binding:"required,oneof=user admin super_admin"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Role = req.Role
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User role updated successfully",
		"user": gin.H{
			"id":   user.ID,
			"role": user.Role,
		},
	})
}

// UpdateUser updates a user's information (admin only)
func UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	var req struct {
		Username   string `json:"username"`
		Email      string `json:"email"`
		FirstName  string `json:"first_name"`
		LastName   string `json:"last_name"`
		IsVerified bool   `json:"is_verified"`
		IsPremium  bool   `json:"is_premium"`
		Role       string `json:"role"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check for unique constraints if username or email is being changed
	if req.Username != "" && req.Username != user.Username {
		var existingUser models.User
		if err := database.DB.Where("username = ? AND id != ?", req.Username, userID).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
			return
		}
		user.Username = req.Username
	}
	if req.Email != "" && req.Email != user.Email {
		var existingUser models.User
		if err := database.DB.Where("email = ? AND id != ?", req.Email, userID).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already taken"})
			return
		}
		user.Email = req.Email
	}
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	user.IsVerified = req.IsVerified
	user.IsPremium = req.IsPremium
	if req.Role != "" {
		user.Role = req.Role
	}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"first_name":  user.FirstName,
			"last_name":   user.LastName,
			"role":        user.Role,
			"is_verified": user.IsVerified,
			"is_premium":  user.IsPremium,
		},
	})
}

// DeleteUser deletes a user (admin only)
func DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Prevent deleting yourself
	currentUserID, exists := c.Get("user_id")
	if exists && currentUserID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot delete your own account"})
		return
	}

	// Soft delete (using GORM's Delete method)
	if err := database.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted successfully",
	})
}

// VerifyUser verifies a user's profile (admin only)
func VerifyUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.IsVerified = true
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify user: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User verified successfully",
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"is_verified": user.IsVerified,
		},
	})
}

// UnverifyUser removes verification from a user (admin only)
func UnverifyUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.IsVerified = false
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unverify user: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User verification removed successfully",
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"is_verified": user.IsVerified,
		},
	})
}

// GetVerificationRequests gets all verification requests (admin only)
func GetVerificationRequests(c *gin.Context) {
	var requests []models.VerificationRequest
	
	// Get query parameters
	status := c.Query("status") // pending, approved, rejected, all
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	query := database.DB.Preload("User").Order("created_at DESC")

	// Filter by status if provided
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	// Get total count
	var total int64
	query.Model(&models.VerificationRequest{}).Count(&total)

	// Get paginated results
	if err := query.Offset(offset).Limit(limit).Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch verification requests"})
		return
	}

	// Format response
	requestList := make([]gin.H, len(requests))
	for i, req := range requests {
		var reviewedBy *string = nil
		if req.ReviewedBy != nil {
			reviewedBy = req.ReviewedBy
		}
		requestList[i] = gin.H{
			"id":             req.ID,
			"user": gin.H{
				"id":         req.User.ID,
				"username":   req.User.Username,
				"email":      req.User.Email,
				"first_name": req.User.FirstName,
				"last_name":  req.User.LastName,
				"avatar":     req.User.Avatar,
				"is_verified": req.User.IsVerified,
			},
			"document_url":    req.DocumentURL,
			"message":         req.Message,
			"status":          req.Status,
			"reviewed_by":     reviewedBy,
			"reviewed_at":     req.ReviewedAt,
			"rejection_reason": req.RejectionReason,
			"created_at":      req.CreatedAt,
			"updated_at":      req.UpdatedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"requests": requestList,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// ApproveVerificationRequest approves a verification request (admin only)
func ApproveVerificationRequest(c *gin.Context) {
	requestID := c.Param("id")
	adminID, _ := c.Get("user_id")
	adminIDStr := adminID.(string)

	var request models.VerificationRequest
	if err := database.DB.Preload("User").Where("id = ?", requestID).First(&request).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Verification request not found"})
		return
	}

	if request.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This request has already been processed"})
		return
	}

	// Update request status
	now := time.Now()
	request.Status = "approved"
	reviewedBy := adminIDStr
	request.ReviewedBy = &reviewedBy
	request.ReviewedAt = &now

	if err := database.DB.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve verification request"})
		return
	}

	// Update user verification status
	request.User.IsVerified = true
	if err := database.DB.Save(&request.User).Error; err != nil {
		log.Printf("Error updating user verification status: %v", err)
		// Don't fail the request, just log the error
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Verification request approved successfully",
		"request": gin.H{
			"id":     request.ID,
			"status": request.Status,
			"user": gin.H{
				"id":          request.User.ID,
				"username":    request.User.Username,
				"is_verified": request.User.IsVerified,
			},
		},
	})
}

// RejectVerificationRequest rejects a verification request (admin only)
func RejectVerificationRequest(c *gin.Context) {
	requestID := c.Param("id")
	adminID, _ := c.Get("user_id")
	adminIDStr := adminID.(string)

	var req struct {
		Reason string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var request models.VerificationRequest
	if err := database.DB.Preload("User").Where("id = ?", requestID).First(&request).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Verification request not found"})
		return
	}

	if request.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This request has already been processed"})
		return
	}

	// Update request status
	now := time.Now()
	request.Status = "rejected"
	reviewedBy := adminIDStr
	request.ReviewedBy = &reviewedBy
	request.ReviewedAt = &now
	request.RejectionReason = req.Reason

	if err := database.DB.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject verification request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Verification request rejected successfully",
		"request": gin.H{
			"id":              request.ID,
			"status":          request.Status,
			"rejection_reason": request.RejectionReason,
		},
	})
}

// GetAdminMatches returns all matches (admin only)
func GetAdminMatches(c *gin.Context) {
	var matches []models.Match

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	// Get total count
	var total int64
	database.DB.Model(&models.Match{}).Count(&total)

	// Get matches with user relationships
	if err := database.DB.
		Preload("User1").
		Preload("User2").
		Preload("Chat").
		Order("matched_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&matches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch matches"})
		return
	}

	// Format response
	var matchList []gin.H
	for _, match := range matches {
		matchList = append(matchList, gin.H{
			"id":          match.ID,
			"user1_id":    match.User1ID,
			"user2_id":    match.User2ID,
			"user1": gin.H{
				"id":         match.User1.ID,
				"username":   match.User1.Username,
				"email":      match.User1.Email,
				"first_name": match.User1.FirstName,
				"last_name":  match.User1.LastName,
			},
			"user2": gin.H{
				"id":         match.User2.ID,
				"username":   match.User2.Username,
				"email":      match.User2.Email,
				"first_name": match.User2.FirstName,
				"last_name":  match.User2.LastName,
			},
			"status":     match.Status,
			"matched_at": match.MatchedAt,
			"chat_id":    match.ChatID,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"matches": matchList,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

// DeleteMatch deletes a match (admin only)
func DeleteMatch(c *gin.Context) {
	matchID := c.Param("id")

	var match models.Match
	if err := database.DB.Where("id = ?", matchID).First(&match).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	// Soft delete (using GORM's Delete method)
	if err := database.DB.Delete(&match).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete match"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Match deleted successfully",
	})
}

// AdminDashboard returns admin dashboard statistics
func AdminDashboard(c *gin.Context) {
	var stats struct {
		TotalUsers      int64 `json:"total_users"`
		VerifiedUsers   int64 `json:"verified_users"`
		PremiumUsers    int64 `json:"premium_users"`
		AdminUsers      int64 `json:"admin_users"`
		NewUsersToday   int64 `json:"new_users_today"`
		TotalMatches    int64 `json:"total_matches"`
	}

	database.DB.Model(&models.User{}).Count(&stats.TotalUsers)
	database.DB.Model(&models.User{}).Where("is_verified = ?", true).Count(&stats.VerifiedUsers)
	database.DB.Model(&models.User{}).Where("is_premium = ?", true).Count(&stats.PremiumUsers)
	database.DB.Model(&models.User{}).Where("role IN ?", []string{"admin", "super_admin"}).Count(&stats.AdminUsers)
	// New users today (simplified - you might want to use date comparison)
	database.DB.Model(&models.User{}).Where("created_at > NOW() - INTERVAL '1 day'").Count(&stats.NewUsersToday)
	// Total matches count
	database.DB.Model(&models.Match{}).Count(&stats.TotalMatches)

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
	})
}

// GetReports returns reports data (admin only)
func GetReports(c *gin.Context) {
	// Placeholder for reports functionality
	c.JSON(http.StatusOK, gin.H{
		"message": "Reports endpoint - implement your reporting logic here",
		"reports": []gin.H{},
	})
}

// AdminSettings returns admin settings (admin only)
func AdminSettings(c *gin.Context) {
	// Placeholder for admin settings
	c.JSON(http.StatusOK, gin.H{
		"message": "Admin settings endpoint - implement your settings logic here",
		"settings": gin.H{},
	})
}

// CreateMatch manually creates a match between two users (admin only)
func CreateMatch(c *gin.Context) {
	log.Printf("🔵 CreateMatch handler called - Method: %s, Path: %s, FullPath: %s", 
		c.Request.Method, c.Request.URL.Path, c.FullPath())
	
	var req struct {
		User1ID string `json:"user1_id" binding:"required"`
		User2ID string `json:"user2_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	log.Printf("✅ Creating match between %s and %s", req.User1ID, req.User2ID)

	// Validate users exist
	var user1, user2 models.User
	if err := database.DB.Where("id = ?", req.User1ID).First(&user1).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User 1 not found"})
		return
	}
	if err := database.DB.Where("id = ?", req.User2ID).First(&user2).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User 2 not found"})
		return
	}

	// Check if match already exists
	var existingMatch models.Match
	err := database.DB.Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		req.User1ID, req.User2ID, req.User2ID, req.User1ID,
	).First(&existingMatch).Error

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Match already exists between these users",
			"match": gin.H{
				"id":     existingMatch.ID,
				"status": existingMatch.Status,
			},
		})
		return
	}

	// Parse UUIDs
	user1UUID, err := uuid.Parse(req.User1ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user1_id format"})
		return
	}
	user2UUID, err := uuid.Parse(req.User2ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user2_id format"})
		return
	}

	// Ensure user1_id < user2_id for uniqueness
	if user1UUID.String() > user2UUID.String() {
		user1UUID, user2UUID = user2UUID, user1UUID
	}

	// Create chat for the match first
	// Try to connect to NATS, but don't fail if it's not available
	var nc *nats.Conn
	var js nats.JetStreamContext
	
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://localhost:4222"
	}
	
	// Try to connect to NATS (non-blocking)
	nc, js, natsErr := natsutil.ConnectNATS(natsutil.JetStreamConfig{
		URL:           natsURL,
		MaxReconnects: 10,
		ReconnectWait: 2 * time.Second,
	})
	if natsErr != nil {
		// Log warning but continue - chat can be created without NATS
		// NATS is only needed for real-time features, not for basic chat creation
		log.Printf("⚠️  Warning: NATS connection failed: %v. Chat will be created without real-time features.", natsErr)
		nc = nil
		js = nil
	}

	// Create chat service (works with or without NATS)
	chatService := chat.NewChatService(database.DB, nc, js)
	
	// Validate user IDs are valid UUIDs before creating chat
	if _, err := uuid.Parse(req.User1ID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user1_id format: " + err.Error()})
		return
	}
	if _, err := uuid.Parse(req.User2ID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user2_id format: " + err.Error()})
		return
	}
	
	dmChat, chatErr := chatService.CreateDMChat(req.User1ID, req.User2ID)
	if chatErr != nil {
		log.Printf("❌ Error creating chat between %s and %s: %v", req.User1ID, req.User2ID, chatErr)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create chat: " + chatErr.Error(),
			"user1_id": req.User1ID,
			"user2_id": req.User2ID,
		})
		return
	}
	
	if dmChat == nil {
		log.Printf("❌ Error: Chat creation returned nil for users %s and %s", req.User1ID, req.User2ID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Chat creation returned nil - please check server logs"})
		return
	}
	
	log.Printf("✅ Chat created successfully: ID=%s, Type=%s, Participants=%d", 
		dmChat.ID, dmChat.Type, len(dmChat.Participants))

	// Create match with chat ID
	match := models.Match{
		User1ID: user1UUID,
		User2ID: user2UUID,
		Status:  "active",
		ChatID:  &dmChat.ID,
	}

	if err := database.DB.Create(&match).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create match: " + err.Error()})
		return
	}

	// Reload match with relationships
	database.DB.Preload("User1").Preload("User2").Preload("Chat").First(&match, match.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Match and chat created successfully",
		"match": gin.H{
			"id":          match.ID,
			"user1_id":    match.User1ID,
			"user2_id":    match.User2ID,
			"user1_name": user1.Username,
			"user2_name": user2.Username,
			"status":     match.Status,
			"matched_at": match.MatchedAt,
			"chat_id":    match.ChatID,
		},
		"chat": gin.H{
			"id":   dmChat.ID,
			"type": dmChat.Type,
		},
	})
}







