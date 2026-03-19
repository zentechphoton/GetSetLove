# Backend Documentation

Complete documentation for the GSL NextGo backend system.

## 📋 Table of Contents

1. [Architecture Overview](architecture.md)
2. [Setup & Installation](#setup--installation)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [Services](#services)
6. [Database](#database)
7. [API Endpoints](#api-endpoints)
8. [Development](#development)

## 🏗️ Architecture Overview

The backend is built using a microservices architecture with:

- **Go 1.24+** as the primary language
- **Gin** web framework for HTTP routing
- **gqlgen** for GraphQL API
- **GORM** for database operations
- **NATS JetStream** for message streaming
- **WebSocket** for real-time communication
- **PostgreSQL** for data persistence

See [Architecture Documentation](architecture.md) for detailed information.

## 🛠️ Setup & Installation

### Prerequisites

- Go 1.24 or higher
- PostgreSQL 15+
- NATS Server (with JetStream enabled)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GSL_NextGo/Backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   go mod tidy
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start NATS Server**
   ```bash
   nats-server -js -m 8222 --store_dir=./nats-data
   ```

5. **Run database migrations**
   The database will auto-migrate on startup, or run manually:
   ```bash
   psql -U postgres -d gsl_db -f database/migrations/004_chat_matching_tables.sql
   ```

6. **Start the server**
   ```bash
   go run main.go
   # Or
   ./start.sh  # Linux/Mac
   start.bat   # Windows
   ```

## 📁 Project Structure

```
Backend/
├── main.go                    # Application entry point
├── go.mod                     # Go dependencies
├── gqlgen.yml                 # GraphQL code generation config
│
├── database/                  # Database layer
│   ├── database.go           # Connection & migration
│   └── migrations/           # SQL migration files
│       └── 004_chat_matching_tables.sql
│
├── models/                    # Database models
│   ├── user.go               # User model
│   ├── chat.go               # Chat models (Chat, Message, etc.)
│   ├── matching.go           # Matching models (Match, Like, etc.)
│   ├── blog.go               # Blog model
│   ├── news.go               # News model
│   ├── user_settings.go      # User settings model
│   └── verification_request.go # Verification request model
│
├── graph/                     # GraphQL layer
│   ├── schema/
│   │   └── schema.graphqls   # GraphQL schema definition
│   ├── resolver/             # GraphQL resolvers
│   │   ├── root_resolver.go  # Root resolver
│   │   ├── query.go          # Query resolvers
│   │   ├── mutation.go       # Mutation resolvers
│   │   ├── chat_resolver.go  # Chat resolvers
│   │   └── matching_resolver.go # Matching resolvers
│   ├── handler.go            # GraphQL HTTP handler
│   ├── middleware.go         # GraphQL middleware
│   └── generated/           # Generated gqlgen code
│
├── services/                  # Business logic services
│   ├── chat/                 # Chat service
│   │   ├── service.go        # Chat business logic
│   │   └── repository/       # Chat data access
│   │       └── chat_repository.go
│   ├── matching/             # Matching service
│   │   ├── service.go        # Matching business logic
│   │   ├── repository/       # Matching data access
│   │   │   └── matching_repository.go
│   │   └── scorer/           # Matching algorithm
│   │       └── match_scorer.go
│   └── gateway/              # API Gateway
│       ├── websocket_handler.go # WebSocket handler
│       └── nats_bridge.go    # NATS to WebSocket bridge
│
├── pkg/                       # Shared packages
│   ├── natsutil/             # NATS utilities
│   │   └── jetstream.go     # JetStream configuration
│   └── websocket/            # WebSocket utilities
│       ├── connection_manager.go # Connection management
│       ├── connection.go     # Connection read/write pumps
│       └── protocol.go       # WebSocket protocol
│
├── handlers/                  # REST API handlers
│   ├── auth.go               # Authentication handlers
│   ├── user.go               # User handlers (dashboard, matches, messages, settings, verification requests)
│   ├── admin.go              # Admin handlers (users, matches, verification management)
│   ├── blog.go               # Blog handlers
│   └── news.go               # News handlers
│
├── middleware/                 # HTTP middleware
│   └── auth.go               # JWT authentication middleware
│
├── routes/                    # Route configuration
│   └── routes.go              # All routes setup
│
└── utils/                     # Utility functions
    ├── auth.go               # JWT & password utilities
    └── cloudinary.go          # Cloudinary integration
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=8080
GIN_MODE=debug  # or "release" for production

# Database Configuration
DATABASE_URL=postgres://user:password@localhost:5432/gsl_db?sslmode=disable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# NATS Configuration
NATS_URL=nats://localhost:4222

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Configuration Files

- **gqlgen.yml** - GraphQL code generation configuration
- **go.mod** - Go module dependencies

## 🔧 Services

### Chat Service

Location: `services/chat/`

**Key Features:**
- Real-time message sending and receiving
- Message persistence
- Typing indicators
- Presence status
- Read receipts
- Chat participant management

**Main Methods:**
- `SendMessage()` - Send a new message
- `GetMessages()` - Retrieve message history
- `CreateDMChat()` - Create 1-on-1 chat
- `MarkMessagesAsRead()` - Mark messages as read
- `HandleTypingIndicator()` - Handle typing events
- `HandlePresenceUpdate()` - Handle presence updates

### Matching Service

Location: `services/matching/`

**Key Features:**
- Intelligent matching algorithm
- Match scoring
- Like/pass/superlike functionality
- Match suggestions generation
- Mutual match creation

**Main Methods:**
- `GenerateSuggestions()` - Generate match suggestions
- `ProcessLike()` - Process like action
- `GetUserMatches()` - Get user's matches
- `GetSuggestions()` - Get existing suggestions

### WebSocket Gateway

Location: `services/gateway/`

**Key Features:**
- WebSocket connection management
- NATS to WebSocket message bridging
- Real-time event distribution

## 🗄️ Database

### Models

All database models are in the `models/` directory:

- **User** - User accounts (with is_verified, is_premium flags)
- **Chat** - Chat conversations
- **ChatParticipant** - Chat participants
- **Message** - Chat messages
- **MessageReceipt** - Message delivery/read receipts
- **Match** - Mutual matches
- **Like** - Like actions
- **MatchSuggestion** - Match suggestions
- **UserPreferences** - User matching preferences
- **UserProfileExtended** - Extended user profile data
- **UserSettings** - User settings (profile visibility, discovery, notifications, privacy)
- **VerificationRequest** - Profile verification requests
- **Blog** - Blog posts
- **News** - News articles

### Migrations

Migrations are in `database/migrations/`:

- `004_chat_matching_tables.sql` - Chat and matching tables

Auto-migration runs on server startup for GORM models.

## 🌐 API Endpoints

### GraphQL

- **Endpoint**: `POST/GET http://localhost:8080/graphql`
- **Playground**: `GET http://localhost:8080/playground` (development only)

See [API Documentation](../api/graphql-api.md) for complete GraphQL schema.

### REST API

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

**User Endpoints:**
- `GET /api/user/dashboard` - Get user dashboard data
- `GET /api/user/matches` - Get user matches
- `GET /api/user/messages` - Get user chats
- `GET /api/user/profile` - Get user profile
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings
- `POST /api/user/verification/request` - Request profile verification
- `GET /api/chat/:id/messages` - Get chat messages

**Admin Endpoints:**
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/verify` - Verify user
- `POST /api/admin/users/:id/unverify` - Unverify user
- `GET /api/admin/matches` - Get all matches
- `POST /api/admin/matches` - Create match
- `DELETE /api/admin/matches/:id` - Delete match
- `GET /api/admin/verification-requests` - Get verification requests
- `POST /api/admin/verification-requests/:id/approve` - Approve verification
- `POST /api/admin/verification-requests/:id/reject` - Reject verification

See [REST API Documentation](../api/rest-api.md) for complete endpoint list.

### WebSocket

- `WS ws://localhost:8080/ws/chat?token={JWT_TOKEN}` - Chat WebSocket connection

See [WebSocket Protocol Documentation](../api/websocket-protocol.md) for message protocol.

## 💻 Development

### Running the Server

```bash
# Development mode
go run main.go

# With hot reload (install air first)
air

# Production build
go build -o bin/server main.go
./bin/server
```

### Code Generation

**Generate GraphQL code:**
```bash
go run github.com/99designs/gqlgen generate
```

### Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test ./... -cover

# Run specific package tests
go test ./services/chat/...
```

### Database Migrations

**Auto-migration** (runs on startup):
- GORM models are automatically migrated

**Manual SQL migrations:**
```bash
psql -U postgres -d gsl_db -f database/migrations/004_chat_matching_tables.sql
```

### Debugging

**Enable debug logging:**
```env
GIN_MODE=debug
```

**View GraphQL queries:**
- Access GraphQL Playground at `http://localhost:8080/playground`

## 📚 Additional Resources

- [Architecture Documentation](architecture.md)
- [API Documentation](../api/README.md)
- [Deployment Guide](../deployment/README.md)
- [Go Documentation](https://go.dev/doc/)
- [Gin Framework](https://gin-gonic.com/docs/)
- [gqlgen Documentation](https://gqlgen.com/)
- [GORM Documentation](https://gorm.io/docs/)
- [NATS Documentation](https://docs.nats.io/)

