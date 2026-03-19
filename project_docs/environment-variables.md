# Environment Variables

Complete reference for all environment variables used in GSL NextGo.

## 🔧 Backend Environment Variables

### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `8080` | No |
| `GIN_MODE` | Gin mode (debug/release) | `debug` | No |

### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `DB_HOST` | Database host | `localhost` | No* |
| `DB_USER` | Database user | `postgres` | No* |
| `DB_PASSWORD` | Database password | - | No* |
| `DB_NAME` | Database name | `gsl_db` | No* |
| `DB_PORT` | Database port | `5432` | No* |
| `DB_SSLMODE` | SSL mode | `disable` | No |

*Required if `DATABASE_URL` is not set

### JWT Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - | Yes |

### CORS Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |

### NATS Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NATS_URL` | NATS server URL | `nats://localhost:4222` | Yes |

### Cloudinary Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | No |

## 🎨 Frontend Environment Variables

### API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` | Yes |
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL endpoint URL | `http://localhost:8080/graphql` | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:8080` | Yes |

### Optional Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - | No |

## 📝 Example Configuration Files

### Backend `.env`

```env
# Server
PORT=8080
GIN_MODE=debug

# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/gsl_db?sslmode=disable

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# CORS
FRONTEND_URL=http://localhost:3000

# NATS
NATS_URL=nats://localhost:4222

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Production Backend `.env`

```env
# Server
PORT=8080
GIN_MODE=release

# Database
DATABASE_URL=postgres://user:password@db-host:5432/gsl_db?sslmode=require

# JWT (use strong secret)
JWT_SECRET=production-secret-key-minimum-32-characters-long-random-string

# CORS
FRONTEND_URL=https://yourdomain.com

# NATS
NATS_URL=nats://nats1:4222,nats://nats2:4222,nats://nats3:4222

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Production Frontend `.env.production`

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_GRAPHQL_URL=https://api.yourdomain.com/graphql
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (minimum 32 characters, random)
3. **Use SSL for database connections** in production (`sslmode=require`)
4. **Use WSS for WebSocket** in production
5. **Rotate secrets regularly** in production
6. **Use environment-specific files** (`.env.local`, `.env.production`)

## 📚 Additional Resources

- [Backend Setup](../backend/README.md)
- [Frontend Setup](../frontend/README.md)
- [Deployment Guide](../deployment/README.md)





