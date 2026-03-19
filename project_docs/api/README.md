# API Documentation

Complete API documentation for GSL NextGo platform.

## 📋 Table of Contents

1. [GraphQL API](graphql-api.md) - Complete GraphQL API reference
2. [REST API](rest-api.md) - REST endpoints documentation
3. [WebSocket Protocol](websocket-protocol.md) - WebSocket message protocol
4. [Authentication](authentication.md) - Authentication and authorization

## 🌐 API Endpoints

### Base URLs

- **Development**: `http://localhost:8080`
- **Production**: `https://api.yourdomain.com`

### GraphQL

- **Endpoint**: `POST/GET /graphql`
- **Playground**: `GET /playground` (development only)

### REST API

- **Base Path**: `/api`
- **Authentication**: JWT Bearer token

### WebSocket

- **Endpoint**: `WS /ws/chat`
- **Protocol**: WebSocket with JWT authentication

## 🔐 Authentication

All protected endpoints require JWT authentication:

```
Authorization: Bearer <token>
```

See [Authentication Guide](authentication.md) for details.

## 📡 Quick Start

### GraphQL Example

```graphql
query GetUser {
  me {
    id
    username
    email
  }
}
```

### REST Example

```bash
# Get user dashboard
curl -X GET http://localhost:8080/api/user/dashboard \
  -H "Authorization: Bearer <token>"

# Request verification
curl -X POST http://localhost:8080/api/user/verification/request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Please verify my profile"}'
```

### WebSocket Example

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/chat?token=<token>')
ws.onmessage = (event) => {
  console.log(JSON.parse(event.data))
}
```

## 📚 Documentation Links

- **[GraphQL API Reference](graphql-api.md)** - Complete GraphQL schema and operations
- **[REST API Reference](rest-api.md)** - Complete REST API endpoints documentation
- **[WebSocket Protocol](websocket-protocol.md)** - WebSocket message format
- **[Authentication Guide](authentication.md)** - Auth implementation details

## 🔑 Key API Features

### User APIs
- Dashboard statistics
- Matches management
- Chat/messages
- Profile management
- Settings management
- Verification requests

### Admin APIs
- User management (CRUD)
- Match management
- Verification request management
- Dashboard statistics

### Real-time Features
- WebSocket for chat
- NATS JetStream for message distribution
- Typing indicators
- Presence status

