# Product Requirements Document (PRD)
## GSL NextGo - Chat & Matching Microservices Implementation

**Version:** 1.0
**Date:** 2025-11-21
**Project:** GSL (Get Set Love) - Dating Platform
**Document Owner:** Engineering Team

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Overview
Implement a scalable, real-time chat and matching system for GSL dating platform using microservices architecture with NATS messaging, WebSocket for real-time communication, GraphQL subscriptions for structured events, and PostgreSQL for persistent storage.

### 1.2 Goals
- Enable real-time 1-on-1 messaging between matched users
- Implement intelligent matching algorithm with scoring
- Support 10,000+ concurrent WebSocket connections
- Ensure message persistence and delivery guarantees
- Provide low-latency (<100ms) message delivery
- Scale horizontally across multiple service instances

### 1.3 Success Metrics
- Message delivery latency < 100ms (p95)
- 99.9% message delivery rate
- WebSocket connection uptime > 99.5%
- Support 10,000 concurrent connections per instance
- Match quality score > 70% user satisfaction
- API response time < 200ms (p95)

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Backend Language | Go | 1.24+ | High-performance microservices |
| API Framework | Gin | 1.9+ | HTTP routing & middleware |
| GraphQL Server | gqlgen | 0.17+ | Schema-first GraphQL API |
| Message Broker | NATS JetStream | Latest | Event streaming & pub/sub |
| Database | PostgreSQL | 15+ | Persistent data storage |
| WebSocket | gorilla/websocket | 1.5+ | Real-time bidirectional communication |
| ORM | GORM | 1.25+ | Database operations |
| Frontend | Next.js | 14+ | React framework (already exists) |
| State Management | Zustand | 4.4+ | Client state (already exists) |

### 2.2 Microservices Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Next.js Frontend                        │
│           (Chat UI Components - Already Exists)           │
└────────────────┬─────────────────┬──────────────────────┘
                 │                 │
         GraphQL/HTTP          WebSocket (wss://)
                 │                 │
                 ↓                 ↓
┌────────────────────────────────────────────────────────────┐
│              API Gateway Service (Go + Gin)                │
│  - Authentication & Authorization                          │
│  - Rate Limiting                                           │
│  - WebSocket Upgrade Handler                               │
│  - GraphQL Endpoint                                        │
└──┬─────────────┬───────────────┬──────────────┬───────────┘
   │             │               │              │
   │ NATS        │ NATS          │ NATS         │ NATS
   ↓             ↓               ↓              ↓
┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│  Chat   │  │Matching │  │  User    │  │  Push    │
│ Service │  │Service  │  │ Service  │  │Notification│
│  (Go)   │  │  (Go)   │  │  (Go)    │  │  Service │
└────┬────┘  └────┬────┘  └────┬─────┘  └────┬─────┘
     │            │            │             │
     └────────────┴────────────┴─────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
     ↓                         ↓
┌──────────────┐        ┌─────────────────┐
│ NATS         │        │  PostgreSQL     │
│ JetStream    │        │  - users        │
│ - Streams    │        │  - chats        │
│ - Pub/Sub    │        │  - messages     │
│ - Events     │        │  - matches      │
└──────────────┘        │  - preferences  │
                        └─────────────────┘
```

### 2.3 NATS Subject Hierarchy

```
chat.message.{chatID}.sent          # New message published
chat.message.{chatID}.delivered     # Message delivered to recipient
chat.message.{chatID}.read          # Message read by recipient
chat.typing.{chatID}.{userID}       # Typing indicator
chat.presence.{userID}              # User online/offline status

match.new.{userID}                  # New mutual match created
match.like.{userID}                 # User received a like
match.suggestion.{userID}           # New match suggestions available

notification.push.{userID}          # Trigger push notification
user.updated.{userID}               # Profile updated
```

### 2.4 Database Schema

See Section 5 for complete schema definitions.

---

## 3. SEQUENTIAL IMPLEMENTATION PLAN

### Overview
Implementation is divided into 5 sequential parts, each building on the previous:

```
Part 1: NATS Infrastructure & Chat Backend
   ↓
Part 2: Matching Algorithm Service
   ↓
Part 3: WebSocket Gateway & Connection Manager
   ↓
Part 4: GraphQL Resolvers for Chat & Matching
   ↓
Part 5: Database Migrations & Integration
```

---

## PART 1: NATS INFRASTRUCTURE & CHAT BACKEND

### 1.1 Objectives
- Set up NATS JetStream with proper streams
- Create chat service with message persistence
- Implement NATS pub/sub for message distribution
- Build chat repository for PostgreSQL operations

### 1.2 Deliverables

#### 1.2.1 NATS JetStream Setup
**File:** `Backend/pkg/natsutil/jetstream.go`

**Features:**
- NATS connection manager with auto-reconnect
- JetStream stream creation (CHAT_MESSAGES, PRESENCE, MATCHES, NOTIFICATIONS)
- Stream configurator with production-ready settings
- Publisher and subscriber utilities

**Stream Configurations:**
```yaml
CHAT_MESSAGES:
  Storage: File (durable)
  Retention: 30 days
  Replicas: 3 (production)
  Deduplication: 2 minutes

PRESENCE:
  Storage: Memory (ephemeral)
  Retention: 5 minutes
  Replicas: 1

MATCHES:
  Storage: File (durable)
  Retention: 7 days
  Replicas: 3

NOTIFICATIONS:
  Storage: File (durable)
  Retention: 24 hours
  Replicas: 1
```

#### 1.2.2 Chat Models
**File:** `Backend/models/chat.go`

**Models:**
- `Chat` - Represents conversation (DM or group)
- `ChatParticipant` - User participation in chat
- `Message` - Individual message with content/media
- `MessageReceipt` - Delivery and read receipts

**Key Features:**
- UUID primary keys
- GORM hooks for auto-generation
- Soft delete support
- JSONB metadata fields
- Proper indexing for performance

#### 1.2.3 Chat Repository
**File:** `Backend/services/chat/repository/chat_repository.go`

**Methods:**
- `CreateChat(chat *models.Chat) error`
- `GetChatByID(chatID string) (*models.Chat, error)`
- `GetUserChats(userID string, limit, offset int) ([]*models.Chat, error)`
- `CreateMessage(message *models.Message) error`
- `GetChatMessages(chatID string, limit int, beforeID *string) ([]*models.Message, error)`
- `UpdateChatLastMessage(chatID string, messageID string) error`
- `GetChatParticipant(chatID, userID string) (*models.ChatParticipant, error)`
- `UpdateUnreadCount(chatID, userID string, increment bool) error`
- `MarkMessagesAsRead(chatID, userID string, messageIDs []string) error`

#### 1.2.4 Chat Service Core
**File:** `Backend/services/chat/service.go`

**Core Methods:**
- `SendMessage(ctx, msg)` - Validate, persist, publish to NATS, trigger push
- `GetMessages(chatID, limit, beforeID)` - Retrieve message history
- `CreateDMChat(user1ID, user2ID)` - Create 1-on-1 chat
- `SubscribeToChatEvents(chatID)` - Subscribe to NATS for chat events
- `BroadcastToWebSockets(chatID, message)` - Send to connected WS clients
- `HandleTypingIndicator(chatID, userID, typing)` - Publish typing events
- `HandlePresenceUpdate(userID, online)` - Publish presence events

**Message Flow:**
```
1. Client sends message via WebSocket
2. API Gateway validates JWT and extracts user
3. Chat Service receives message
4. Validate user is chat participant
5. [Optional] Content moderation check
6. Persist message to PostgreSQL
7. Publish to NATS: chat.message.{chatID}.sent
8. Update chat.last_message_id and last_message_at
9. Trigger push notification for offline users (async)
10. Update unread counts for other participants
11. Return ACK to sender via WebSocket
12. NATS subscribers receive event and broadcast to other participants' WebSockets
```

#### 1.2.5 NATS Event Handlers
**File:** `Backend/services/chat/nats/handlers.go`

**Handlers:**
- `HandleMessageSent` - Broadcast to WebSocket connections
- `HandleMessageDelivered` - Update receipt status
- `HandleMessageRead` - Update receipt status
- `HandleTyping` - Broadcast typing indicator
- `HandlePresence` - Broadcast presence update

### 1.3 Testing Requirements
- Unit tests for repository methods
- Integration tests with test database
- NATS pub/sub test with test stream
- Message persistence verification
- Concurrency tests for message ordering

### 1.4 Configuration
**Environment Variables:**
```env
NATS_URL=nats://localhost:4222
NATS_CLUSTER_URL=nats://nats1:4222,nats://nats2:4222,nats://nats3:4222
DATABASE_URL=postgres://user:pass@localhost:5432/gsl_db
CHAT_MESSAGE_RETENTION_DAYS=30
```

---

## PART 2: MATCHING ALGORITHM SERVICE

### 2.1 Objectives
- Implement intelligent matching algorithm with weighted scoring
- Create candidate filtering based on user preferences
- Build match suggestion generator
- Handle like/match processing with NATS events

### 2.2 Deliverables

#### 2.2.1 Matching Models
**File:** `Backend/models/matching.go`

**Models:**
- `UserPreferences` - User's matching preferences (age, distance, gender, etc.)
- `UserProfileExtended` - Extended profile data for matching (bio, location, interests, engagement metrics)
- `Match` - Represents mutual match between two users
- `Like` - Represents like/pass/superlike action
- `MatchSuggestion` - Generated match suggestions with scores

#### 2.2.2 Matching Score Calculator
**File:** `Backend/services/matching/scorer/match_scorer.go`

**Scoring Algorithm:**
```
Total Match Score = Σ (Component Score × Weight)

Components:
1. Age Compatibility (Weight: 20%)
   - Within preferred age range
   - Mutual age preference satisfaction
   - Score: 0-100 based on range overlap

2. Distance (Weight: 15%)
   - Haversine formula for geo-distance
   - Score: 100 at 0km, linear decay to 0 at max_distance

3. Interests Overlap (Weight: 25%)
   - Jaccard similarity of interest tags
   - Score: (Common Interests / Total Unique Interests) × 100

4. Profile Quality (Weight: 10%)
   - Photo count (max 6)
   - Bio completeness (length 50-500 chars optimal)
   - Verification badge (+20 points)
   - Score: Average of sub-scores

5. Activity/Engagement (Weight: 15%)
   - Last active (fresher = higher score)
   - Response rate (historical conversation data)
   - Score: Composite of activity metrics

6. Mutual Preferences (Weight: 15%)
   - Gender/orientation compatibility
   - Relationship goals alignment
   - Deal-breakers check (binary pass/fail)
   - Score: Percentage of compatible preferences
```

**Methods:**
- `CalculateMatchScore(user1, user2, prefs) float64`
- `ScoreAge(user1Age, user2Age, prefs) float64`
- `ScoreDistance(lat1, lon1, lat2, lon2, maxKm) float64`
- `ScoreInterests(interests1, interests2) float64`
- `ScoreProfileQuality(profile) float64`
- `ScoreActivity(profile) float64`
- `ScoreMutualPreferences(user1, user2, prefs) float64`
- `GetScoreBreakdown(user1, user2, prefs) map[string]float64`

**Example Score Calculation:**
```go
User A matches User B:
- Age Score: 95 (both in preferred range) × 0.20 = 19.0
- Distance: 80 (5km apart, max 50km) × 0.15 = 12.0
- Interests: 60 (3 common out of 8 total) × 0.25 = 15.0
- Profile Quality: 85 (4 photos, good bio) × 0.10 = 8.5
- Activity: 90 (active today, 80% response) × 0.15 = 13.5
- Mutual Prefs: 100 (all compatible) × 0.15 = 15.0
----------------------------------------
Total Score: 83.0 / 100
```

#### 2.2.3 Candidate Filtering
**File:** `Backend/services/matching/repository/matching_repository.go`

**SQL Query for Candidates:**
```sql
SELECT u.*, up.*
FROM users u
JOIN user_profiles_extended up ON u.id = up.user_id
JOIN user_preferences pref ON u.id = :user_id
WHERE u.id != :user_id
  AND u.id NOT IN (
    SELECT to_user_id FROM likes WHERE from_user_id = :user_id
  )
  AND u.id NOT IN (
    SELECT user2_id FROM matches
    WHERE user1_id = :user_id OR user2_id = :user_id
  )
  AND u.id NOT IN (
    SELECT blocked_user_id FROM user_blocks WHERE user_id = :user_id
  )
  AND u.age BETWEEN pref.min_age AND pref.max_age
  AND :user_age BETWEEN up.min_age_preference AND up.max_age_preference
  AND u.gender = ANY(pref.gender_preference)
  AND earth_distance(
    ll_to_earth(up.latitude, up.longitude),
    ll_to_earth(:lat, :lon)
  ) <= pref.max_distance_km * 1000
  AND u.is_verified = CASE WHEN pref.verified_only THEN true ELSE u.is_verified END
  AND up.last_active_at > NOW() - INTERVAL '30 days'
LIMIT 100;
```

**Methods:**
- `GetMatchCandidates(userID string, prefs *UserPreferences) ([]*UserProfile, error)`
- `GetUserPreferences(userID string) (*UserPreferences, error)`
- `CreateLike(like *Like) error`
- `GetLike(fromUserID, toUserID string) (*Like, error)`
- `CreateMatch(match *Match) error`
- `GetUserMatches(userID string, limit int) ([]*Match, error)`
- `SaveMatchSuggestions(suggestions []*MatchSuggestion) error`

#### 2.2.4 Matching Service Core
**File:** `Backend/services/matching/service.go`

**Methods:**
- `GenerateSuggestions(userID)` - Generate match suggestions
  ```
  1. Load user profile & preferences
  2. Query database for candidates (filters)
  3. Score each candidate
  4. Sort by score (descending)
  5. Apply diversity filters (avoid showing same users repeatedly)
  6. Take top 10-20 suggestions
  7. Save to match_suggestions table
  8. Publish event: match.suggestion.{userID}
  9. Return suggestions
  ```

- `ProcessLike(fromUserID, toUserID, likeType)` - Handle like action
  ```
  1. Validate users exist and are eligible
  2. Create Like record
  3. Check for mutual like
  4. If mutual:
     a. Create Match record
     b. Create DM Chat via Chat Service
     c. Link chat_id to match
     d. Publish: match.new.{user1ID} and match.new.{user2ID}
  5. Else:
     a. Publish: match.like.{toUserID} (notification)
  6. Return result (matched: true/false, match object if matched)
  ```

- `RefreshSuggestions(userID)` - Regenerate suggestions (daily cron)
- `GetMatchStatistics(userID)` - Get match metrics
- `Unmatch(matchID)` - Remove mutual match

#### 2.2.5 Diversity & Exploration Filters
**File:** `Backend/services/matching/scorer/diversity.go`

**Techniques:**
- **Epsilon-Greedy**: 10% of suggestions are random (exploration)
- **Score Buckets**: Group candidates into buckets (90-100, 80-89, 70-79), pick from each
- **Freshness Boost**: +5 points for users never shown before
- **Penalize Repeated**: -10 points for users shown 3+ times in last 7 days
- **Time-based Rotation**: Rotate featured profiles every 6 hours

### 2.3 Testing Requirements
- Unit tests for scoring functions with known inputs/outputs
- Integration tests with test user profiles
- Performance tests (generate 1000 suggestions in <5s)
- Validate mutual match creation
- Test edge cases (no candidates, all filtered out)

### 2.4 Configuration
```env
MATCHING_SCORE_THRESHOLD=50.0
MATCHING_SUGGESTION_LIMIT=20
MATCHING_CANDIDATE_POOL_SIZE=100
MATCHING_REFRESH_INTERVAL_HOURS=24
MATCHING_EXPLORATION_RATE=0.10
```

---

## PART 3: WEBSOCKET GATEWAY & CONNECTION MANAGER

### 3.1 Objectives
- Build WebSocket connection manager with authentication
- Handle WebSocket upgrade from HTTP
- Implement message routing to correct connections
- Manage connection lifecycle (connect, heartbeat, disconnect)
- Integrate with NATS for message broadcasting

### 3.2 Deliverables

#### 3.2.1 WebSocket Connection Manager
**File:** `Backend/pkg/websocket/connection_manager.go`

**Features:**
- Thread-safe connection registry
- User ID to connection mapping
- Connection health monitoring
- Automatic cleanup of dead connections
- Broadcast to specific user/chat

**Data Structures:**
```go
type Connection struct {
    ID          string
    UserID      string
    Conn        *websocket.Conn
    Send        chan []byte
    ChatRooms   map[string]bool // chatID -> subscribed
    LastPing    time.Time
    Mutex       sync.RWMutex
}

type ConnectionManager struct {
    Connections map[string]*Connection  // connID -> Connection
    UserConns   map[string][]*Connection // userID -> []*Connection (multi-device)
    ChatConns   map[string][]*Connection // chatID -> []*Connection
    Register    chan *Connection
    Unregister  chan *Connection
    Broadcast   chan *BroadcastMessage
    Mutex       sync.RWMutex
}
```

**Methods:**
- `NewConnectionManager() *ConnectionManager`
- `Run()` - Main event loop (goroutine)
- `RegisterConnection(conn *Connection)`
- `UnregisterConnection(conn *Connection)`
- `GetUserConnections(userID string) []*Connection`
- `BroadcastToChat(chatID string, message []byte)`
- `BroadcastToUser(userID string, message []byte)`
- `SubscribeToChatRoom(connID, chatID string)`
- `UnsubscribeFromChatRoom(connID, chatID string)`

#### 3.2.2 WebSocket Protocol Handler
**File:** `Backend/pkg/websocket/protocol.go`

**Message Types:**
```go
const (
    WSMsgTypeAuth            = "auth"
    WSMsgTypeSendMessage     = "message.send"
    WSMsgTypeTypingStart     = "typing.start"
    WSMsgTypeTypingStop      = "typing.stop"
    WSMsgTypeMarkDelivered   = "message.delivered"
    WSMsgTypeMarkRead        = "message.read"
    WSMsgTypeSubscribe       = "subscribe"
    WSMsgTypeUnsubscribe     = "unsubscribe"
    WSMsgTypePing            = "ping"

    WSMsgTypeAuthSuccess     = "auth.success"
    WSMsgTypeAuthError       = "auth.error"
    WSMsgTypeMessageReceived = "message.received"
    WSMsgTypeMessageAck      = "message.ack"
    WSMsgTypeMessageError    = "message.error"
    WSMsgTypeTypingEvent     = "typing.event"
    WSMsgTypePresenceEvent   = "presence.event"
    WSMsgTypePong            = "pong"
    WSMsgTypeError           = "error"
)

type WSMessage struct {
    Type      string      `json:"type"`
    RequestID string      `json:"request_id,omitempty"`
    Payload   interface{} `json:"payload"`
}
```

**Methods:**
- `ParseMessage(data []byte) (*WSMessage, error)`
- `CreateMessage(msgType string, payload interface{}, requestID string) []byte`
- `HandleIncomingMessage(conn *Connection, msg *WSMessage)`

#### 3.2.3 WebSocket HTTP Handler
**File:** `Backend/services/gateway/websocket_handler.go`

**HTTP Handler:**
```go
func ChatWebSocketHandler(nc *nats.Conn, js nats.JetStreamContext, chatService *chat.ChatService) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 1. Extract JWT token from query param or header
        token := c.Query("token")
        if token == "" {
            token = c.GetHeader("Authorization")
        }

        // 2. Validate token and extract user
        user, err := auth.ValidateToken(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "Invalid token"})
            return
        }

        // 3. Upgrade HTTP connection to WebSocket
        conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
        if err != nil {
            return
        }

        // 4. Create Connection object
        wsConn := &websocket.Connection{
            ID:        uuid.New().String(),
            UserID:    user.ID,
            Conn:      conn,
            Send:      make(chan []byte, 256),
            ChatRooms: make(map[string]bool),
        }

        // 5. Register with Connection Manager
        connManager.Register <- wsConn

        // 6. Start read/write pumps
        go wsConn.WritePump()
        go wsConn.ReadPump(chatService, js)

        // 7. Publish presence event
        publishPresence(js, user.ID, true)
    }
}
```

#### 3.2.4 Connection Read/Write Pumps
**File:** `Backend/pkg/websocket/connection.go`

**Write Pump:**
```go
func (c *Connection) WritePump() {
    ticker := time.NewTicker(pingPeriod)
    defer func() {
        ticker.Stop()
        c.Conn.Close()
    }()

    for {
        select {
        case message, ok := <-c.Send:
            if !ok {
                c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }
            c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
            c.Conn.WriteMessage(websocket.TextMessage, message)

        case <-ticker.C:
            c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
            if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
                return
            }
        }
    }
}
```

**Read Pump:**
```go
func (c *Connection) ReadPump(chatService *chat.ChatService, js nats.JetStreamContext) {
    defer func() {
        connManager.Unregister <- c
        c.Conn.Close()
        publishPresence(js, c.UserID, false)
    }()

    c.Conn.SetReadDeadline(time.Now().Add(pongWait))
    c.Conn.SetPongHandler(func(string) error {
        c.Conn.SetReadDeadline(time.Now().Add(pongWait))
        c.LastPing = time.Now()
        return nil
    })

    for {
        _, message, err := c.Conn.ReadMessage()
        if err != nil {
            break
        }

        // Parse and handle message
        wsMsg, err := ParseMessage(message)
        if err != nil {
            continue
        }

        HandleIncomingMessage(c, wsMsg, chatService, js)
    }
}
```

#### 3.2.5 Message Handler
**File:** `Backend/pkg/websocket/message_handler.go`

**Handler Logic:**
```go
func HandleIncomingMessage(conn *Connection, msg *WSMessage, chatService *chat.ChatService, js nats.JetStreamContext) {
    switch msg.Type {
    case WSMsgTypeSendMessage:
        handleSendMessage(conn, msg, chatService)

    case WSMsgTypeTypingStart:
        handleTyping(conn, msg, js, true)

    case WSMsgTypeTypingStop:
        handleTyping(conn, msg, js, false)

    case WSMsgTypeMarkRead:
        handleMarkRead(conn, msg, chatService, js)

    case WSMsgTypeSubscribe:
        handleSubscribe(conn, msg)

    case WSMsgTypePing:
        sendPong(conn, msg.RequestID)
    }
}
```

#### 3.2.6 NATS to WebSocket Bridge
**File:** `Backend/services/gateway/nats_bridge.go`

**NATS Subscribers:**
```go
func SubscribeToNATSEvents(js nats.JetStreamContext, connManager *websocket.ConnectionManager) {
    // Subscribe to all chat message events
    js.Subscribe("chat.message.>", func(msg *nats.Msg) {
        var message models.Message
        json.Unmarshal(msg.Data, &message)

        // Broadcast to all connections in this chat
        connManager.BroadcastToChat(message.ChatID, CreateWSMessage("message.received", message))
        msg.Ack()
    })

    // Subscribe to typing events
    js.Subscribe("chat.typing.>", func(msg *nats.Msg) {
        // Extract chatID from subject
        parts := strings.Split(msg.Subject, ".")
        chatID := parts[2]

        connManager.BroadcastToChat(chatID, msg.Data)
        msg.Ack()
    })

    // Subscribe to presence events
    js.Subscribe("chat.presence.>", func(msg *nats.Msg) {
        var presence PresenceEvent
        json.Unmarshal(msg.Data, &presence)

        // Broadcast to all user's connections
        connManager.BroadcastToUser(presence.UserID, msg.Data)
        msg.Ack()
    })

    // Subscribe to match events
    js.Subscribe("match.new.>", func(msg *nats.Msg) {
        parts := strings.Split(msg.Subject, ".")
        userID := parts[2]

        connManager.BroadcastToUser(userID, msg.Data)
        msg.Ack()
    })
}
```

### 3.3 Testing Requirements
- Load test with 10,000 concurrent connections
- Stress test message throughput
- Test reconnection handling
- Verify message delivery to correct recipients
- Test connection cleanup on disconnect

### 3.4 Configuration
```env
WS_READ_BUFFER_SIZE=1024
WS_WRITE_BUFFER_SIZE=1024
WS_PING_PERIOD=30s
WS_PONG_WAIT=60s
WS_WRITE_WAIT=10s
WS_MAX_MESSAGE_SIZE=512000
```

---

## PART 4: GRAPHQL RESOLVERS FOR CHAT & MATCHING

### 4.1 Objectives
- Create GraphQL schema for chat and matching
- Implement query/mutation resolvers
- Add GraphQL subscriptions for real-time events
- Integrate with NATS for subscription events
- Connect to Chat and Matching services

### 4.2 Deliverables

#### 4.2.1 GraphQL Schema
**File:** `Backend/graph/schema/chat.graphqls`

```graphql
scalar Time
scalar JSON

# ========== CHAT TYPES ==========

type Chat {
  id: ID!
  type: String!
  participants: [ChatParticipant!]!
  lastMessage: Message
  lastMessageAt: Time
  createdAt: Time!
  metadata: JSON
}

type ChatParticipant {
  id: ID!
  user: User!
  role: String!
  joinedAt: Time!
  leftAt: Time
  muted: Boolean!
  archived: Boolean!
  lastReadMessageID: ID
  lastReadAt: Time
  unreadCount: Int!
}

type Message {
  id: ID!
  chatID: ID!
  senderID: ID!
  sender: User!
  content: String
  mediaType: String
  mediaURL: String
  mediaMetadata: JSON
  replyTo: Message
  messageType: String!
  status: String!
  createdAt: Time!
  updatedAt: Time
  sequenceNumber: Int!
  isFlagged: Boolean!
  metadata: JSON
}

type TypingEvent {
  chatID: ID!
  userID: ID!
  typing: Boolean!
  timestamp: Time!
}

type PresenceEvent {
  userID: ID!
  online: Boolean!
  lastSeen: Time
}

# ========== MATCHING TYPES ==========

type Match {
  id: ID!
  matchedUser: User!
  matchScore: Float
  matchReason: String
  matchedAt: Time!
  status: String!
  chatID: ID
  chat: Chat
  firstMessageAt: Time
}

type MatchSuggestion {
  user: User!
  score: Float!
  scoreBreakdown: JSON
  reason: String
  rank: Int
}

type LikeResult {
  success: Boolean!
  matched: Boolean!
  match: Match
}

type UserPreferences {
  userID: ID!
  minAge: Int!
  maxAge: Int!
  maxDistanceKm: Int!
  genderPreference: [String!]!
  relationshipGoals: [String!]
  interests: [String!]
  dealbreakers: [String!]
  verifiedOnly: Boolean!
  premiumOnly: Boolean!
}

# ========== QUERIES ==========

type Query {
  # Chat queries
  chat(id: ID!): Chat
  myChats(limit: Int = 20, offset: Int = 0): [Chat!]!
  chatMessages(chatID: ID!, limit: Int = 50, before: ID): [Message!]!
  chatParticipants(chatID: ID!): [ChatParticipant!]!

  # Match queries
  myMatches(limit: Int = 20, status: String = "active"): [Match!]!
  matchSuggestions(limit: Int = 10): [MatchSuggestion!]!
  matchStatistics: MatchStatistics!

  # User preferences
  myPreferences: UserPreferences
}

# ========== MUTATIONS ==========

type Mutation {
  # Chat mutations (lightweight - heavy traffic via WebSocket)
  createDMChat(participantID: ID!): Chat!
  markMessagesRead(chatID: ID!, messageIDs: [ID!]!): Boolean!
  archiveChat(chatID: ID!, archived: Boolean!): Boolean!
  muteChat(chatID: ID!, muted: Boolean!): Boolean!
  deleteMessage(messageID: ID!): Boolean!

  # Matching mutations
  likeUser(userID: ID!, type: LikeType = LIKE): LikeResult!
  unmatch(matchID: ID!): Boolean!
  reportUser(userID: ID!, reason: String!): Boolean!
  refreshSuggestions: [MatchSuggestion!]!

  # Preferences
  updatePreferences(input: PreferencesInput!): UserPreferences!
}

# ========== SUBSCRIPTIONS ==========

type Subscription {
  # Typing & presence (lightweight events)
  chatTyping(chatID: ID!): TypingEvent!
  userPresence(userID: ID!): PresenceEvent!

  # Match notifications
  newMatch: Match!
  newLike: User!

  # Message events (optional - main messages via WebSocket)
  messageDelivered(chatID: ID!): Message!
  messageRead(chatID: ID!): MessageReadEvent!

  # System notifications
  systemNotification: Notification!
}

# ========== INPUTS & ENUMS ==========

enum LikeType {
  LIKE
  SUPERLIKE
  PASS
}

input PreferencesInput {
  minAge: Int
  maxAge: Int
  maxDistanceKm: Int
  genderPreference: [String!]
  relationshipGoals: [String!]
  interests: [String!]
  dealbreakers: [String!]
  verifiedOnly: Boolean
  premiumOnly: Boolean
}

type MessageReadEvent {
  chatID: ID!
  messageID: ID!
  userID: ID!
  readAt: Time!
}

type Notification {
  id: ID!
  type: String!
  title: String!
  body: String!
  data: JSON
  createdAt: Time!
}

type MatchStatistics {
  totalMatches: Int!
  activeMatches: Int!
  totalLikes: Int!
  totalLikesReceived: Int!
  matchRate: Float!
}
```

#### 4.2.2 GraphQL Resolvers
**File:** `Backend/graph/resolvers.go`

**Query Resolvers:**
```go
func (r *queryResolver) Chat(ctx context.Context, id string) (*models.Chat, error) {
    user := auth.UserFromContext(ctx)
    chat, err := r.ChatService.GetChatByID(id)
    if err != nil {
        return nil, err
    }

    // Verify user is participant
    if !r.ChatService.IsParticipant(chat.ID.String(), user.ID) {
        return nil, errors.New("not authorized")
    }

    return chat, nil
}

func (r *queryResolver) MyChats(ctx context.Context, limit *int, offset *int) ([]*models.Chat, error) {
    user := auth.UserFromContext(ctx)
    return r.ChatService.GetUserChats(user.ID, *limit, *offset)
}

func (r *queryResolver) ChatMessages(ctx context.Context, chatID string, limit *int, before *string) ([]*models.Message, error) {
    user := auth.UserFromContext(ctx)

    // Verify user is participant
    if !r.ChatService.IsParticipant(chatID, user.ID) {
        return nil, errors.New("not authorized")
    }

    return r.ChatService.GetMessages(chatID, *limit, before)
}

func (r *queryResolver) MyMatches(ctx context.Context, limit *int, status *string) ([]*models.Match, error) {
    user := auth.UserFromContext(ctx)
    return r.MatchingService.GetUserMatches(user.ID, *limit, *status)
}

func (r *queryResolver) MatchSuggestions(ctx context.Context, limit *int) ([]*models.MatchSuggestion, error) {
    user := auth.UserFromContext(ctx)
    return r.MatchingService.GetSuggestions(user.ID, *limit)
}
```

**Mutation Resolvers:**
```go
func (r *mutationResolver) CreateDMChat(ctx context.Context, participantID string) (*models.Chat, error) {
    user := auth.UserFromContext(ctx)

    // Check if chat already exists
    existingChat, _ := r.ChatService.GetDMChatBetweenUsers(user.ID, participantID)
    if existingChat != nil {
        return existingChat, nil
    }

    // Create new DM chat
    chat, err := r.ChatService.CreateDMChat(user.ID, participantID)
    return chat, err
}

func (r *mutationResolver) LikeUser(ctx context.Context, userID string, likeType *string) (*LikeResult, error) {
    user := auth.UserFromContext(ctx)

    result, err := r.MatchingService.ProcessLike(user.ID, userID, *likeType)
    if err != nil {
        return &LikeResult{Success: false}, err
    }

    return result, nil
}

func (r *mutationResolver) MarkMessagesRead(ctx context.Context, chatID string, messageIDs []string) (bool, error) {
    user := auth.UserFromContext(ctx)

    err := r.ChatService.MarkMessagesAsRead(chatID, user.ID, messageIDs)
    if err != nil {
        return false, err
    }

    // Publish read receipts to NATS
    for _, msgID := range messageIDs {
        r.publishReadReceipt(chatID, msgID, user.ID)
    }

    return true, nil
}
```

**Subscription Resolvers:**
```go
func (r *subscriptionResolver) ChatTyping(ctx context.Context, chatID string) (<-chan *TypingEvent, error) {
    user := auth.UserFromContext(ctx)

    // Verify user is participant
    if !r.ChatService.IsParticipant(chatID, user.ID) {
        return nil, errors.New("not authorized")
    }

    // Create channel for events
    events := make(chan *TypingEvent, 10)

    // Subscribe to NATS subject
    subject := fmt.Sprintf("chat.typing.%s.>", chatID)
    sub, err := r.JS.Subscribe(subject, func(msg *nats.Msg) {
        var typingEvent TypingEvent
        json.Unmarshal(msg.Data, &typingEvent)

        // Don't send own typing events back
        if typingEvent.UserID != user.ID {
            select {
            case events <- &typingEvent:
            case <-ctx.Done():
                return
            }
        }
        msg.Ack()
    })

    if err != nil {
        return nil, err
    }

    // Cleanup on context cancel
    go func() {
        <-ctx.Done()
        sub.Unsubscribe()
        close(events)
    }()

    return events, nil
}

func (r *subscriptionResolver) NewMatch(ctx context.Context) (<-chan *models.Match, error) {
    user := auth.UserFromContext(ctx)

    matches := make(chan *models.Match, 10)

    subject := fmt.Sprintf("match.new.%s", user.ID)
    sub, err := r.JS.Subscribe(subject, func(msg *nats.Msg) {
        var match models.Match
        json.Unmarshal(msg.Data, &match)

        select {
        case matches <- &match:
        case <-ctx.Done():
            return
        }
        msg.Ack()
    })

    if err != nil {
        return nil, err
    }

    go func() {
        <-ctx.Done()
        sub.Unsubscribe()
        close(matches)
    }()

    return matches, nil
}
```

#### 4.2.3 GraphQL Server Setup
**File:** `Backend/cmd/api/graphql.go`

```go
func SetupGraphQL(nc *nats.Conn, js nats.JetStreamContext, db *gorm.DB) *handler.Server {
    // Create service instances
    chatService := chat.NewChatService(db, nc, js)
    matchingService := matching.NewMatchingService(db, nc, js)

    // Create resolver with dependencies
    resolver := &graph.Resolver{
        DB:              db,
        NC:              nc,
        JS:              js,
        ChatService:     chatService,
        MatchingService: matchingService,
    }

    // Create GraphQL server
    srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{
        Resolvers: resolver,
    }))

    // Add middleware
    srv.Use(extension.Introspection{})

    return srv
}
```

### 4.3 Testing Requirements
- Unit tests for each resolver
- Integration tests with test database and NATS
- Subscription tests (verify events are received)
- Authorization tests (verify user can only access their chats)
- Performance tests (query response time < 200ms)

---

## PART 5: DATABASE MIGRATIONS & INTEGRATION

### 5.1 Objectives
- Create database migration files for all new tables
- Set up proper indices for performance
- Integrate all services with main application
- Update dependencies and configuration
- Create integration tests

### 5.2 Deliverables

#### 5.2.1 Database Migration
**File:** `Backend/database/migrations/004_chat_matching_tables.sql`

```sql
-- ============================
-- CHAT TABLES
-- ============================

CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('dm', 'group')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_message_id UUID,
    last_message_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    left_at TIMESTAMP,
    muted BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    last_read_message_id UUID,
    last_read_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Content
    content TEXT,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'audio', 'file')),
    media_url TEXT,
    media_metadata JSONB,

    -- Metadata
    reply_to_message_id UUID REFERENCES messages(id),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'media', 'system')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Ordering
    sequence_number BIGSERIAL NOT NULL,

    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'pending',

    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS message_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('delivered', 'read')),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, status)
);

-- ============================
-- MATCHING TABLES
-- ============================

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 99,
    max_distance_km INTEGER DEFAULT 50,
    gender_preference VARCHAR(50)[],
    relationship_goals VARCHAR(50)[],
    interests VARCHAR(100)[],
    dealbreakers VARCHAR(100)[],
    verified_only BOOLEAN DEFAULT FALSE,
    premium_only BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles_extended (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    height_cm INTEGER,
    education VARCHAR(100),
    occupation VARCHAR(100),
    religion VARCHAR(50),
    smoking VARCHAR(20),
    drinking VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    country VARCHAR(100),
    response_rate DECIMAL(5, 2) DEFAULT 0.0,
    profile_completeness INTEGER DEFAULT 0,
    last_active_at TIMESTAMP,
    photo_urls TEXT[],
    verified_photo BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    match_score DECIMAL(5, 2),
    match_reason TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unmatched', 'blocked')),
    chat_id UUID REFERENCES chats(id),
    first_message_at TIMESTAMP,
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    like_type VARCHAR(20) DEFAULT 'like' CHECK (like_type IN ('like', 'superlike', 'pass')),
    UNIQUE(from_user_id, to_user_id)
);

CREATE TABLE IF NOT EXISTS match_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggested_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5, 2) NOT NULL,
    score_breakdown JSONB,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    shown_at TIMESTAMP,
    interaction VARCHAR(20) CHECK (interaction IN ('like', 'pass', 'superlike')),
    interacted_at TIMESTAMP,
    rank INTEGER,
    batch_id UUID
);

-- ============================
-- INDICES
-- ============================

-- Chat indices
CREATE INDEX idx_messages_chat_id_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sequence ON messages(chat_id, sequence_number);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_chat ON chat_participants(chat_id);
CREATE INDEX idx_messages_deleted ON messages(deleted_at) WHERE deleted_at IS NOT NULL;

-- Matching indices
CREATE INDEX idx_likes_from_user ON likes(from_user_id, created_at DESC);
CREATE INDEX idx_likes_to_user ON likes(to_user_id, created_at DESC);
CREATE INDEX idx_matches_user1 ON matches(user1_id, status);
CREATE INDEX idx_matches_user2 ON matches(user2_id, status);
CREATE INDEX idx_suggestions_user_score ON match_suggestions(user_id, score DESC);
CREATE INDEX idx_suggestions_shown ON match_suggestions(user_id, shown_at) WHERE shown_at IS NULL;
CREATE INDEX idx_user_profiles_active ON user_profiles_extended(last_active_at DESC);

-- Geospatial index for location-based matching
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE INDEX idx_user_profiles_location ON user_profiles_extended
    USING GIST(ll_to_earth(latitude, longitude))
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ============================
-- TRIGGERS
-- ============================

-- Update chat.updated_at on new message
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats
    SET updated_at = NEW.created_at,
        last_message_id = NEW.id,
        last_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_timestamp();

-- Update unread count on new message
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_participants
    SET unread_count = unread_count + 1
    WHERE chat_id = NEW.chat_id AND user_id != NEW.sender_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_unread_count
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_unread_count();
```

#### 5.2.2 Migration Runner
**File:** `Backend/database/migrator.go`

```go
func RunMigrations(db *gorm.DB) error {
    // Auto-migrate existing models
    err := db.AutoMigrate(
        &models.User{},
        &models.Blog{},
        &models.News{},
        &models.Chat{},
        &models.ChatParticipant{},
        &models.Message{},
        &models.MessageReceipt{},
        &models.UserPreferences{},
        &models.UserProfileExtended{},
        &models.Match{},
        &models.Like{},
        &models.MatchSuggestion{},
    )

    if err != nil {
        return fmt.Errorf("auto-migration failed: %w", err)
    }

    // Run custom SQL migrations for indices, triggers, etc.
    sqlFile, err := os.ReadFile("database/migrations/004_chat_matching_tables.sql")
    if err != nil {
        return fmt.Errorf("failed to read migration file: %w", err)
    }

    if err := db.Exec(string(sqlFile)).Error; err != nil {
        return fmt.Errorf("failed to execute migration: %w", err)
    }

    log.Println("✅ Database migrations completed successfully")
    return nil
}
```

#### 5.2.3 Main Application Integration
**File:** `Backend/cmd/api/main.go`

```go
package main

import (
    "log"
    "time"

    "github.com/gin-gonic/gin"
    "gsl-backend/database"
    "gsl-backend/pkg/natsutil"
    "gsl-backend/pkg/websocket"
    "gsl-backend/services/chat"
    "gsl-backend/services/matching"
    "gsl-backend/services/gateway"
)

func main() {
    // Load environment variables
    config := loadConfig()

    // Connect to PostgreSQL
    db, err := database.Connect(config.DatabaseURL)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // Run migrations
    if err := database.RunMigrations(db); err != nil {
        log.Fatal("Failed to run migrations:", err)
    }

    // Connect to NATS with JetStream
    nc, js, err := natsutil.ConnectNATS(natsutil.JetStreamConfig{
        URL:           config.NATSURL,
        MaxReconnects: 10,
        ReconnectWait: 2 * time.Second,
    })
    if err != nil {
        log.Fatal("Failed to connect to NATS:", err)
    }
    defer nc.Close()

    // Initialize services
    chatService := chat.NewChatService(db, nc, js)
    matchingService := matching.NewMatchingService(db, nc, js)

    // Initialize WebSocket connection manager
    connManager := websocket.NewConnectionManager()
    go connManager.Run()

    // Subscribe to NATS events and bridge to WebSocket
    gateway.SubscribeToNATSEvents(js, connManager)

    // Start background workers
    go matchingService.StartSuggestionRefreshWorker(24 * time.Hour)

    // Setup Gin router
    r := gin.Default()

    // Apply middleware
    r.Use(corsMiddleware())

    // Health check
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    // WebSocket endpoint
    r.GET("/ws/chat", gateway.ChatWebSocketHandler(nc, js, chatService, connManager))

    // GraphQL endpoint
    graphqlHandler := gateway.SetupGraphQL(nc, js, db, chatService, matchingService)
    r.POST("/graphql", ginGraphQL(graphqlHandler))
    r.GET("/graphql", ginGraphQL(graphqlHandler))
    r.GET("/playground", ginPlayground("/graphql"))

    // Start server
    log.Printf("🚀 Server starting on port %s", config.Port)
    if err := r.Run(":" + config.Port); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}
```

#### 5.2.4 Update go.mod Dependencies
**File:** `Backend/go.mod`

Add these dependencies:
```
require (
    github.com/gin-gonic/gin v1.9.1
    github.com/99designs/gqlgen v0.17.83
    github.com/nats-io/nats.go v1.31.0
    github.com/gorilla/websocket v1.5.1
    gorm.io/gorm v1.25.5
    gorm.io/driver/postgres v1.5.4
    github.com/google/uuid v1.6.0
    github.com/golang-jwt/jwt/v5 v5.2.0
    golang.org/x/crypto latest
)
```

#### 5.2.5 Configuration File
**File:** `Backend/config/config.go`

```go
package config

import (
    "os"
    "time"
)

type Config struct {
    // Server
    Port        string
    Environment string

    // Database
    DatabaseURL string

    // NATS
    NATSURL     string

    // JWT
    JWTSecret   string

    // CORS
    FrontendURL string

    // Matching
    MatchingScoreThreshold     float64
    MatchingSuggestionLimit    int
    MatchingRefreshInterval    time.Duration

    // WebSocket
    WSReadBufferSize   int
    WSWriteBufferSize  int
    WSPingPeriod       time.Duration
    WSPongWait         time.Duration
    WSMaxMessageSize   int64
}

func Load() *Config {
    return &Config{
        Port:                       getEnv("PORT", "8080"),
        Environment:                getEnv("GIN_MODE", "debug"),
        DatabaseURL:                getEnv("DATABASE_URL", ""),
        NATSURL:                    getEnv("NATS_URL", "nats://localhost:4222"),
        JWTSecret:                  getEnv("JWT_SECRET", ""),
        FrontendURL:                getEnv("FRONTEND_URL", "http://localhost:3000"),
        MatchingScoreThreshold:     50.0,
        MatchingSuggestionLimit:    20,
        MatchingRefreshInterval:    24 * time.Hour,
        WSReadBufferSize:           1024,
        WSWriteBufferSize:          1024,
        WSPingPeriod:               30 * time.Second,
        WSPongWait:                 60 * time.Second,
        WSMaxMessageSize:           512000,
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

#### 5.2.6 Docker Compose for Development
**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  nats:
    image: nats:latest
    ports:
      - "4222:4222"  # Client connections
      - "8222:8222"  # HTTP monitoring
      - "6222:6222"  # Cluster routing
    command: "-js -m 8222 --store_dir=/data"
    volumes:
      - nats_data:/data

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: gsl_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - NATS_URL=nats://nats:4222
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/gsl_db?sslmode=disable
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=http://localhost:3000
      - GIN_MODE=debug
    depends_on:
      - nats
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8080
      - NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
      - NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:8080/graphql
      - NEXT_PUBLIC_WS_URL=ws://localhost:8080
    depends_on:
      - api

volumes:
  nats_data:
  postgres_data:
```

### 5.3 Testing Requirements
- Integration tests for full message flow (send via WS, persist to DB, receive via NATS)
- End-to-end tests for matching flow (like → match → chat creation)
- Load tests with realistic traffic patterns
- Database query performance tests
- NATS message throughput tests

### 5.4 Deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] NATS JetStream streams created
- [ ] WebSocket connections tested
- [ ] GraphQL endpoint tested
- [ ] Monitoring and logging configured
- [ ] Load balancer configured for WebSocket sticky sessions
- [ ] SSL certificates installed (wss://)
- [ ] Rate limiting configured
- [ ] Backup strategy for PostgreSQL

---

## 4. SUCCESS CRITERIA

### 4.1 Functional Requirements
- ✅ Users can send and receive messages in real-time
- ✅ Messages are persisted to PostgreSQL
- ✅ Typing indicators work correctly
- ✅ Presence status (online/offline) is accurate
- ✅ Match suggestions are relevant (score > 70)
- ✅ Mutual matches create chat automatically
- ✅ GraphQL subscriptions deliver events
- ✅ WebSocket connections are stable

### 4.2 Non-Functional Requirements
- ✅ Message delivery latency < 100ms (p95)
- ✅ API response time < 200ms (p95)
- ✅ Support 10,000 concurrent WebSocket connections per instance
- ✅ 99.9% message delivery rate
- ✅ Horizontal scalability (add more instances)
- ✅ Database query time < 50ms (p95)
- ✅ NATS event processing < 10ms

### 4.3 Quality Requirements
- ✅ 80%+ code coverage for unit tests
- ✅ All integration tests passing
- ✅ Load tests passing (10k concurrent connections)
- ✅ No memory leaks in connection manager
- ✅ Proper error handling and logging
- ✅ Security: JWT validation, SQL injection prevention, XSS prevention

---

## 5. IMPLEMENTATION ORDER

### Phase 1: Foundation (Week 1)
1. ✅ Set up NATS JetStream infrastructure
2. ✅ Create database models and migrations
3. ✅ Implement Chat repository layer
4. ✅ Build basic Chat Service

### Phase 2: Real-time Communication (Week 2)
1. ✅ Implement WebSocket handler and connection manager
2. ✅ Build NATS to WebSocket bridge
3. ✅ Test message sending and receiving
4. ✅ Implement typing indicators and presence

### Phase 3: Matching System (Week 3)
1. ✅ Create matching models and repository
2. ✅ Implement scoring algorithm
3. ✅ Build match suggestion generator
4. ✅ Implement like/match processing
5. ✅ Test matching flow end-to-end

### Phase 4: GraphQL Integration (Week 4)
1. ✅ Create GraphQL schema
2. ✅ Implement query/mutation resolvers
3. ✅ Build GraphQL subscriptions
4. ✅ Test with frontend integration

### Phase 5: Production Readiness (Week 5)
1. ✅ Performance optimization
2. ✅ Load testing and tuning
3. ✅ Monitoring and logging setup
4. ✅ Documentation and deployment guides

---

## 6. RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| NATS JetStream learning curve | High | Medium | Allocate extra time for R&D, use official docs |
| WebSocket connection scalability | High | Medium | Implement connection pooling, load balancing |
| Database query performance | Medium | High | Proper indexing, query optimization, caching |
| Message ordering issues | High | Low | Use sequence numbers, NATS guarantees |
| Matching algorithm accuracy | Medium | Medium | A/B testing, iterative tuning |

---

## 7. MONITORING & OBSERVABILITY

### 7.1 Metrics to Track
- WebSocket connections (active, total, errors)
- Message throughput (messages/sec)
- Message delivery latency (p50, p95, p99)
- NATS event processing time
- Database query performance
- Match suggestion generation time
- API response times
- Error rates

### 7.2 Logging
- Structured logging (JSON format)
- Log levels: DEBUG, INFO, WARN, ERROR
- Correlation IDs for request tracing
- NATS message tracking

### 7.3 Alerting
- WebSocket connection failures > 5%
- Message delivery latency > 200ms
- Database query time > 100ms
- NATS connection lost
- API error rate > 1%

---

## 8. FUTURE ENHANCEMENTS

### Phase 2 Features (Post-MVP)
- [ ] Group chat support
- [ ] Voice/video calling
- [ ] Message encryption (E2EE)
- [ ] Advanced matching (ML-based)
- [ ] Boost/premium features
- [ ] Message reactions
- [ ] Read receipts with avatars
- [ ] Message search
- [ ] Push notifications (APNs/FCM)
- [ ] Admin moderation panel

---

## 9. APPENDIX

### 9.1 Glossary
- **NATS**: Messaging system for cloud-native applications
- **JetStream**: NATS persistence layer for streams
- **WebSocket**: Protocol for bidirectional real-time communication
- **GraphQL Subscription**: Real-time GraphQL query over WebSocket
- **Match Score**: Compatibility score between two users (0-100)

### 9.2 References
- NATS Documentation: https://docs.nats.io/
- gqlgen Documentation: https://gqlgen.com/
- Gorilla WebSocket: https://github.com/gorilla/websocket
- GORM Documentation: https://gorm.io/docs/

---

**Document Status:** APPROVED FOR IMPLEMENTATION
**Next Review Date:** After Part 3 completion
**Change Log:**
- 2025-11-21: Initial PRD created
