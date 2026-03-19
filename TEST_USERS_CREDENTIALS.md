# 👥 Test Users Credentials

## 📋 User Accounts Created

### 👤 USER 1 - ALICE
- **Email:** `alice@test.com`
- **Password:** `password123`
- **Username:** `alice`
- **Full Name:** Alice Smith

### 👤 USER 2 - BOB
- **Email:** `bob@test.com`
- **Password:** `password123`
- **Username:** `bob`
- **Full Name:** Bob Johnson

### 👑 ADMIN USER
- **Email:** `admin@gsl.com`
- **Password:** `admin123`
- **Username:** `gsladmin`
- **Role:** `admin`



---

## 🚀 How to Create Users

### Option 1: Using the Go Script (Recommended)
```bash
cd GSL_NextGo/Backend
go run create_test_users.go
```

### Option 2: Using cURL
```bash
# Create Alice
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "password123",
    "first_name": "Alice",
    "last_name": "Smith"
  }'

# Create Bob
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@test.com",
    "password": "password123",
    "first_name": "Bob",
    "last_name": "Johnson"
  }'
```

### Option 3: Using Frontend Registration
1. Go to: `http://localhost:3000/auth/register`
2. Register with the credentials above

---

## 💬 How to Test Chat

### Step 1: Login as Both Users
1. **Browser 1 (Alice):**
   - Go to: `http://localhost:3000/auth/login`
   - Email: `alice@test.com`
   - Password: `password123`

2. **Browser 2 (Bob) - Use Incognito/Private Window:**
   - Go to: `http://localhost:3000/auth/login`
   - Email: `bob@test.com`
   - Password: `password123`

### Step 2: Create a Chat Between Them

**Using GraphQL (in browser console or GraphQL playground):**

```graphql
mutation CreateDMChat {
  createDMChat(participantID: "BOB_USER_ID") {
    id
    type
    participants {
      id
      user {
        id
        username
        email
      }
    }
  }
}
```

**Or using REST API:**
```bash
# First, get Bob's user ID by logging in as Alice
# Then create a DM chat
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "query": "mutation { createDMChat(participantID: \"BOB_USER_ID\") { id type } }"
  }'
```

### Step 3: Start Chatting
1. Both users should see the chat in their chat list
2. Send messages from either user
3. Messages will appear in real-time via WebSocket

---

## 🔧 Quick Test Commands

### Check if users exist:
```bash
# Login as Alice
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "password123"
  }'

# Login as Bob
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@test.com",
    "password": "password123"
  }'
```

---

## 📝 Notes

- Both users have the same password for easy testing: `password123`
- Users are created with role: `user` (default)
- Users are not verified by default (`is_verified: false`)
- Users are not premium by default (`is_premium: false`)

---

## ✅ Verification

After creating users, verify they exist:
1. Try logging in with the credentials above
2. Check the database (if you have access)
3. Use the GraphQL `me` query to verify authentication

