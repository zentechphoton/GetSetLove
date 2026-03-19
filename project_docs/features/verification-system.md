# Profile Verification System

Complete documentation for the Profile Verification System in GSL NextGo.

## Overview

The Profile Verification System allows users to request profile verification by submitting verification documents. Admins can review and approve/reject these requests, automatically verifying user profiles upon approval.

## Features

### User Features
- Submit verification requests with document upload
- View verification status (verified, pending, not verified)
- Upload verification documents (images up to 5MB)
- Optional message with verification request
- Prevention of duplicate pending requests
- Verification badge display on profile

### Admin Features
- View all verification requests
- Filter by status (pending, approved, rejected, all)
- Search requests by username, email, or name
- View detailed request information
- Approve verification requests (auto-verifies user)
- Reject verification requests with reason
- Statistics dashboard (total, pending, approved, rejected)
- Pagination support

## Database Model

### VerificationRequest

```go
type VerificationRequest struct {
    ID              string     `json:"id"`
    UserID          string     `json:"user_id"`
    User            User       `json:"user"`
    DocumentURL     string     `json:"document_url"`
    Message         string     `json:"message"`
    Status          string     `json:"status"` // pending, approved, rejected
    ReviewedBy      *string    `json:"reviewed_by"` // Admin user ID
    ReviewedAt      *time.Time `json:"reviewed_at"`
    RejectionReason string     `json:"rejection_reason"`
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`
}
```

## API Endpoints

### User Endpoints

#### Request Verification
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

**Error Responses:**
- `409 Conflict` - Already has a pending request
- `400 Bad Request` - Invalid request data
- `404 Not Found` - User not found

### Admin Endpoints

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
      "status": "pending",
      "reviewed_by": null,
      "reviewed_at": null,
      "rejection_reason": "",
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

**Actions:**
- Updates request status to `approved`
- Sets `reviewed_by` to admin user ID
- Sets `reviewed_at` to current timestamp
- **Automatically sets user's `is_verified` to `true`**

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

**Actions:**
- Updates request status to `rejected`
- Sets `reviewed_by` to admin user ID
- Sets `reviewed_at` to current timestamp
- Sets `rejection_reason` to provided reason

## Frontend Implementation

### User Profile Page - Verification Tab

**Location:** `Frontend/app/profile/page.tsx`

**Features:**
- Status cards (Verified, Pending, Not Verified)
- Document upload (drag & drop or click)
- File validation (image types, max 5MB)
- Optional message field
- Benefits section
- Request verification button

**Status Display:**
- **Verified:** Blue gradient card with checkmark icon
- **Pending:** Yellow gradient card with clock icon
- **Not Verified:** Gray card with exclamation icon

### Admin Verifications Page

**Location:** `Frontend/app/admin/verifications/page.tsx`

**Features:**
- Statistics cards (Total, Pending, Approved, Rejected)
- Search by username, email, or name
- Status filter dropdown
- Request list with user info
- Detail modal with full request information
- Approve/reject actions
- Reject modal with reason input
- Pagination

**UI Components:**
- Status badges with icons
- User avatars
- Document links
- Action buttons (Approve, Reject, View Details)
- Responsive design

## Backend Implementation

### Models

**File:** `Backend/models/verification_request.go`

```go
type VerificationRequest struct {
    ID              string     `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
    UserID          string     `json:"user_id" gorm:"type:uuid;not null;index"`
    User            User       `json:"user" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
    DocumentURL     string     `json:"document_url" gorm:"type:text"`
    Message         string     `json:"message" gorm:"type:text"`
    Status          string     `json:"status" gorm:"type:varchar(20);default:'pending'"`
    ReviewedBy      *string    `json:"reviewed_by" gorm:"type:uuid;index"`
    ReviewedAt      *time.Time `json:"reviewed_at"`
    RejectionReason string     `json:"rejection_reason" gorm:"type:text"`
    CreatedAt       time.Time  `json:"created_at"`
    UpdatedAt       time.Time  `json:"updated_at"`
    DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}
```

### Handlers

**User Handler** (`Backend/handlers/user.go`):
- `RequestVerification` - Create verification request

**Admin Handler** (`Backend/handlers/admin.go`):
- `GetVerificationRequests` - Get all verification requests with filters
- `ApproveVerificationRequest` - Approve request and verify user
- `RejectVerificationRequest` - Reject request with reason

### Routes

**User Routes:**
```go
user.POST("/verification/request", handlers.RequestVerification)
```

**Admin Routes:**
```go
admin.GET("/verification-requests", handlers.GetVerificationRequests)
admin.POST("/verification-requests/:id/approve", handlers.ApproveVerificationRequest)
admin.POST("/verification-requests/:id/reject", handlers.RejectVerificationRequest)
```

## Workflow

### User Workflow

1. User navigates to Profile page → Verification tab
2. User uploads verification document (optional)
3. User adds optional message
4. User clicks "Request Verification"
5. System creates verification request with status `pending`
6. User sees "Verification Under Review" status
7. User waits for admin review

### Admin Workflow

1. Admin navigates to Admin → Verifications
2. Admin sees list of verification requests
3. Admin can filter by status or search by user
4. Admin clicks "View Details" to see full request
5. Admin reviews document and message
6. Admin either:
   - **Approves:** User is automatically verified
   - **Rejects:** Provides rejection reason
7. Request status is updated
8. User's verification status is updated (if approved)

## Status Flow

```
Not Verified → [User Submits Request] → Pending → [Admin Approves] → Verified
                                                      ↓
                                              [Admin Rejects] → Rejected
```

## Database Migration

The `VerificationRequest` model is automatically migrated on server startup via GORM AutoMigrate.

**Table:** `verification_requests`

**Indexes:**
- `user_id` (index)
- `reviewed_by` (index)
- `deleted_at` (index for soft deletes)

## Security Considerations

1. **Authentication:** All endpoints require JWT authentication
2. **Authorization:** Admin endpoints require admin role
3. **File Validation:** Frontend validates file type and size
4. **Duplicate Prevention:** System prevents multiple pending requests per user
5. **Audit Trail:** All reviews are tracked with admin ID and timestamp

## Error Handling

### Common Errors

**409 Conflict:**
- User already has a pending verification request

**400 Bad Request:**
- Invalid request data
- Missing required fields (for reject)

**404 Not Found:**
- Verification request not found
- User not found

**403 Forbidden:**
- Non-admin trying to access admin endpoints

**500 Internal Server Error:**
- Database errors
- Server errors

## Future Enhancements

Potential improvements:
- Email notifications on status change
- Document storage integration (S3, Cloudinary)
- Verification request history
- Bulk approval/rejection
- Automated verification (AI/ML)
- Verification levels (basic, premium, etc.)

