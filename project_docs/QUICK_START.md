# Quick Start Guide

Get up and running with GSL NextGo in 5 minutes.

## ⚡ Quick Setup

### 1. Prerequisites Check

```bash
# Check Go version (need 1.24+)
go version

# Check Node.js version (need 18+)
node --version

# Check PostgreSQL (need 15+)
psql --version

# Check NATS (install if needed)
nats-server --version
```

### 2. Start Services

**Terminal 1 - PostgreSQL:**
```bash
# Ensure PostgreSQL is running
# On Linux/Mac:
sudo systemctl start postgresql
# On Windows: Start PostgreSQL service
```

**Terminal 2 - NATS:**
```bash
nats-server -js -m 8222 --store_dir=./nats-data
```

**Terminal 3 - Backend:**
```bash
cd Backend
cp .env.example .env
# Edit .env with your settings
go run main.go
```

**Terminal 4 - Frontend:**
```bash
cd Frontend
cp .env.example .env.local
# Edit .env.local with your settings
npm install
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **GraphQL Playground**: http://localhost:8080/playground
- **NATS Monitoring**: http://localhost:8222

## 📝 Minimal Configuration

### Backend `.env`
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gsl_db?sslmode=disable
JWT_SECRET=your-secret-key-min-32-chars
NATS_URL=nats://localhost:4222
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## ✅ Verify Installation

1. **Check Backend Health:**
   ```bash
   curl http://localhost:8080/api/health
   ```

2. **Check GraphQL:**
   - Visit http://localhost:8080/playground
   - Run: `query { __typename }`

3. **Check Frontend:**
   - Visit http://localhost:3000
   - Should see the homepage

## 🐛 Common Issues

**Database connection failed:**
- Ensure PostgreSQL is running
- Check database credentials

**NATS connection failed:**
- Ensure NATS server is running
- Check NATS_URL in .env

**Port already in use:**
- Change PORT in backend .env
- Or kill the process using the port

## 📚 Next Steps

- Read [Backend Documentation](backend/README.md)
- Read [Frontend Documentation](frontend/README.md)
- Check [API Documentation](api/README.md)
- Review [Architecture](architecture/README.md)

## 🆘 Need Help?

- Check [Troubleshooting Guide](../README.md#-troubleshooting)
- Review [Environment Variables](environment-variables.md)
- See [Deployment Guide](deployment/README.md)





