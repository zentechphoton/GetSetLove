# User Settings System

Complete documentation for the User Settings System in GSL NextGo.

## Overview

The User Settings System provides comprehensive user preference management, including profile visibility, discovery preferences, notification settings, privacy controls, and account settings.

## Features

### Profile Visibility
- Show/hide age
- Show/hide location
- Show/hide distance
- Show/hide online status

### Discovery Preferences
- Age range (min/max)
- Maximum distance (km)
- Show me to (everyone, matches, premium)
- Discoverable toggle

### Notification Preferences
- Email notifications
- Push notifications
- New match notifications
- Message notifications
- Like notifications

### Privacy Settings
- Read receipts
- Show last seen
- Blocked users list

### Account Settings
- Language selection
- Timezone selection

## Database Model

### UserSettings

```go
type UserSettings struct {
    ID                      string    `json:"id"`
    UserID                  string    `json:"user_id"`
    User                    User      `json:"-"`
    
    // Profile Visibility
    ShowAge                 bool      `json:"show_age" gorm:"default:true"`
    ShowLocation            bool      `json:"show_location" gorm:"default:true"`
    ShowDistance            bool      `json:"show_distance" gorm:"default:true"`
    ShowOnlineStatus        bool      `json:"show_online_status" gorm:"default:true"`
    
    // Discovery Preferences
    MinAge                  int       `json:"min_age" gorm:"default:18"`
    MaxAge                  int       `json:"max_age" gorm:"default:99"`
    MaxDistance             int       `json:"max_distance" gorm:"default:50"`
    ShowMeTo                string    `json:"show_me_to" gorm:"type:varchar(20);default:'everyone'"`
    Discoverable            bool      `json:"discoverable" gorm:"default:true"`
    
    // Notification Preferences
    EmailNotifications      bool      `json:"email_notifications" gorm:"default:true"`
    PushNotifications       bool      `json:"push_notifications" gorm:"default:true"`
    NewMatchNotifications   bool      `json:"new_match_notifications" gorm:"default:true"`
    MessageNotifications   bool      `json:"message_notifications" gorm:"default:true"`
    LikeNotifications       bool      `json:"like_notifications" gorm:"default:true"`
    
    // Privacy Settings
    ReadReceipts            bool      `json:"read_receipts" gorm:"default:true"`
    ShowLastSeen            bool      `json:"show_last_seen" gorm:"default:true"`
    BlockedUsers            string    `json:"blocked_users" gorm:"type:text"`
    
    // Account Settings
    Language                string    `json:"language" gorm:"type:varchar(10);default:'en'"`
    Timezone                string    `json:"timezone" gorm:"type:varchar(50);default:'UTC'"`
    
    CreatedAt               time.Time `json:"created_at"`
    UpdatedAt               time.Time `json:"updated_at"`
    DeletedAt               gorm.DeletedAt `json:"-" gorm:"index"`
}
```

## API Endpoints

### Get User Settings
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
  "timezone": "UTC",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Behavior:**
- If settings don't exist, creates default settings automatically
- Returns default values for all fields

### Update User Settings
```http
PUT /api/user/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "show_age": false,
  "min_age": 25,
  "max_age": 35,
  "email_notifications": false,
  "language": "es"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "show_age": false,
  "min_age": 25,
  "max_age": 35,
  "email_notifications": false,
  "language": "es",
  ...
}
```

**Behavior:**
- Only updates fields provided in request
- Uses `FirstOrCreate` to ensure settings exist
- Validates field values
- Returns updated settings

## Frontend Implementation

### Settings Page

**Location:** `Frontend/app/settings/page.tsx`

**Features:**
- Tabbed interface with 5 sections:
  1. **Profile Visibility** - Toggle visibility options
  2. **Discovery** - Age range, distance, discoverability
  3. **Notifications** - All notification preferences
  4. **Privacy** - Read receipts, last seen, blocked users
  5. **Account** - Language, timezone

**UI Components:**
- Toggle switches for boolean settings
- Number inputs for age range and distance
- Select dropdowns for language and timezone
- Text area for blocked users
- Save button with loading state
- Success/error toast notifications

**State Management:**
- Local state for form data
- API calls for fetch and update
- Optimistic updates
- Error handling

## Backend Implementation

### Models

**File:** `Backend/models/user_settings.go`

The model includes all preference fields with appropriate defaults.

### Handlers

**User Handler** (`Backend/handlers/user.go`):
- `GetUserSettings` - Get or create user settings
- `UpdateUserSettings` - Update user settings

**Implementation Details:**
- `GetUserSettings` uses `FirstOrCreate` to ensure settings exist
- `UpdateUserSettings` only updates provided fields
- Validates field values (e.g., min_age < max_age)
- Returns complete settings object

### Routes

```go
user.GET("/settings", handlers.GetUserSettings)
user.PUT("/settings", handlers.UpdateUserSettings)
```

## Default Values

All settings have sensible defaults:

- **Profile Visibility:** All enabled (true)
- **Discovery:**
  - Min Age: 18
  - Max Age: 99
  - Max Distance: 50 km
  - Show Me To: "everyone"
  - Discoverable: true
- **Notifications:** All enabled (true)
- **Privacy:**
  - Read Receipts: true
  - Show Last Seen: true
  - Blocked Users: empty string
- **Account:**
  - Language: "en"
  - Timezone: "UTC"

## Settings Categories

### Profile Visibility
Controls what information is visible to other users:
- **Show Age:** Display user's age on profile
- **Show Location:** Display user's location
- **Show Distance:** Display distance from other users
- **Show Online Status:** Display online/offline status

### Discovery Preferences
Controls who can discover the user and matching preferences:
- **Age Range:** Minimum and maximum age for matches
- **Max Distance:** Maximum distance for matches (in km)
- **Show Me To:** Visibility level (everyone, matches only, premium only)
- **Discoverable:** Whether user appears in discovery

### Notification Preferences
Controls which notifications the user receives:
- **Email Notifications:** Receive email notifications
- **Push Notifications:** Receive push notifications
- **New Match Notifications:** Notify on new matches
- **Message Notifications:** Notify on new messages
- **Like Notifications:** Notify on likes

### Privacy Settings
Controls privacy and interaction settings:
- **Read Receipts:** Show read receipts for messages
- **Show Last Seen:** Display last seen timestamp
- **Blocked Users:** JSON array of blocked user IDs

### Account Settings
General account preferences:
- **Language:** User interface language (en, es, fr, etc.)
- **Timezone:** User's timezone (UTC, America/New_York, etc.)

## Integration Points

### Matching System
- Uses `min_age`, `max_age`, `max_distance` for match suggestions
- Uses `discoverable` to filter users in discovery

### Chat System
- Uses `read_receipts` to control read receipt display
- Uses `show_last_seen` to control last seen display
- Uses `message_notifications` for notification preferences

### Profile Display
- Uses profile visibility settings to show/hide information
- Respects `show_me_to` for profile visibility

## Future Enhancements

Potential improvements:
- Advanced privacy controls
- Notification scheduling
- Custom notification sounds
- Multiple language support
- Timezone auto-detection
- Settings import/export
- Settings templates/presets

