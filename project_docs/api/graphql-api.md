# GraphQL API Reference

Complete GraphQL API documentation for GSL NextGo.

## 📋 Endpoint

- **URL**: `POST/GET http://localhost:8080/graphql`
- **Playground**: `GET http://localhost:8080/playground` (development)

## 🔐 Authentication

Include JWT token in headers:
```
Authorization: Bearer <token>
```

## 📚 Schema Overview

### Types

- **User** - User account information
- **Chat** - Chat conversation
- **Message** - Chat message
- **Match** - Mutual match
- **MatchSuggestion** - Match suggestion
- **UserPreferences** - User matching preferences

### Queries

- `me` - Get current user
- `chat(id: ID!)` - Get chat by ID
- `myChats(limit: Int, offset: Int)` - Get user's chats
- `chatMessages(chatID: ID!, limit: Int, before: ID)` - Get chat messages
- `myMatches(limit: Int, status: String)` - Get user's matches
- `matchSuggestions(limit: Int)` - Get match suggestions
- `matchStatistics` - Get match statistics

### Mutations

- `register(input: RegisterInput!)` - Register new user
- `login(input: LoginInput!)` - Login user
- `logout` - Logout user
- `createDMChat(participantID: ID!)` - Create DM chat
- `likeUser(userID: ID!, type: LikeType)` - Like a user
- `unmatch(matchID: ID!)` - Unmatch
- `markMessagesRead(chatID: ID!, messageIDs: [ID!]!)` - Mark messages as read

### Subscriptions

- `newMatch` - Subscribe to new matches
- `chatTyping(chatID: ID!)` - Subscribe to typing indicators
- `userPresence(userID: ID!)` - Subscribe to presence updates

## 🔍 Example Queries

### Get Current User

```graphql
query Me {
  me {
    id
    username
    email
    role
    is_verified
    is_premium
  }
}
```

### Get User's Chats

```graphql
query MyChats {
  myChats(limit: 20) {
    id
    type
    lastMessage {
      id
      content
      createdAt
    }
    participants {
      user {
        id
        username
        avatar
      }
    }
  }
}
```

### Get Chat Messages

```graphql
query ChatMessages($chatID: ID!) {
  chatMessages(chatID: $chatID, limit: 50) {
    id
    content
    sender {
      username
      avatar
    }
    createdAt
    status
  }
}
```

### Get Match Suggestions

```graphql
query MatchSuggestions {
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

## ✏️ Example Mutations

### Register

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      username
      email
    }
  }
}
```

Variables:
```json
{
  "input": {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Login

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      username
      email
    }
  }
}
```

### Like User

```graphql
mutation LikeUser($userID: ID!) {
  likeUser(userID: $userID, type: LIKE) {
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

### Create DM Chat

```graphql
mutation CreateDMChat($participantID: ID!) {
  createDMChat(participantID: $participantID) {
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

## 📡 Example Subscriptions

### New Match

```graphql
subscription NewMatch {
  newMatch {
    id
    matchedUser {
      username
      avatar
    }
    matchScore
    matchedAt
  }
}
```

### Chat Typing

```graphql
subscription ChatTyping($chatID: ID!) {
  chatTyping(chatID: $chatID) {
    userID
    typing
    timestamp
  }
}
```

## 📖 Complete Schema

See `Backend/graph/schema/schema.graphqls` for the complete GraphQL schema definition.





