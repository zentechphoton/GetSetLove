# WebSocket Protocol Documentation

Complete WebSocket protocol documentation for real-time chat.

## 🔌 Connection

**Endpoint**: `ws://localhost:8080/ws/chat?token={JWT_TOKEN}`

**Authentication**: JWT token required in query parameter or Authorization header.

## 📨 Message Format

All messages are JSON objects:

```json
{
  "type": "message.send",
  "request_id": "uuid",
  "payload": { ... }
}
```

## 📤 Client → Server Messages

### Authentication

**Type**: `auth`

```json
{
  "type": "auth",
  "payload": {
    "token": "jwt_token"
  }
}
```

### Send Message

**Type**: `message.send`

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

### Typing Indicator Start

**Type**: `typing.start`

```json
{
  "type": "typing.start",
  "payload": {
    "chat_id": "chat-uuid"
  }
}
```

### Typing Indicator Stop

**Type**: `typing.stop`

```json
{
  "type": "typing.stop",
  "payload": {
    "chat_id": "chat-uuid"
  }
}
```

### Mark Messages as Read

**Type**: `message.read`

```json
{
  "type": "message.read",
  "payload": {
    "chat_id": "chat-uuid",
    "message_ids": ["msg-uuid-1", "msg-uuid-2"]
  }
}
```

### Subscribe to Chat

**Type**: `subscribe`

```json
{
  "type": "subscribe",
  "payload": {
    "chat_id": "chat-uuid"
  }
}
```

### Unsubscribe from Chat

**Type**: `unsubscribe`

```json
{
  "type": "unsubscribe",
  "payload": {
    "chat_id": "chat-uuid"
  }
}
```

### Ping

**Type**: `ping`

```json
{
  "type": "ping",
  "request_id": "uuid"
}
```

## 📥 Server → Client Messages

### Authentication Success

**Type**: `auth.success`

```json
{
  "type": "auth.success",
  "payload": {
    "user_id": "user-uuid",
    "message": "Authenticated successfully"
  }
}
```

### Authentication Error

**Type**: `auth.error`

```json
{
  "type": "auth.error",
  "payload": {
    "error": "Invalid token"
  }
}
```

### Message Acknowledgement

**Type**: `message.ack`

```json
{
  "type": "message.ack",
  "request_id": "uuid",
  "payload": {
    "temp_id": "temp-uuid",
    "message": {
      "id": "message-uuid",
      "chat_id": "chat-uuid",
      "content": "Hello!",
      "sender_id": "user-uuid",
      "created_at": "2025-01-21T10:00:00Z"
    }
  }
}
```

### Message Received

**Type**: `message.received`

```json
{
  "type": "message.received",
  "payload": {
    "message": {
      "id": "message-uuid",
      "chat_id": "chat-uuid",
      "sender_id": "user-uuid",
      "content": "Hello!",
      "created_at": "2025-01-21T10:00:00Z"
    }
  }
}
```

### Typing Event

**Type**: `typing.event`

```json
{
  "type": "typing.event",
  "payload": {
    "chat_id": "chat-uuid",
    "user_id": "user-uuid",
    "typing": true,
    "timestamp": "2025-01-21T10:00:00Z"
  }
}
```

### Presence Event

**Type**: `presence.event`

```json
{
  "type": "presence.event",
  "payload": {
    "user_id": "user-uuid",
    "online": true,
    "last_seen": "2025-01-21T10:00:00Z"
  }
}
```

### Match Event

**Type**: `match.new`

```json
{
  "type": "match.new",
  "payload": {
    "match": {
      "id": "match-uuid",
      "matched_user": {
        "id": "user-uuid",
        "username": "johndoe",
        "avatar": "https://..."
      },
      "match_score": 85.5,
      "matched_at": "2025-01-21T10:00:00Z"
    }
  }
}
```

### Error

**Type**: `error`

```json
{
  "type": "error",
  "payload": {
    "error": "Error message",
    "code": "ERROR_CODE"
  }
}
```

### Pong

**Type**: `pong`

```json
{
  "type": "pong",
  "request_id": "uuid"
}
```

## 🔄 Connection Lifecycle

1. **Connect** - Client connects to WebSocket endpoint
2. **Authenticate** - Client sends auth message (or token in query)
3. **Subscribe** - Client subscribes to chat rooms
4. **Send/Receive** - Client sends and receives messages
5. **Heartbeat** - Client sends ping, server responds with pong
6. **Disconnect** - Client disconnects or connection times out

## 💡 Example Usage

### JavaScript/TypeScript

```typescript
const ws = new WebSocket(`ws://localhost:8080/ws/chat?token=${token}`)

ws.onopen = () => {
  console.log('Connected')
}

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  
  switch (message.type) {
    case 'message.received':
      // Handle new message
      console.log('New message:', message.payload.message)
      break
    case 'typing.event':
      // Handle typing indicator
      console.log('User typing:', message.payload)
      break
    case 'match.new':
      // Handle new match
      console.log('New match!', message.payload.match)
      break
  }
}

// Send message
ws.send(JSON.stringify({
  type: 'message.send',
  request_id: generateUUID(),
  payload: {
    chat_id: 'chat-uuid',
    content: 'Hello!',
    temp_id: generateUUID()
  }
}))
```

## ⚠️ Error Handling

- Connection errors should be handled gracefully
- Implement reconnection logic with exponential backoff
- Handle authentication errors by redirecting to login
- Validate message format before sending

## 🔒 Security

- Always use WSS (WebSocket Secure) in production
- Validate JWT tokens on connection
- Rate limit message sending
- Sanitize message content





