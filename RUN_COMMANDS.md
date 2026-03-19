# 🚀 How to Run GSL NextGo - Frontend & Backend

## ✅ Pre-Flight Checklist

Before running, ensure you have:
- ✅ **PostgreSQL** installed and running
- ✅ **NATS Server** installed (for real-time chat)
- ✅ **Node.js 18+** and npm installed
- ✅ **Go 1.24+** installed
- ✅ Environment variables configured

---

## 📋 Step-by-Step Setup & Run Commands

### **Step 1: Start PostgreSQL Database**

Make sure PostgreSQL is running on your system:

```bash
# Windows (if installed as service, it should auto-start)
# Check if running:
sc query postgresql-x64-*

# Linux/Mac
sudo systemctl start postgresql
# OR
brew services start postgresql
```

---

### **Step 2: Start NATS Server** (Required for Chat)

Open a **new terminal window** and run:

```bash
# Start NATS with JetStream
nats-server -js -m 8222 --store_dir=./nats-data
```

**Keep this terminal open!** NATS must be running for chat to work.

---

### **Step 3: Backend Setup & Run**

#### **3.1 Navigate to Backend Directory**

```bash
cd GSL_NextGo/Backend
```

#### **3.2 Create/Check `.env` File**

Create a `.env` file in the `Backend` directory if it doesn't exist:

```env
# Server Configuration
PORT=8080
GIN_MODE=debug

# Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gsl_db?sslmode=disable
# OR use individual components:
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gsl_db
DB_PORT=5432
DB_SSLMODE=disable

# JWT Configuration (IMPORTANT: Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-12345678901234567890

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# NATS Configuration
NATS_URL=nats://localhost:4222

# Cloudinary Configuration (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### **3.3 Install Go Dependencies**

```bash
go mod tidy
```

#### **3.4 Run Backend**

**Option A: Using start script (Windows)**
```bash
start.bat
```

**Option B: Using start script (Linux/Mac)**
```bash
chmod +x start.sh
./start.sh
```

**Option C: Direct command**
```bash
go run main.go
```

**Expected Output:**
```
✅ Database connected successfully
✅ Database migration completed
✅ WebSocket services initialized
Server starting on port 8080
```

**Backend will run on:** `http://localhost:8080`

---

### **Step 4: Frontend Setup & Run**

#### **4.1 Navigate to Frontend Directory**

Open a **new terminal window** (keep backend and NATS running):

```bash
cd GSL_NextGo/Frontend
```

#### **4.2 Install Dependencies**

```bash
npm install
```

#### **4.3 Create/Check `.env.local` File**

Create a `.env.local` file in the `Frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

#### **4.4 Run Frontend**

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

**Frontend will run on:** `http://localhost:3000`

---

## 🎯 Quick Start Commands Summary

### **Terminal 1: NATS Server**
```bash
nats-server -js -m 8222 --store_dir=./nats-data
```

### **Terminal 2: Backend**
```bash
cd GSL_NextGo/Backend
go mod tidy
go run main.go
```

### **Terminal 3: Frontend**
```bash
cd GSL_NextGo/Frontend
npm install
npm run dev
```

---

## 🧪 Testing the Application

### **1. Test Backend Health**
```bash
curl http://localhost:8080/api/health
```
Expected: `{"status":"ok","message":"Server is running"}`

### **2. Test GraphQL Playground**
Open browser: `http://localhost:8080/playground`

### **3. Test Frontend**
Open browser: `http://localhost:3000`

### **4. Test Chat Interface**
1. Register/Login at `http://localhost:3000/auth/login`
2. Navigate to `http://localhost:3000/chat`
3. You should see the chat interface with all 12 themes available!

---

## 🔧 Troubleshooting

### **Backend Issues:**

**Problem: Database connection failed**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env matches your PostgreSQL credentials
# Try creating database manually:
psql -U postgres
CREATE DATABASE gsl_db;
```

**Problem: NATS connection failed**
```bash
# Make sure NATS server is running
# Check NATS_URL in .env
# Try: nats-server -js -m 8222
```

**Problem: Port 8080 already in use**
```bash
# Change PORT in .env to another port (e.g., 8081)
# Update frontend .env.local accordingly
```

### **Frontend Issues:**

**Problem: Cannot connect to backend**
```bash
# Check NEXT_PUBLIC_API_URL in .env.local
# Verify backend is running on correct port
# Check CORS settings in backend
```

**Problem: WebSocket connection failed**
```bash
# Check NEXT_PUBLIC_WS_URL in .env.local
# Verify NATS server is running
# Check backend WebSocket route is registered
```

**Problem: Module not found errors**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Environment Variables Reference

### **Backend (.env)**
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `8080` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for JWT tokens | Required (min 32 chars) |
| `NATS_URL` | NATS server URL | `nats://localhost:4222` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### **Frontend (.env.local)**
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` |
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL endpoint | `http://localhost:8080/graphql` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:8080` |

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] PostgreSQL is running
- [ ] NATS server is running (`nats-server -js`)
- [ ] Backend `.env` file exists and is configured
- [ ] Frontend `.env.local` file exists and is configured
- [ ] Backend starts without errors (port 8080)
- [ ] Frontend starts without errors (port 3000)
- [ ] Can access `http://localhost:8080/api/health`
- [ ] Can access `http://localhost:3000`

---

## 🎉 Success!

If everything is running:
- ✅ Backend: `http://localhost:8080`
- ✅ Frontend: `http://localhost:3000`
- ✅ GraphQL Playground: `http://localhost:8080/playground`
- ✅ Chat Interface: `http://localhost:3000/chat` (after login)

**Happy Coding! 🚀**

