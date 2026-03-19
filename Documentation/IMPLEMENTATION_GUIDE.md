# GSL NextGo - Chat & Matching Implementation Guide

**Version:** 1.0
**Date:** 2025-11-21
**Status:** ✅ Implementation Complete

---

## 📋 Overview

This guide provides step-by-step instructions to set up and run the GSL NextGo chat and matching microservices implementation.

### What's Been Implemented

✅ **Part 1:** NATS Infrastructure & Chat Backend
✅ **Part 2:** Matching Algorithm Service
✅ **Part 3:** WebSocket Gateway & Connection Manager
✅ **Part 4:** GraphQL Resolvers for Chat & Matching
✅ **Part 5:** Database Migrations & Integration

---

## 🏗️ Architecture Summary

```
Next.js Frontend
    ↓ (GraphQL/WebSocket)
API Gateway (Go + Gin)
    ↓ (NATS Events)
┌─────────────┬──────────────┐
Chat Service  Matching Service  User Service
    ↓              ↓
NATS JetStream  PostgreSQL
```

**Key Technologies:**
- **Backend:** Go 1.24+
- **Message Broker:** NATS JetStream
- **Database:** PostgreSQL 15+
- **GraphQL:** gqlgen
- **WebSocket:** gorilla/websocket
- **Frontend:** Next.js 14 (already exists)

---

## 🚀 Quick Start

### Prerequisites

1. **Go 1.24+** installed
2. **PostgreSQL 15+** running
3. **NATS Server** installed and running
4. **Node.js 18+** for frontend (already set up)

### Step 1: Install NATS

```bash
# macOS
brew install nats-server

# Linux
wget https://github.com/nats-io/nats-server/releases/download/v2.10.0/nats-server-v2.10.0-linux-amd64.zip
unzip nats-server-v2.10.0-linux-amd64.zip
sudo mv nats-server-v2.10.0-linux-amd64/nats-server /usr/local/bin/

# Verify installation
nats-server --version
```

### Step 2: Start NATS with JetStream

```bash
nats-server -js -m 8222 --store_dir=./nats-data
```

This starts NATS with:
- JetStream enabled (`-js`)
- Monitoring on port 8222 (`-m 8222`)
- Data stored in `./nats-data`

### Step 3: Set Up PostgreSQL Database

```bash
# Create database
createdb gsl_db

# Or using psql
psql -U postgres
CREATE DATABASE gsl_db;
\q
```

### Step 4: Configure Environment

```bash
cd Backend
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required settings:**
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gsl_db?sslmode=disable
NATS_URL=nats://localhost:4222
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
FRONTEND_URL=http://localhost:3000
```

### Step 5: Install Go Dependencies

```bash
cd Backend
go mod download
go mod tidy
```

### Step 6: Run Database Migrations

The migrations will run automatically on server start. To run manually:

```bash
psql -U postgres -d gsl_db -f database/migrations/004_chat_matching_tables.sql
```

### Step 7: Start the Backend Server

```bash
cd Backend
go run main.go
```

You should see:
```
✅ Connected to NATS at nats://localhost:4222
✅ Chat streams configured successfully
✅ Matching streams configured successfully
✅ Database migrations completed successfully
🚀 Server starting on port 8080
```

### Step 8: Verify Setup

**Check NATS JetStream:**
```bash
nats stream list
```

Expected output:
```
Streams:
    CHAT_MESSAGES
    PRESENCE
    MATCHES
    NOTIFICATIONS
```

**Check PostgreSQL Tables:**
```bash
psql -U postgres -d gsl_db -c "\dt"
```

Expected tables:
- chats
- chat_participants
- messages
- message_receipts
- user_preferences
- user_profiles_extended
- matches
- likes
- match_suggestions

**Test GraphQL Endpoint:**
```bash
curl http://localhost:8080/graphql
```

**Test WebSocket:**
Open browser console on `http://localhost:3000` and run:
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/chat?token=YOUR_JWT_TOKEN');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## 📁 Project Structure

```
Backend/
├── cmd/                          # Command-line tools
│   └── seed/                     # Database seeders
├── database/                     # Database configuration
│   └── migrations/               # SQL migrations
│       └── 004_chat_matching_tables.sql
├── graph/                        # GraphQL layer
│   ├── schema/
│   │   └── schema.graphqls       # GraphQL schema
│   └── resolver/
│       ├── root_resolver.go      # Root resolver
│       ├── chat_resolver.go      # Chat queries/mutations/subscriptions
│       └── matching_resolver.go  # Matching queries/mutations/subscriptions
├── models/                       # Database models
│   ├── user.go
│   ├── blog.go
│   ├── news.go
│   ├── chat.go                   # ✨ NEW
│   └── matching.go               # ✨ NEW
├── pkg/                          # Shared packages
│   ├── natsutil/                 # ✨ NEW
│   │   └── jetstream.go          # NATS JetStream setup
│   └── websocket/                # ✨ NEW
│       ├── connection_manager.go # WebSocket connection manager
│       ├── protocol.go           # WebSocket message protocol
│       └── connection.go         # Read/write pumps
├── services/                     # Business logic services
│   ├── chat/                     # ✨ NEW
│   │   ├── service.go            # Chat service
│   │   └── repository/
│   │       └── chat_repository.go
│   ├── matching/                 # ✨ NEW
│   │   ├── service.go            # Matching service
│   │   ├── repository/
│   │   │   └── matching_repository.go
│   │   └── scorer/
│   │       └── match_scorer.go   # Matching algorithm
│   └── gateway/                  # ✨ NEW
│       ├── websocket_handler.go  # WebSocket HTTP handler
│       └── nats_bridge.go        # NATS → WebSocket bridge
├── utils/                        # Utility functions
│   ├── auth.go
│   └── cloudinary.go
├── main.go                       # Application entry point
├── go.mod                        # Go dependencies
└── .env.example                  # Environment template
```

---

## 🔑 Key Implementation Files

### 1. NATS JetStream Configuration
**File:** `Backend/pkg/natsutil/jetstream.go`

Creates 4 durable streams:
- **CHAT_MESSAGES** - 30-day retention, file storage
- **PRESENCE** - 5-minute retention, memory storage
- **MATCHES** - 7-day retention, file storage
- **NOTIFICATIONS** - 24-hour retention, file storage

### 2. Chat Service
**File:** `Backend/services/chat/service.go`

**Key Methods:**
- `SendMessage()` - Persist → Publish to NATS → Push notifications
- `CreateDMChat()` - Create 1-on-1 chat
- `GetMessages()` - Retrieve chat history
- `MarkMessagesAsRead()` - Update read receipts
- `HandleTypingIndicator()` - Publish typing events
- `HandlePresenceUpdate()` - Publish online/offline

### 3. Matching Algorithm
**File:** `Backend/services/matching/scorer/match_scorer.go`

**Scoring Formula:**
```
Total Score = (Age × 20%) + (Distance × 15%) + (Interests × 25%)
            + (Profile Quality × 10%) + (Activity × 15%)
            + (Mutual Preferences × 15%)
```

**Methods:**
- `CalculateMatchScore()` - Compute overall score (0-100)
- `ScoreAge()` - Age compatibility
- `ScoreDistance()` - Geo-distance scoring
- `ScoreInterests()` - Jaccard similarity
- `ScoreProfileQuality()` - Profile completeness
- `ScoreActivity()` - Engagement metrics
- `ScoreMutualPreferences()` - Gender/goals compatibility

### 4. WebSocket Connection Manager
**File:** `Backend/pkg/websocket/connection_manager.go`

**Features:**
- Multi-device support (multiple connections per user)
- Chat room subscriptions
- Broadcast to chat, user, or all
- Auto-cleanup of stale connections
- Connection statistics

### 5. NATS → WebSocket Bridge
**File:** `Backend/services/gateway/nats_bridge.go`

**Subscriptions:**
- `chat.message.*.sent` → Broadcast to chat participants
- `chat.typing.>` → Broadcast typing indicators
- `chat.presence.>` → Broadcast online/offline
- `match.new.>` → Notify users of new matches
- `match.like.>` → Notify users of likes

---

## 🔌 API Endpoints

### GraphQL Endpoint
```
POST/GET http://localhost:8080/graphql
```

### GraphQL Playground
```
GET http://localhost:8080/playground
```

### WebSocket Endpoint
```
WS ws://localhost:8080/ws/chat?token={JWT_TOKEN}
```

---

## 📡 GraphQL API Examples

### Create DM Chat
```graphql
mutation {
  createDMChat(participantID: "user-uuid") {
    id
    type
    participants {
      user {
        id
        username
      }
    }
  }
}
```

### Get Chat Messages
```graphql
query {
  chatMessages(chatID: "chat-uuid", limit: 50) {
    id
    content
    sender {
      username
      avatar
    }
    createdAt
  }
}
```

### Like a User
```graphql
mutation {
  likeUser(userID: "user-uuid", type: LIKE) {
    success
    matched
    match {
      id
      matchScore
      matchedUser {
        username
        avatar
      }
    }
  }
}
```

### Get Match Suggestions
```graphql
query {
  matchSuggestions(limit: 10) {
    user {
      id
      username
      avatar
    }
    score
    scoreBreakdown
  }
}
```

### Subscribe to New Matches
```graphql
subscription {
  newMatch {
    id
    matchedUser {
      username
      avatar
    }
    matchScore
  }
}
```

### Subscribe to Typing Indicators
```graphql
subscription {
  chatTyping(chatID: "chat-uuid") {
    userID
    typing
  }
}
```

---

## 🌐 WebSocket Protocol

### Client → Server Messages

**Send Message:**
```json
{
  "type": "message.send",
  "request_id": "uuid",
  "payload": {
    "chat_id": "chat-uuid",
    "content": "Hello!",
    "temp_id": "temp-uuid"
  }
}
```

**Typing Indicator:**
```json
{
  "type": "typing.start",
  "payload": {
    "chat_id": "chat-uuid"
  }
}
```

**Subscribe to Chat:**
```json
{
  "type": "subscribe",
  "payload": {
    "chat_id": "chat-uuid"
  }
}
```

**Mark as Read:**
```json
{
  "type": "message.read",
  "payload": {
    "chat_id": "chat-uuid",
    "message_ids": ["msg-uuid-1", "msg-uuid-2"]
  }
}
```

### Server → Client Messages

**Message Acknowledgement:**
```json
{
  "type": "message.ack",
  "request_id": "uuid",
  "payload": {
    "temp_id": "temp-uuid",
    "message": { /* full message object */ }
  }
}
```

**New Message Received:**
```json
{
  "type": "message.received",
  "payload": {
    "message": {
      "id": "uuid",
      "chat_id": "chat-uuid",
      "sender_id": "user-uuid",
      "content": "Hello!",
      "created_at": "2025-11-21T10:00:00Z"
    }
  }
}
```

**Match Event:**
```json
{
  "type": "match.new",
  "payload": {
    "match": { /* match object */ }
  }
}
```

---

## 🧪 Testing

### Unit Tests
```bash
cd Backend
go test ./services/chat/...
go test ./services/matching/...
```

### Integration Tests
```bash
go test ./... -tags=integration
```

### Load Testing (WebSocket)
```bash
# Install websocket stress tool
go install github.com/tsenart/vegeta@latest

# Run load test
echo "GET ws://localhost:8080/ws/chat?token=TOKEN" | vegeta attack -rate=1000 -duration=30s | vegeta report
```

---

## 📊 Monitoring

### NATS Monitoring
Access NATS monitoring dashboard:
```
http://localhost:8222
```

### Stream Statistics
```bash
nats stream info CHAT_MESSAGES
nats stream info MATCHES
```

### Consumer Statistics
```bash
nats consumer list CHAT_MESSAGES
```

### PostgreSQL Monitoring
```sql
-- Check message count
SELECT COUNT(*) FROM messages;

-- Check active matches
SELECT COUNT(*) FROM matches WHERE status = 'active';

-- Check unread messages
SELECT user_id, SUM(unread_count)
FROM chat_participants
GROUP BY user_id;
```

---

## 🐛 Troubleshooting

### Issue: NATS connection failed
**Solution:**
```bash
# Check if NATS is running
nats-server --version

# Start NATS
nats-server -js -m 8222
```

### Issue: WebSocket upgrade failed
**Solution:**
- Verify JWT token is valid
- Check CORS settings in `.env`
- Ensure WebSocket endpoint is accessible

### Issue: Database migration failed
**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -l

# Re-run migrations
psql -U postgres -d gsl_db -f Backend/database/migrations/004_chat_matching_tables.sql
```

### Issue: Messages not being delivered
**Solution:**
1. Check NATS streams are created:
   ```bash
   nats stream list
   ```
2. Check WebSocket connections:
   ```bash
   curl http://localhost:8080/api/stats
   ```
3. Check NATS bridge is subscribed:
   - Look for log: `✅ Subscribed to chat messages`

---

## 🚀 Deployment

### Docker Deployment

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  nats:
    image: nats:latest
    ports:
      - "4222:4222"
      - "8222:8222"
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
    build: ./Backend
    ports:
      - "8080:8080"
    environment:
      - NATS_URL=nats://nats:4222
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/gsl_db
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - nats
      - postgres

volumes:
  nats_data:
  postgres_data:
```

**Start:**
```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set `GIN_MODE=release`
- [ ] Use strong JWT secret (32+ characters)
- [ ] Configure SSL/TLS for PostgreSQL
- [ ] Set up NATS cluster (3+ nodes)
- [ ] Enable WebSocket SSL (wss://)
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure log aggregation (ELK/Loki)
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Enable database connection pooling

---

## 📚 Additional Resources

- **PRD:** `Documentation/PRD_CHAT_MATCHING_MICROSERVICES.md`
- **NATS Docs:** https://docs.nats.io/
- **gqlgen Docs:** https://gqlgen.com/
- **Gorilla WebSocket:** https://github.com/gorilla/websocket

---

## ✅ Implementation Status

| Component | Status | Files |
|-----------|--------|-------|
| NATS Infrastructure | ✅ Complete | `pkg/natsutil/jetstream.go` |
| Chat Models | ✅ Complete | `models/chat.go` |
| Chat Repository | ✅ Complete | `services/chat/repository/chat_repository.go` |
| Chat Service | ✅ Complete | `services/chat/service.go` |
| Matching Models | ✅ Complete | `models/matching.go` |
| Matching Repository | ✅ Complete | `services/matching/repository/matching_repository.go` |
| Matching Scorer | ✅ Complete | `services/matching/scorer/match_scorer.go` |
| Matching Service | ✅ Complete | `services/matching/service.go` |
| WebSocket Manager | ✅ Complete | `pkg/websocket/connection_manager.go` |
| WebSocket Protocol | ✅ Complete | `pkg/websocket/protocol.go` |
| WebSocket Handler | ✅ Complete | `services/gateway/websocket_handler.go` |
| NATS Bridge | ✅ Complete | `services/gateway/nats_bridge.go` |
| GraphQL Schema | ✅ Complete | `graph/schema/schema.graphqls` |
| Chat Resolvers | ✅ Complete | `graph/resolver/chat_resolver.go` |
| Matching Resolvers | ✅ Complete | `graph/resolver/matching_resolver.go` |
| Database Migrations | ✅ Complete | `database/migrations/004_chat_matching_tables.sql` |
| Dependencies | ✅ Complete | `go.mod` |

---

**Implementation Complete!** 🎉

The GSL NextGo chat and matching system is fully implemented and ready for integration with the existing frontend.
