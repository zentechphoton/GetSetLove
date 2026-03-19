# System Architecture

Complete architecture documentation for GSL NextGo platform.

## 📋 Overview

GSL NextGo is a modern dating platform built with a microservices architecture, featuring real-time chat, intelligent matching, and content management.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│              (React + TypeScript + Apollo)                    │
└────────────┬──────────────────────┬──────────────────────────┘
             │                      │
      GraphQL/HTTP              WebSocket (WSS)
             │                      │
             ↓                      ↓
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Go + Gin)                         │
│  - Authentication & Authorization                            │
│  - Rate Limiting                                             │
│  - WebSocket Upgrade Handler                                 │
│  - GraphQL Endpoint                                          │
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

## 🔧 Technology Stack

### Backend
- **Go 1.24+** - High-performance microservices
- **Gin** - HTTP web framework
- **gqlgen** - GraphQL server
- **GORM** - ORM for database
- **NATS JetStream** - Message streaming
- **WebSocket** - Real-time communication
- **PostgreSQL** - Primary database

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client
- **Tailwind CSS** - Styling
- **Zustand** - State management

### Infrastructure
- **PostgreSQL** - Data persistence
- **NATS** - Message broker
- **Cloudinary** - Image storage
- **Nginx** - Reverse proxy (production)

## 📡 Communication Patterns

### GraphQL API
- Primary API for queries and mutations
- Real-time subscriptions for events
- Schema-first approach with gqlgen

### REST API
- Legacy endpoints for backward compatibility
- Authentication endpoints
- File upload endpoints

### WebSocket
- Real-time chat messaging
- Typing indicators
- Presence updates
- Match notifications

### NATS JetStream
- Event streaming
- Message persistence
- Pub/sub for microservices
- Event sourcing for chat

## 🗄️ Database Architecture

### Core Tables
- **users** - User accounts
- **chats** - Chat conversations
- **messages** - Chat messages
- **matches** - Mutual matches
- **likes** - Like actions
- **user_preferences** - Matching preferences
- **blogs** - Blog posts
- **news** - News articles

See [Database Schema](database-schema.md) for detailed schema.

## 🔄 Data Flow

### Chat Message Flow

```
1. User sends message via WebSocket
   ↓
2. API Gateway validates JWT
   ↓
3. Chat Service receives message
   ↓
4. Validate user is participant
   ↓
5. Persist to PostgreSQL
   ↓
6. Publish to NATS: chat.message.{chatID}.sent
   ↓
7. NATS Bridge receives event
   ↓
8. Broadcast to WebSocket connections
   ↓
9. Recipients receive message in real-time
```

### Matching Flow

```
1. User likes another user
   ↓
2. Matching Service processes like
   ↓
3. Check for mutual like
   ↓
4. If mutual:
   - Create Match record
   - Create DM Chat
   - Publish match.new events
   ↓
5. Users receive match notification
```

## 🔐 Security Architecture

### Authentication
- JWT-based authentication
- Token expiration (24 hours)
- Refresh token support (future)

### Authorization
- Role-based access control (RBAC)
- GraphQL field-level permissions
- Route-level protection

### Data Protection
- Password hashing (bcrypt)
- SQL injection prevention (GORM)
- XSS prevention
- CORS configuration

## 📊 Scalability

### Horizontal Scaling
- Stateless API servers
- NATS cluster for message distribution
- PostgreSQL read replicas
- Load balancer for API servers

### Performance Optimization
- Database indexing
- Query optimization
- Connection pooling
- Caching (future: Redis)

## 🔍 Monitoring & Observability

### Logging
- Structured logging (JSON)
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized logging (ELK/Loki)

### Metrics
- Request latency
- Error rates
- Database query performance
- NATS message throughput
- WebSocket connection count

### Tracing
- Request correlation IDs
- Distributed tracing (future)

## 📚 Additional Documentation

- [Backend Architecture](../backend/architecture.md)
- [Frontend Architecture](../frontend/architecture.md)
- [Database Schema](database-schema.md)
- [API Documentation](../api/README.md)





