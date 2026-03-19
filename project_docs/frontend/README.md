# Frontend Documentation

Complete documentation for the GSL NextGo frontend application.

## 📋 Table of Contents

1. [Architecture Overview](architecture.md)
2. [Setup & Installation](#setup--installation)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [Key Features](#key-features)
6. [Development](#development)
7. [Components](#components)
8. [State Management](#state-management)

## 🏗️ Architecture Overview

The frontend is built using:

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Apollo Client** for GraphQL
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Hook Form** for form handling

See [Architecture Documentation](architecture.md) for detailed information.

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
Frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── providers.tsx          # Apollo & theme providers
│   ├── page.tsx               # Home page
│   ├── globals.css            # Global styles
│   │
│   ├── auth/                  # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── dashboard/             # Dashboard pages
│   │   └── page.tsx          # User dashboard with stats and matches
│   │
│   ├── chat/                 # Chat pages
│   │   └── page.tsx          # Real-time chat interface
│   │
│   ├── matches/              # Matches page
│   │   └── page.tsx          # User matches with search and filters
│   │
│   ├── profile/              # Profile page
│   │   └── page.tsx          # User profile with verification tab
│   │
│   ├── settings/             # Settings page
│   │   └── page.tsx         # User settings (visibility, discovery, notifications, privacy)
│   │
│   ├── admin/                # Admin pages
│   │   ├── dashboard/        # Admin dashboard
│   │   ├── users/            # User management
│   │   ├── matches/          # Match management
│   │   ├── verifications/    # Verification request management
│   │   ├── blogs/            # Blog management
│   │   ├── news/             # News management
│   │   └── profile/          # Admin profile
│   │
│   ├── user/                 # User pages
│   │   └── blogs/            # User blog management
│   │
│   ├── resources/            # Public content
│   │   ├── blog/            # Public blog viewing
│   │   └── news/            # Public news viewing
│   │
│   └── ...                   # Other pages (auth, legal, etc.)
│
├── components/               # React components
│   ├── Auth/
│   │   └── ProtectedRoute.tsx
│   ├── Blog/
│   │   └── ImageUpload.tsx
│   ├── Chat/                 # Chat components
│   │   ├── ChatSidebar.tsx   # Chat list sidebar
│   │   ├── MainChatWindow.tsx # Main chat interface
│   │   ├── ChatMessage.tsx   # Individual message component
│   │   ├── ChatMessageInput.tsx # Message input component
│   │   ├── NavigationRail.tsx # Left navigation rail
│   │   └── ...               # Other chat components
│   ├── Layout/
│   │   ├── Navbar.tsx        # Main navigation bar
│   │   ├── Footer.tsx         # Site footer
│   │   ├── AdminSidebar.tsx  # Admin navigation sidebar
│   │   ├── UserSidebar.tsx   # User navigation sidebar
│   │   ├── LayoutWrapper.tsx # Main layout wrapper
│   │   └── SidebarContext.tsx # Sidebar state management
│   ├── Home/
│   │   └── HeroSection.tsx
│   └── UI/
│       └── Button.tsx
│
├── lib/                      # Libraries and utilities
│   ├── apollo-client.ts      # Apollo Client setup
│   ├── auth-apollo.ts        # Auth hooks
│   ├── auth.ts              # Auth utilities
│   ├── graphql.ts           # GraphQL utilities
│   ├── graphql/
│   │   └── operations.ts    # GraphQL operations
│   ├── api.ts               # REST API client
│   ├── roles.ts             # Role utilities
│   └── colors.ts            # Color constants
│
├── store/                    # State management
│   └── authStore.ts         # Auth state (Zustand)
│
├── contexts/                 # React contexts
│
├── middleware.ts             # Next.js middleware
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the `Frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Optional: Analytics, etc.
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Configuration Files

- **next.config.js** - Next.js configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration

## 🎯 Key Features

### Authentication

- JWT-based authentication
- Automatic token management
- Protected routes
- Role-based access control
- Auth state hydration for seamless UX
- Persistent auth state with Zustand

### User Dashboard

- Real-time statistics (total matches, unread messages)
- Recent matches display
- Quick action cards (Profile Completion, Matches, Messages)
- Navigation to key features
- Responsive design

### Matches Page

- Grid layout for match cards
- Search by name, username, or email
- Filter by match status
- Match cards with user info, status badges
- View profile and chat actions
- Responsive design (1-4 columns based on screen size)

### Profile Page

- Profile information display
- Photo management
- About me section
- Preferences section
- **Verification Tab:**
  - Verification status display
  - Document upload for verification
  - Request verification functionality
  - Status tracking (verified, pending, not verified)

### Settings Page

- **Profile Visibility:** Show age, location, distance, online status
- **Discovery Preferences:** Age range, distance, discoverability
- **Notification Preferences:** Email, push, match, message, like notifications
- **Privacy Settings:** Read receipts, last seen, blocked users
- **Account Settings:** Language, timezone
- Tabbed interface
- Settings persistence via API

### Chat System

- Real-time messaging via WebSocket
- Responsive chat interface
- Chat sidebar with search
- Message bubbles with proper alignment
- Theme support (12 themes)
- Mobile-optimized interface
- Auto-scroll to latest messages

**Usage:**
```typescript
import { useLogin, useRegister, useLogout, useMe } from '@/lib/auth-apollo'

// Login
const { login, loading, error } = useLogin()
await login({ email, password })

// Register
const { register } = useRegister()
await register({ username, email, password })

// Get current user
const { user, loading } = useMe()

// Logout
const { logout } = useLogout()
await logout()
```

### GraphQL Integration

Apollo Client is configured with:
- Automatic token injection
- Error handling
- Cache management
- TypeScript support

**Usage:**
```typescript
import { useQuery, useMutation } from '@apollo/client'
import { GET_USER_QUERY, UPDATE_USER_MUTATION } from '@/lib/graphql/operations'

// Query
const { data, loading, error } = useQuery(GET_USER_QUERY)

// Mutation
const [updateUser, { loading }] = useMutation(UPDATE_USER_MUTATION)
```

### Protected Routes

Use the `ProtectedRoute` component:

```typescript
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  )
}
```

### WebSocket Integration

For real-time chat:

```typescript
// WebSocket connection
const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/chat?token=${token}`)

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  // Handle message
}
```

## 💻 Development

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Code Quality

**Linting:**
```bash
npm run lint
```

**Type Checking:**
```bash
npm run type-check
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🧩 Components

### Layout Components

- **Navbar** - Main navigation bar
- **Footer** - Site footer
- **AdminSidebar** - Admin navigation sidebar
- **UserSidebar** - User navigation sidebar
- **LayoutWrapper** - Main layout wrapper

### Auth Components

- **ProtectedRoute** - Route protection component

### Blog Components

- **ImageUpload** - Image upload component

### Chat Components

- Chat interface components (to be implemented)

## 📦 State Management

### Zustand Store

**Auth Store** (`store/authStore.ts`):

```typescript
import { useAuthStore } from '@/store/authStore'

// Get user
const user = useAuthStore((state) => state.user)

// Check if authenticated
const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

// Get token
const token = useAuthStore((state) => state.token)
```

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

**Usage:**
```tsx
<div className="flex items-center justify-center p-4 bg-blue-500 text-white">
  Content
</div>
```

### Custom Styles

Global styles are in `app/globals.css`.

## 📚 Additional Resources

- [Architecture Documentation](architecture.md)
- [API Documentation](../api/README.md)
- [REST API Reference](../api/rest-api.md)
- [Feature Documentation](../features/)
- [Changelog](../CHANGELOG.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🔄 Recent Updates (November 2025)

### New Pages
- **Matches Page** (`app/matches/page.tsx`) - User matches with search and filters
- **Settings Page** (`app/settings/page.tsx`) - Comprehensive user settings
- **Admin Verifications Page** (`app/admin/verifications/page.tsx`) - Verification management

### Updated Pages
- **Profile Page** - Added verification tab
- **Dashboard Page** - Real-time statistics and improved navigation
- **Admin Users Page** - Quick verify/unverify actions
- **Admin Matches Page** - Match creation and management

### Component Updates
- **Chat Components** - Improved responsiveness and theme support
- **Sidebars** - Updated navigation items and spacing
- **Modals** - Made fully responsive

See [Changelog](../CHANGELOG.md) for complete details.

