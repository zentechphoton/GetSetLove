# REST API Documentation

Complete REST API reference for GSL NextGo platform.

## Base URL

- **Development**: `http://localhost:8080/api`
- **Production**: `https://api.yourdomain.com/api`

## Authentication

All protected endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <token>
```

## Public Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string (optional)",
  "last_name": "string (optional)"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "user|admin|super_admin"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## Protected User Endpoints

### Dashboard

#### Get User Dashboard
```http
GET /api/user/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_matches": 5,
  "unread_messages": 3,
  "recent_matches": [
    {
      "id": "uuid",
      "matched_user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "avatar": "string"
      },
      "status": "active",
      "matched_at": "timestamp"
    }
  ]
}
```

### Matches

#### Get User Matches
```http
GET /api/user/matches
Authorization: Bearer <token>
```

**Response:**
```json
{
  "matches": [
    {
      "id": "uuid",
      "matched_user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "avatar": "string"
      },
      "status": "active",
      "matched_at": "timestamp",
      "chat_id": "uuid"
    }
  ],
  "total": 5
}
```

### Messages

#### Get User Chats
```http
GET /api/user/messages
Authorization: Bearer <token>
```

**Response:**
```json
{
  "chats": [
    {
      "id": "uuid",
      "type": "dm",
      "participants": [
        {
          "user_id": "uuid",
          "user": {
            "id": "uuid",
            "username": "string"
          }
        }
      ],
      "last_message": {
        "id": "uuid",
        "content": "string",
        "sender": {
          "id": "uuid",
          "username": "string"
        },
        "created_at": "timestamp"
      }
    }
  ]
}
```

#### Get Chat Messages
```http
GET /api/chat/:id/messages
Authorization: Bearer <token>
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "content": "string",
      "sender_id": "uuid",
      "sender": {
        "id": "uuid",
        "username": "string"
      },
      "created_at": "timestamp"
    }
  ]
}
```

### Profile

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

### Settings

#### Get User Settings
```http
GET /api/user/settings
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "show_age": true,
  "show_location": true,
  "show_distance": true,
  "show_online_status": true,
  "min_age": 18,
  "max_age": 99,
  "max_distance": 50,
  "show_me_to": "everyone",
  "discoverable": true,
  "email_notifications": true,
  "push_notifications": true,
  "new_match_notifications": true,
  "message_notifications": true,
  "like_notifications": true,
  "read_receipts": true,
  "show_last_seen": true,
  "blocked_users": "",
  "language": "en",
  "timezone": "UTC"
}
```

#### Update User Settings
```http
PUT /api/user/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "show_age": true,
  "min_age": 18,
  "max_age": 35,
  "email_notifications": false,
  ...
}
```

### Verification

#### Request Profile Verification
```http
POST /api/user/verification/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "document_url": "string (optional)",
  "message": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Verification request submitted successfully. Our team will review your request.",
  "status": "pending",
  "request_id": "uuid"
}
```

## Admin Endpoints

### Dashboard

#### Get Admin Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_users": 100,
  "total_matches": 50,
  "verified_users": 30,
  "premium_users": 10
}
```

### Users

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10&search=query
Authorization: Bearer <token>
```

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "role": "user|admin|super_admin",
      "is_verified": true,
      "is_premium": false,
      "created_at": "timestamp"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### Get User by ID
```http
GET /api/admin/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string (optional)",
  "email": "string (optional)",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "role": "user|admin|super_admin (optional)",
  "is_verified": true (optional),
  "is_premium": false (optional)
}
```

#### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

#### Verify User
```http
POST /api/admin/users/:id/verify
Authorization: Bearer <token>
```

#### Unverify User
```http
POST /api/admin/users/:id/unverify
Authorization: Bearer <token>
```

### Matches

#### Get All Matches
```http
GET /api/admin/matches?page=1&limit=10
Authorization: Bearer <token>
```

#### Create Match
```http
POST /api/admin/matches
Authorization: Bearer <token>
Content-Type: application/json

{
  "user1_id": "uuid",
  "user2_id": "uuid",
  "status": "active (optional)"
}
```

**Response:**
```json
{
  "message": "Match created successfully",
  "match": {
    "id": "uuid",
    "user1_id": "uuid",
    "user2_id": "uuid",
    "status": "active",
    "chat_id": "uuid"
  }
}
```

#### Delete Match
```http
DELETE /api/admin/matches/:id
Authorization: Bearer <token>
```

### Verification Requests

#### Get Verification Requests
```http
GET /api/admin/verification-requests?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: `pending|approved|rejected|all` (default: `all`)
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `20`)

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "avatar": "string",
        "is_verified": false
      },
      "document_url": "string",
      "message": "string",
      "status": "pending|approved|rejected",
      "reviewed_by": "uuid|null",
      "reviewed_at": "timestamp|null",
      "rejection_reason": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

#### Approve Verification Request
```http
POST /api/admin/verification-requests/:id/approve
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Verification request approved successfully",
  "request": {
    "id": "uuid",
    "status": "approved",
    "user": {
      "id": "uuid",
      "username": "string",
      "is_verified": true
    }
  }
}
```

#### Reject Verification Request
```http
POST /api/admin/verification-requests/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "string (required)"
}
```

**Response:**
```json
{
  "message": "Verification request rejected successfully",
  "request": {
    "id": "uuid",
    "status": "rejected",
    "rejection_reason": "string"
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

Rate limiting may be applied to prevent abuse. Check response headers for rate limit information.

## Pagination

Endpoints that support pagination use query parameters:
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `10` or `20`)

Response includes:
- `total`: Total number of items
- `page`: Current page number
- `limit`: Items per page

