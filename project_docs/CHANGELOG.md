# Changelog

Complete changelog of all features and updates in GSL NextGo platform.

## [2025-11-22] - Major Feature Updates

### ✨ New Features

#### Profile Verification System
- ✅ User verification request submission
- ✅ Document upload for verification (image files up to 5MB)
- ✅ Admin verification management dashboard
- ✅ Approve/reject verification requests
- ✅ Automatic user verification on approval
- ✅ Verification status tracking (verified, pending, not verified)
- ✅ Verification badge display on profiles
- ✅ Rejection reason tracking
- ✅ Statistics dashboard for admins
- ✅ Search and filter verification requests

**Backend:**
- New `VerificationRequest` model (`Backend/models/verification_request.go`)
- `RequestVerification` handler in `Backend/handlers/user.go`
- `GetVerificationRequests`, `ApproveVerificationRequest`, `RejectVerificationRequest` handlers in `Backend/handlers/admin.go`
- Routes: `POST /api/user/verification/request`, `GET /api/admin/verification-requests`, `POST /api/admin/verification-requests/:id/approve`, `POST /api/admin/verification-requests/:id/reject`

**Frontend:**
- Verification tab in user profile page (`Frontend/app/profile/page.tsx`)
- Admin verifications page (`Frontend/app/admin/verifications/page.tsx`)
- Verification status cards and UI components
- Document upload interface
- Admin verification management interface

#### User Settings System
- ✅ Comprehensive settings page with tabbed interface
- ✅ Profile visibility controls (age, location, distance, online status)
- ✅ Discovery preferences (age range, distance, discoverability)
- ✅ Notification preferences (email, push, match, message, like)
- ✅ Privacy settings (read receipts, last seen, blocked users)
- ✅ Account settings (language, timezone)
- ✅ Settings persistence via API
- ✅ Default settings creation

**Backend:**
- New `UserSettings` model (`Backend/models/user_settings.go`)
- `GetUserSettings` and `UpdateUserSettings` handlers in `Backend/handlers/user.go`
- Routes: `GET /api/user/settings`, `PUT /api/user/settings`

**Frontend:**
- Settings page (`Frontend/app/settings/page.tsx`)
- Tabbed interface with 5 sections
- Form controls for all settings
- Settings API integration

#### Matches Page
- ✅ User matches page with responsive grid layout
- ✅ Search by name, username, or email
- ✅ Filter by match status
- ✅ Match cards with user info and status badges
- ✅ View profile and chat actions
- ✅ Responsive design (1-4 columns based on screen size)
- ✅ Empty states and loading states

**Backend:**
- `GetMatches` handler in `Backend/handlers/user.go`
- Route: `GET /api/user/matches`

**Frontend:**
- Matches page (`Frontend/app/matches/page.tsx`)
- Match card components
- Search and filter functionality
- Responsive grid layout

#### Admin Match Management
- ✅ Admin match creation and management
- ✅ Create match between two users
- ✅ Automatic DM chat creation on match
- ✅ Match list with user information
- ✅ Delete matches
- ✅ Responsive create match modal

**Backend:**
- `CreateMatch`, `GetAdminMatches`, `DeleteMatch` handlers in `Backend/handlers/admin.go`
- Routes: `GET /api/admin/matches`, `POST /api/admin/matches`, `DELETE /api/admin/matches/:id`

**Frontend:**
- Admin matches page (`Frontend/app/admin/matches/page.tsx`)
- Create match modal with user search
- Match list and management interface

### 🔧 Improvements

#### User Dashboard
- ✅ Real-time statistics integration
- ✅ Total matches count from API
- ✅ Unread messages count from API
- ✅ Recent matches display
- ✅ Profile completion card linking to profile page
- ✅ Messages card linking to chat page
- ✅ Fixed authentication hydration issues

**Backend:**
- Updated `UserDashboard` handler to return real data
- Manual user loading for matches to handle UUID type mismatches
- Fallback queries for matches without status filter

**Frontend:**
- Updated dashboard to fetch real data from API
- Fixed navigation links
- Improved loading states

#### Chat System
- ✅ Switched from GraphQL to REST API for chat fetching
- ✅ Improved chat loading with polling
- ✅ Fixed message sender/receiver alignment
- ✅ Theme application improvements
- ✅ Mobile responsiveness improvements
- ✅ Auto-scroll to latest messages
- ✅ Fixed `refetch` errors in MainChatWindow

**Backend:**
- `GetMessages` handler for user chats
- `GetChatMessages` handler for specific chat messages
- Improved chat repository queries
- Fixed participant loading issues

**Frontend:**
- REST API integration for chats
- Polling for auto-refresh
- Improved theme application
- Mobile optimizations

#### Admin Sidebar
- ✅ Added "Verifications" link
- ✅ Removed "Analytics", "Moderation", "Reports", "Logs", "Notifications"
- ✅ Added "Matches" link

#### User Sidebar
- ✅ Removed "Discover", "Blogs", "Photos", "Groups"
- ✅ Reordered items with Chat and Settings at bottom
- ✅ Increased spacing between Chat and Settings
- ✅ Added "Matches" link

#### Chat Sidebar
- ✅ Replaced footer navigation items with icons (User, Group, Hashtag, Ellipsis)
- ✅ Removed duplicate "G" logo
- ✅ Improved theme application
- ✅ Mobile responsiveness

#### Create Match Modal
- ✅ Made fully responsive for mobile devices
- ✅ Improved touch targets
- ✅ Better spacing and padding
- ✅ Responsive text sizes
- ✅ Stack buttons vertically on mobile
- ✅ Improved file upload interface

### 🐛 Bug Fixes

#### Authentication
- ✅ Fixed profile page redirecting to login before auth hydration
- ✅ Added `_hasHydrated` check to prevent premature redirects
- ✅ Fixed auth state hydration timing

#### Verification System
- ✅ Fixed UUID field issue (`ReviewedBy` now uses pointer type)
- ✅ Fixed empty string being inserted into UUID field
- ✅ Proper NULL handling for optional UUID fields

#### Dashboard
- ✅ Fixed "0 matches" issue despite existing matches
- ✅ Fixed UUID type mismatches in queries
- ✅ Fixed status filter excluding valid matches
- ✅ Fixed user loading for matches

#### Chat
- ✅ Fixed "No chats yet" issue
- ✅ Fixed chat loading from match chat_ids
- ✅ Fixed participant count checks
- ✅ Fixed message alignment (sender/receiver)
- ✅ Fixed theme application issues

### 📝 Documentation Updates

- ✅ Updated main README.md with all new features
- ✅ Updated backend documentation with new models and handlers
- ✅ Updated frontend documentation with new pages and components
- ✅ Created REST API documentation (`project_docs/api/rest-api.md`)
- ✅ Created Profile Verification System documentation (`project_docs/features/verification-system.md`)
- ✅ Created User Settings documentation (`project_docs/features/user-settings.md`)
- ✅ Updated documentation index with new features
- ✅ Updated API documentation with all new endpoints

### 🗄️ Database Changes

#### New Tables
- `user_settings` - User preferences and settings
- `verification_requests` - Profile verification requests

#### Updated Models
- `User` - Already had `is_verified` and `is_premium` flags

### 🔄 API Changes

#### New Endpoints

**User Endpoints:**
- `GET /api/user/dashboard` - Get dashboard data
- `GET /api/user/matches` - Get user matches
- `GET /api/user/messages` - Get user chats
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings
- `POST /api/user/verification/request` - Request verification
- `GET /api/chat/:id/messages` - Get chat messages

**Admin Endpoints:**
- `GET /api/admin/matches` - Get all matches
- `POST /api/admin/matches` - Create match
- `DELETE /api/admin/matches/:id` - Delete match
- `POST /api/admin/users/:id/verify` - Verify user
- `POST /api/admin/users/:id/unverify` - Unverify user
- `GET /api/admin/verification-requests` - Get verification requests
- `POST /api/admin/verification-requests/:id/approve` - Approve verification
- `POST /api/admin/verification-requests/:id/reject` - Reject verification

### 🎨 UI/UX Improvements

- ✅ Responsive design across all pages
- ✅ Mobile-optimized interfaces
- ✅ Improved loading states
- ✅ Better error handling and messages
- ✅ Toast notifications for user feedback
- ✅ Smooth animations with Framer Motion
- ✅ Consistent theme application
- ✅ Accessible components

### 📱 Responsive Design

All new and updated pages are fully responsive:
- Mobile (1 column layouts)
- Tablet (2 column layouts)
- Desktop (3-4 column layouts)
- Touch-friendly buttons and interactions
- Proper text truncation
- Optimized spacing and padding

---

## Previous Updates

### [2025-01-21] - Initial Release
- Core chat system
- Matching system
- Blog and news systems
- Authentication and authorization
- Admin dashboard
- User dashboard

---

**Note:** This changelog is maintained alongside code changes. All features are documented in detail in the respective documentation files.

