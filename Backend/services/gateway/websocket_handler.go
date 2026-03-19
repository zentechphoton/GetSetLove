package gateway

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	gorillaWS "github.com/gorilla/websocket"
	"github.com/nats-io/nats.go"
	ws "gsl-backend/pkg/websocket"
	"gsl-backend/services/chat"
	"gsl-backend/utils"
)

var upgrader = gorillaWS.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// TODO: Implement proper origin checking in production
		return true
	},
}

// ChatWebSocketHandler handles WebSocket connections for chat
func ChatWebSocketHandler(
	nc *nats.Conn,
	js nats.JetStreamContext,
	chatService *chat.ChatService,
	connManager *ws.ConnectionManager,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Extract JWT token from query param or header
		token := c.Query("token")
		if token == "" {
			authHeader := c.GetHeader("Authorization")
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				token = authHeader[7:]
			}
		}

		if token == "" {
			c.JSON(401, gin.H{"error": "Missing authentication token"})
			return
		}

		// 2. Validate token and extract user
		claims, err := utils.ValidateToken(token)
		if err != nil {
			c.JSON(401, gin.H{"error": "Invalid token"})
			return
		}

		userID := claims.UserID
		if userID == "" {
			c.JSON(401, gin.H{"error": "Invalid token claims"})
			return
		}

		// 3. Upgrade HTTP connection to WebSocket
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("⚠️  Failed to upgrade connection: %v", err)
			return
		}

		// 4. Create Connection object
		wsConn := &ws.Connection{
			ID:        uuid.New().String(),
			UserID:    userID,
			Conn:      conn,
			Send:      make(chan []byte, 256),
			ChatRooms: make(map[string]bool),
			LastPing:  time.Now(),
		}

		// 5. Register with Connection Manager
		connManager.Register <- wsConn

		// 6. Send auth success message
		wsConn.Send <- ws.CreateAuthSuccessMessage(userID)

		// 7. Publish online presence
		if chatService != nil {
			go chatService.HandlePresenceUpdate(userID, true)
		}

		log.Printf("🔌 WebSocket connected: user=%s, conn=%s", userID, wsConn.ID)

		// 8. Start read/write pumps
		go wsConn.WritePump()
		wsConn.ReadPump(connManager, chatService, js)
	}
}
