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

// UserDashboard returns user dashboard data
func UserDashboard(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userIDStr := userID.(string)

	var user models.User
	if err := database.DB.Where("id = ?", userIDStr).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Parse user ID to UUID for match queries
	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf("❌ Error parsing user ID to UUID: %v, userID: %s", err, userIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	log.Printf("🔵 Fetching dashboard for user: %s (UUID: %s)", userIDStr, userUUID.String())

	// Count ALL matches first (no status filter) to see what we have
	var allMatchesCount int64
	database.DB.Model(&models.Match{}).
		Where("user1_id = ? OR user2_id = ?", userUUID, userUUID).
		Count(&allMatchesCount)
	log.Printf("📊 Total matches found (no filter): %d", allMatchesCount)

	// Count active matches
	var matchesCount int64
	database.DB.Model(&models.Match{}).
		Where("(user1_id = ? OR user2_id = ?) AND (status = ? OR status = '' OR status IS NULL)", userUUID, userUUID, "active").
		Count(&matchesCount)
	log.Printf("📊 Active matches found: %d", matchesCount)

	// If no matches with status filter, use all matches count
	if matchesCount == 0 && allMatchesCount > 0 {
		matchesCount = allMatchesCount
		log.Printf("📊 Using all matches count: %d", matchesCount)
	}

	// Get recent matches (last 3) - fetch matches first, then load users separately
	var recentMatches []models.Match
	err = database.DB.
		Where("user1_id = ? OR user2_id = ?", userUUID, userUUID).
		Order("matched_at DESC").
		Limit(3).
		Find(&recentMatches).Error

	if err != nil {
		log.Printf("❌ Error fetching matches: %v", err)
		recentMatches = []models.Match{}
	} else {
		log.Printf("✅ Found %d recent matches", len(recentMatches))
		for i, m := range recentMatches {
			log.Printf("  Match %d: ID=%s, User1ID=%s, User2ID=%s, Status=%s", 
				i+1, m.ID, m.User1ID.String(), m.User2ID.String(), m.Status)
		}

		// Manually load users for each match (to handle type conversion)
		for i := range recentMatches {
			match := &recentMatches[i]
			
			// Load User1
			var user1 models.User
			if err := database.DB.Where("id = ?", match.User1ID.String()).First(&user1).Error; err == nil {
				match.User1 = user1
			} else {
				log.Printf("⚠️ Error loading User1 (%s) for match %s: %v", match.User1ID.String(), match.ID, err)
			}
			
			// Load User2
			var user2 models.User
			if err := database.DB.Where("id = ?", match.User2ID.String()).First(&user2).Error; err == nil {
				match.User2 = user2
			} else {
				log.Printf("⚠️ Error loading User2 (%s) for match %s: %v", match.User2ID.String(), match.ID, err)
			}
		}
	}

	matchList := make([]gin.H, 0, len(recentMatches))
	for _, match := range recentMatches {
		// Determine the other user
		var otherUser models.User
		if match.User1ID == userUUID {
			otherUser = match.User2
		} else {
			otherUser = match.User1
		}

		// Skip if user data is not loaded
		if otherUser.ID == "" {
			log.Printf("⚠️ Skipping match %s - user data not loaded", match.ID)
			continue
		}

		matchList = append(matchList, gin.H{
			"id": match.ID,
			"matched_user": gin.H{
				"id":         otherUser.ID,
				"username":   otherUser.Username,
				"email":      otherUser.Email,
				"first_name": otherUser.FirstName,
				"last_name":  otherUser.LastName,
				"avatar":     otherUser.Avatar,
			},
			"status":     match.Status,
			"matched_at": match.MatchedAt,
			"chat_id":    match.ChatID,
		})
	}

	log.Printf("✅ Returning %d matches in response (total count: %d)", len(matchList), matchesCount)

	// Count total unread messages
	var unreadCount int64
	database.DB.Model(&models.ChatParticipant{}).
		Where("user_id = ? AND (left_at IS NULL OR left_at = '0001-01-01 00:00:00+00')", userUUID).
		Select("COALESCE(SUM(unread_count), 0)").
		Scan(&unreadCount)

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"first_name":  user.FirstName,
			"last_name":   user.LastName,
			"avatar":      user.Avatar,
			"is_premium":  user.IsPremium,
			"is_verified": user.IsVerified,
		},
		"stats": gin.H{
			"total_matches": int(matchesCount),
			"unread_messages": int(unreadCount),
		},
		"recent_matches": matchList,
	})
}

// GetMatches returns user's matches
func GetMatches(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userIDStr := userID.(string)

	// Parse user ID to UUID
	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var matches []models.Match
	err = database.DB.
		Where("user1_id = ? OR user2_id = ?", userUUID, userUUID).
		Order("matched_at DESC").
		Find(&matches).Error

	if err != nil {
		log.Printf("❌ Error fetching matches: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch matches"})
		return
	}

	log.Printf("✅ Found %d matches for user %s", len(matches), userIDStr)

	// Manually load users for each match (to handle type conversion)
	for i := range matches {
		match := &matches[i]
		
		// Load User1
		var user1 models.User
		if err := database.DB.Where("id = ?", match.User1ID.String()).First(&user1).Error; err == nil {
			match.User1 = user1
		} else {
			log.Printf("⚠️ Error loading User1 (%s) for match %s: %v", match.User1ID.String(), match.ID, err)
		}
		
		// Load User2
		var user2 models.User
		if err := database.DB.Where("id = ?", match.User2ID.String()).First(&user2).Error; err == nil {
			match.User2 = user2
		} else {
			log.Printf("⚠️ Error loading User2 (%s) for match %s: %v", match.User2ID.String(), match.ID, err)
		}
	}

	matchList := make([]gin.H, 0, len(matches))
	for _, match := range matches {
		// Determine the other user
		var otherUser models.User
		if match.User1ID == userUUID {
			otherUser = match.User2
		} else {
			otherUser = match.User1
		}

		// Skip if user data is not loaded
		if otherUser.ID == "" {
			log.Printf("⚠️ Skipping match %s - user data not loaded", match.ID)
			continue
		}

		matchList = append(matchList, gin.H{
			"id":          match.ID,
			"matched_user": gin.H{
				"id":         otherUser.ID,
				"username":   otherUser.Username,
				"email":      otherUser.Email,
				"first_name": otherUser.FirstName,
				"last_name":  otherUser.LastName,
				"avatar":     otherUser.Avatar,
			},
			"status":     match.Status,
			"matched_at": match.MatchedAt,
			"chat_id":    match.ChatID,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"matches": matchList,
		"total":   len(matchList),
	})
}

// RequestVerification allows users to request profile verification
func RequestVerification(c *gin.Context) {
	log.Printf("🔵 RequestVerification handler called - Method: %s, Path: %s", c.Request.Method, c.Request.URL.Path)
	userID, _ := c.Get("user_id")
	userIDStr := userID.(string)
	log.Printf("🔵 User ID from context: %s", userIDStr)

	var req struct {
		DocumentURL string `json:"document_url"` // URL to verification document/photo
		Message     string `json:"message"`       // Optional message
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userIDStr).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// If already verified, return success
	if user.IsVerified {
		c.JSON(http.StatusOK, gin.H{
			"message": "Your profile is already verified",
			"is_verified": true,
		})
		return
	}

	// Check if there's already a pending request
	var existingRequest models.VerificationRequest
	if err := database.DB.Where("user_id = ? AND status = ?", userIDStr, "pending").First(&existingRequest).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "You already have a pending verification request. Please wait for it to be reviewed.",
		})
		return
	}

	// Create verification request
	verificationRequest := models.VerificationRequest{
		UserID:      userIDStr,
		DocumentURL: req.DocumentURL,
		Message:     req.Message,
		Status:      "pending",
	}

	if err := database.DB.Create(&verificationRequest).Error; err != nil {
		log.Printf("Error creating verification request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create verification request"})
		return
	}

	// Preload user data for response
	database.DB.Preload("User").First(&verificationRequest, verificationRequest.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Verification request submitted successfully. Our team will review your request.",
		"status": "pending",
		"request_id": verificationRequest.ID,
	})
}

// GetMessages returns user's chats (messages)
func GetMessages(c *gin.Context) {
	userID, _ := c.Get("user_id")

	// Get chat service
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://localhost:4222"
	}

	var nc *nats.Conn
	var js nats.JetStreamContext
	nc, js, _ = natsutil.ConnectNATS(natsutil.JetStreamConfig{
		URL:           natsURL,
		MaxReconnects: 10,
		ReconnectWait: 2 * time.Second,
	})

	chatService := chat.NewChatService(database.DB, nc, js)
	userIDStr := userID.(string)
	
	log.Printf("🔵 Fetching chats for user: %s", userIDStr)
	
	// First, let's check if user has any matches with chats
	var matchesWithChats []models.Match
	database.DB.Where("(user1_id = ? OR user2_id = ?) AND chat_id IS NOT NULL", userIDStr, userIDStr).Find(&matchesWithChats)
	log.Printf("📊 User has %d matches with chats", len(matchesWithChats))
	for _, m := range matchesWithChats {
		log.Printf("  - Match ID: %s, Chat ID: %v", m.ID, m.ChatID)
	}
	
	chats, err := chatService.GetUserChats(userIDStr, 50, 0)
	
	if err != nil {
		log.Printf("❌ Error fetching chats: %v", err)
		// Don't return error immediately - try fallback first
		chats = []*models.Chat{}
	}
	
	// If no chats found but matches exist, try to load chats from match chat_ids
	if len(chats) == 0 && len(matchesWithChats) > 0 {
		log.Printf("⚠️ No chats found via query, but matches exist. Attempting to load chats from match chat_ids...")
		var chatIDs []string
		for _, m := range matchesWithChats {
			if m.ChatID != nil {
				chatIDs = append(chatIDs, m.ChatID.String())
			}
		}
		if len(chatIDs) > 0 {
			log.Printf("📋 Found %d chat IDs from matches, loading chats...", len(chatIDs))
			for _, chatID := range chatIDs {
				chat, loadErr := chatService.GetChatByID(chatID)
				if loadErr == nil && chat != nil {
					// Verify user is actually a participant
					isParticipant := false
					for _, p := range chat.Participants {
						if p.UserID.String() == userIDStr {
							isParticipant = true
							break
						}
					}
					if isParticipant {
						chats = append(chats, chat)
						log.Printf("✅ Loaded chat: ID=%s, Participants=%d", chat.ID, len(chat.Participants))
					} else {
						log.Printf("⚠️ Chat %s exists but user %s is not a participant", chatID, userIDStr)
					}
				} else {
					log.Printf("❌ Failed to load chat %s: %v", chatID, loadErr)
				}
			}
		}
	}
	
	log.Printf("✅ Found %d chats for user %s", len(chats), userIDStr)
	for i, ch := range chats {
		log.Printf("  Chat %d: ID=%s, Type=%s, Participants=%d", i+1, ch.ID, ch.Type, len(ch.Participants))
		for j, p := range ch.Participants {
			log.Printf("    Participant %d: UserID=%s, Username=%s", j+1, p.UserID, p.User.Username)
		}
	}

	chatList := make([]gin.H, len(chats))
	for i, chatItem := range chats {
		chatList[i] = gin.H{
			"id":   chatItem.ID,
			"type": chatItem.Type,
			"participants": func() []gin.H {
				participants := make([]gin.H, len(chatItem.Participants))
				for j, p := range chatItem.Participants {
					participants[j] = gin.H{
						"id":    p.ID,
						"user": gin.H{
							"id":         p.User.ID,
							"username":   p.User.Username,
							"first_name": p.User.FirstName,
							"last_name":  p.User.LastName,
							"avatar":     p.User.Avatar,
							"email":      p.User.Email,
						},
						"unreadCount": p.UnreadCount,
						"lastReadAt":  p.LastReadAt,
					}
				}
				return participants
			}(),
			"lastMessage": func() gin.H {
				if chatItem.LastMessage != nil {
					return gin.H{
						"id":        chatItem.LastMessage.ID,
						"content":   chatItem.LastMessage.Content,
						"createdAt": chatItem.LastMessage.CreatedAt,
						"sender": gin.H{
							"id":       chatItem.LastMessage.Sender.ID,
							"username": chatItem.LastMessage.Sender.Username,
							"avatar":   chatItem.LastMessage.Sender.Avatar,
						},
					}
				}
				return nil
			}(),
			"lastMessageAt": chatItem.LastMessageAt,
			"createdAt":     chatItem.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"chats": chatList,
		"total": len(chatList),
	})
}

// GetChatMessages returns messages for a specific chat
func GetChatMessages(c *gin.Context) {
	chatID := c.Param("id")
	userID, _ := c.Get("user_id")
	userIDStr := userID.(string)

	// Get limit from query params
	limitStr := c.DefaultQuery("limit", "50")
	limit := 50
	if l, err := strconv.Atoi(limitStr); err == nil {
		limit = l
	}

	// Get chat service
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://localhost:4222"
	}

	var nc *nats.Conn
	var js nats.JetStreamContext
	nc, js, _ = natsutil.ConnectNATS(natsutil.JetStreamConfig{
		URL:           natsURL,
		MaxReconnects: 10,
		ReconnectWait: 2 * time.Second,
	})

	chatService := chat.NewChatService(database.DB, nc, js)
	
	// Verify user is participant
	if !chatService.IsParticipant(chatID, userIDStr) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to access this chat"})
		return
	}

	// Get messages
	messages, err := chatService.GetMessages(chatID, limit, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages: " + err.Error()})
		return
	}

	messageList := make([]gin.H, len(messages))
	for i, msg := range messages {
		messageList[i] = gin.H{
			"id":        msg.ID,
			"chatID":    msg.ChatID,
			"senderID":  msg.SenderID,
			"sender": gin.H{
				"id":         msg.Sender.ID,
				"username":   msg.Sender.Username,
				"first_name": msg.Sender.FirstName,
				"last_name":  msg.Sender.LastName,
				"avatar":     msg.Sender.Avatar,
			},
			"content":      msg.Content,
			"mediaType":    msg.MediaType,
			"mediaURL":     msg.MediaURL,
			"mediaMetadata": msg.MediaMetadata,
			"messageType":  msg.MessageType,
			"status":       msg.Status,
			"createdAt":    msg.CreatedAt,
			"updatedAt":    msg.UpdatedAt,
			"sequenceNumber": msg.SequenceNumber,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": messageList,
		"total":    len(messageList),
	})
}

// GetUserProfile returns user's profile
func GetUserProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

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

// GetUserSettings returns user's settings
func GetUserSettings(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var settings models.UserSettings
	err := database.DB.Where("user_id = ?", userID).First(&settings).Error
	
	// If settings don't exist, create default settings
	if err != nil {
		settings = models.UserSettings{
			UserID:                userID.(string),
			ShowAge:               true,
			ShowLocation:           true,
			ShowDistance:           true,
			ShowOnlineStatus:       true,
			MinAge:                 18,
			MaxAge:                 99,
			MaxDistance:            50,
			ShowMeTo:               "everyone",
			Discoverable:           true,
			EmailNotifications:     true,
			PushNotifications:      true,
			NewMatchNotifications:  true,
			MessageNotifications:   true,
			LikeNotifications:      true,
			ReadReceipts:           true,
			ShowLastSeen:           true,
			Language:               "en",
			Timezone:               "UTC",
		}
		
		if err := database.DB.Create(&settings).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create settings"})
			return
		}
	}

	c.JSON(http.StatusOK, settings)
}

// UpdateUserSettings updates user's settings
func UpdateUserSettings(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userIDStr := userID.(string)

	// Use FirstOrCreate to get or create settings
	var settings models.UserSettings
	result := database.DB.Where("user_id = ?", userIDStr).FirstOrCreate(&settings, models.UserSettings{
		UserID:                userIDStr,
		ShowAge:               true,
		ShowLocation:           true,
		ShowDistance:           true,
		ShowOnlineStatus:       true,
		MinAge:                 18,
		MaxAge:                 99,
		MaxDistance:            50,
		ShowMeTo:               "everyone",
		Discoverable:           true,
		EmailNotifications:     true,
		PushNotifications:      true,
		NewMatchNotifications:  true,
		MessageNotifications:   true,
		LikeNotifications:      true,
		ReadReceipts:           true,
		ShowLastSeen:           true,
		Language:               "en",
		Timezone:               "UTC",
	})
	
	if result.Error != nil {
		log.Printf("Error getting/creating settings: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get settings: " + result.Error.Error()})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data: " + err.Error()})
		return
	}

	// Update fields from JSON
	if val, ok := updateData["show_age"].(bool); ok {
		settings.ShowAge = val
	}
	if val, ok := updateData["show_location"].(bool); ok {
		settings.ShowLocation = val
	}
	if val, ok := updateData["show_distance"].(bool); ok {
		settings.ShowDistance = val
	}
	if val, ok := updateData["show_online_status"].(bool); ok {
		settings.ShowOnlineStatus = val
	}
	if val, ok := updateData["min_age"].(float64); ok && val > 0 {
		settings.MinAge = int(val)
	}
	if val, ok := updateData["min_age"].(int); ok && val > 0 {
		settings.MinAge = val
	}
	if val, ok := updateData["max_age"].(float64); ok && val > 0 {
		settings.MaxAge = int(val)
	}
	if val, ok := updateData["max_age"].(int); ok && val > 0 {
		settings.MaxAge = val
	}
	if val, ok := updateData["max_distance"].(float64); ok && val > 0 {
		settings.MaxDistance = int(val)
	}
	if val, ok := updateData["max_distance"].(int); ok && val > 0 {
		settings.MaxDistance = val
	}
	if val, ok := updateData["show_me_to"].(string); ok && val != "" {
		settings.ShowMeTo = val
	}
	if val, ok := updateData["discoverable"].(bool); ok {
		settings.Discoverable = val
	}
	if val, ok := updateData["email_notifications"].(bool); ok {
		settings.EmailNotifications = val
	}
	if val, ok := updateData["push_notifications"].(bool); ok {
		settings.PushNotifications = val
	}
	if val, ok := updateData["new_match_notifications"].(bool); ok {
		settings.NewMatchNotifications = val
	}
	if val, ok := updateData["message_notifications"].(bool); ok {
		settings.MessageNotifications = val
	}
	if val, ok := updateData["like_notifications"].(bool); ok {
		settings.LikeNotifications = val
	}
	if val, ok := updateData["read_receipts"].(bool); ok {
		settings.ReadReceipts = val
	}
	if val, ok := updateData["show_last_seen"].(bool); ok {
		settings.ShowLastSeen = val
	}
	if val, ok := updateData["blocked_users"].(string); ok {
		settings.BlockedUsers = val
	}
	if val, ok := updateData["language"].(string); ok && val != "" {
		settings.Language = val
	}
	if val, ok := updateData["timezone"].(string); ok && val != "" {
		settings.Timezone = val
	}

	// Save the updated settings
	if err := database.DB.Save(&settings).Error; err != nil {
		log.Printf("Error saving settings for user %s: %v", userIDStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}







