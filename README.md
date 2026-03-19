# GSL NextGo - Full Stack Dating Platform

A modern dating platform built with **Go microservices**, **GraphQL (gqlgen)**, **Next.js**, **Apollo Client**, **NATS JetStream**, **WebSocket**, and **PostgreSQL**.

## 🚀 Tech Stack

### Backend
- **Go 1.24+** - Programming language
- **Gin** - Web framework
- **gqlgen** - GraphQL server generator
- **GORM** - ORM for database operations
- **PostgreSQL** - Database
- **NATS JetStream** - Message broker for real-time events
- **WebSocket (gorilla/websocket)** - Real-time bidirectional communication
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Image upload and management

### Frontend
- **Next.js 14** - React framework with App Router
- **Apollo Client** - GraphQL client
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form** - Form handling

## 📋 Prerequisites

- **Go 1.24+** ([Installation Guide](https://go.dev/doc/install))
- **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
- **NATS Server** ([Installation Guide](https://docs.nats.io/running-a-nats-service/introduction/installation))
- **Node.js 18+** and **npm** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gsl-next-go-zen/GSL_NextGo
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd Backend
go mod download
```

#### Configure Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=8080
GIN_MODE=debug

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

#### Start NATS Server

```bash
# Start NATS with JetStream
nats-server -js -m 8222 --store_dir=./nats-data
```

#### Initialize Database

The database will be automatically created and migrated when you start the server.

#### Run the Backend

```bash
# Development mode
go run main.go

# Or using the start script
./start.sh  # Linux/Mac
start.bat   # Windows
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd Frontend
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in the `Frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

#### Run the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## 📁 Project Structure

```
GSL_NextGo/
├── Backend/
│   ├── main.go                 # Application entry point
│   ├── database/
│   │   ├── database.go         # Database connection & migration
│   │   └── migrations/         # SQL migration files
│   ├── models/                 # Database models
│   │   ├── user.go
│   │   ├── chat.go
│   │   ├── matching.go
│   │   ├── blog.go
│   │   ├── news.go
│   │   ├── user_settings.go
│   │   └── verification_request.go
│   ├── graph/                  # GraphQL layer
│   │   ├── schema/
│   │   │   └── schema.graphqls # GraphQL schema
│   │   ├── resolver/           # GraphQL resolvers
│   │   └── handler.go          # GraphQL handler
│   ├── services/               # Business logic services
│   │   ├── chat/               # Chat service
│   │   ├── matching/           # Matching service
│   │   └── gateway/            # WebSocket gateway
│   ├── pkg/                    # Shared packages
│   │   ├── natsutil/           # NATS utilities
│   │   └── websocket/          # WebSocket utilities
│   ├── handlers/               # REST handlers
│   ├── middleware/             # Middleware
│   ├── routes/                 # Route configuration
│   └── utils/                  # Utility functions
│
├── Frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── chat/              # Chat pages
│   │   ├── matches/           # Matches page
│   │   ├── profile/           # Profile page
│   │   ├── settings/          # Settings page
│   │   ├── admin/             # Admin pages
│   │   │   ├── users/         # User management
│   │   │   ├── matches/       # Match management
│   │   │   └── verifications/ # Verification management
│   │   └── ...
│   ├── components/            # React components
│   ├── lib/                   # Libraries and utilities
│   │   ├── apollo-client.ts
│   │   ├── auth-apollo.ts
│   │   └── graphql/
│   └── store/                 # State management
│
├── Documentation/             # Technical documentation
│   ├── PRD_CHAT_MATCHING_MICROSERVICES.md
│   └── IMPLEMENTATION_GUIDE.md
│
└── project_docs/              # Comprehensive project documentation
    ├── backend/
    ├── frontend/
    ├── api/
    ├── deployment/
    └── architecture/
```

## 📚 Documentation

Comprehensive documentation is available in the `project_docs/` directory:

- **[Project Overview](project_docs/README.md)** - Complete project documentation
- **[Backend Documentation](project_docs/backend/README.md)** - Backend architecture and setup
- **[Frontend Documentation](project_docs/frontend/README.md)** - Frontend architecture and setup
- **[API Documentation](project_docs/api/README.md)** - GraphQL and REST API reference
- **[Deployment Guide](project_docs/deployment/README.md)** - Production deployment instructions
- **[Architecture Documentation](project_docs/architecture/README.md)** - System architecture

## 🎯 Key Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Protected routes and GraphQL resolvers
- ✅ Auth state hydration for seamless user experience

### Chat System
- ✅ Real-time messaging via WebSocket
- ✅ Message persistence in PostgreSQL
- ✅ Typing indicators
- ✅ Presence status (online/offline)
- ✅ Read receipts
- ✅ NATS JetStream for message distribution
- ✅ Responsive chat UI with theme support
- ✅ Chat sidebar with search and filters
- ✅ Message bubbles with sender/receiver alignment
- ✅ Auto-scroll to latest messages
- ✅ Mobile-optimized chat interface

### Matching System
- ✅ Intelligent matching algorithm
- ✅ Match scoring (age, distance, interests, profile quality, activity)
- ✅ Like/pass/superlike functionality
- ✅ Mutual match creation
- ✅ Match suggestions generation
- ✅ Admin match creation and management
- ✅ User matches page with search and filters
- ✅ Match cards with status badges
- ✅ Responsive matches grid layout

### Profile Verification System
- ✅ User verification request submission
- ✅ Document upload for verification
- ✅ Admin verification management dashboard
- ✅ Approve/reject verification requests
- ✅ Automatic user verification on approval
- ✅ Verification status tracking
- ✅ Verification badge display
- ✅ Rejection reason tracking

### User Settings
- ✅ Comprehensive settings page
- ✅ Profile visibility controls
- ✅ Discovery preferences (age range, distance)
- ✅ Notification preferences
- ✅ Privacy settings (read receipts, last seen)
- ✅ Account settings (language, timezone)
- ✅ Settings persistence via API

### User Dashboard
- ✅ Real-time statistics (matches, messages)
- ✅ Recent matches display
- ✅ Quick action cards
- ✅ Profile completion tracking
- ✅ Navigation to key features

### Admin Dashboard
- ✅ User management (CRUD operations)
- ✅ Match management (create, view, delete)
- ✅ Verification request management
- ✅ Real-time statistics
- ✅ User search and filtering
- ✅ Quick verify/unverify actions

### Content Management
- ✅ Blog system with rich text editor
- ✅ News/articles system
- ✅ Image upload via Cloudinary
- ✅ Admin dashboard for content management

### UI/UX Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ 12 chat themes with CSS variables
- ✅ Smooth animations (Framer Motion)
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Accessible components

## 🔐 Authentication

### GraphQL Authentication

The application uses **JWT-based authentication** with GraphQL.

#### Register

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      username
      email
      role
    }
  }
}
```

#### Login

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      username
      email
      role
    }
  }
}
```

## 🌐 API Endpoints

### GraphQL
- **GraphQL**: `POST/GET http://localhost:8080/graphql`
- **GraphQL Playground**: `GET http://localhost:8080/playground` (development only)

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

See [REST API Documentation](project_docs/api/rest-api.md) for complete API reference.

### WebSocket
- `WS ws://localhost:8080/ws/chat?token={JWT_TOKEN}` - Chat WebSocket connection

## 🚀 Deployment

See [Deployment Guide](project_docs/deployment/README.md) for detailed instructions.

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed**
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists

**NATS Connection Failed**
- Check NATS server is running: `nats-server -js -m 8222`
- Verify `NATS_URL` in `.env`

**Port Already in Use**
- Change `PORT` in `.env`
- Or kill the process using port 8080

### Frontend Issues

**Apollo Client Errors**
- Verify `NEXT_PUBLIC_GRAPHQL_URL` is correct
- Check backend is running
- Ensure CORS is configured

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Go, GraphQL, Next.js, NATS, and PostgreSQL**
# GetSetLove
