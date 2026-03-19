# Deployment Guide

Complete guide for deploying GSL NextGo to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [NATS Setup](#nats-setup)
7. [Docker Deployment](#docker-deployment)
8. [Production Checklist](#production-checklist)

## 🔧 Prerequisites

- Production server (Linux recommended)
- PostgreSQL 15+ installed
- NATS Server installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- Reverse proxy (Nginx recommended)

## ⚙️ Environment Setup

### Backend Environment Variables

Create `.env` file in production:

```env
# Server
PORT=8080
GIN_MODE=release

# Database
DATABASE_URL=postgres://user:password@db-host:5432/gsl_db?sslmode=require

# JWT (use strong secret, 32+ characters)
JWT_SECRET=your-production-secret-key-min-32-characters-long

# CORS
FRONTEND_URL=https://yourdomain.com

# NATS
NATS_URL=nats://nats-host:4222

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Environment Variables

Create `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_GRAPHQL_URL=https://api.yourdomain.com/graphql
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

## 🚀 Backend Deployment

### Option 1: Direct Deployment

1. **Build the application**
   ```bash
   cd Backend
   go build -o bin/server main.go
   ```

2. **Create systemd service**
   ```bash
   sudo nano /etc/systemd/system/gsl-backend.service
   ```

   ```ini
   [Unit]
   Description=GSL Backend Service
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/opt/gsl/backend
   ExecStart=/opt/gsl/backend/bin/server
   Restart=always
   RestartSec=10
   EnvironmentFile=/opt/gsl/backend/.env

   [Install]
   WantedBy=multi-user.target
   ```

3. **Start the service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable gsl-backend
   sudo systemctl start gsl-backend
   ```

### Option 2: Docker Deployment

See [Docker Deployment Guide](docker.md)

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect repository to Vercel**
2. **Configure environment variables**
3. **Deploy**

### Option 2: Self-Hosted

1. **Build the application**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "gsl-frontend" -- start
   pm2 save
   pm2 startup
   ```

## 🗄️ Database Setup

### PostgreSQL Configuration

1. **Create production database**
   ```sql
   CREATE DATABASE gsl_db;
   CREATE USER gsl_user WITH PASSWORD 'strong_password';
   GRANT ALL PRIVILEGES ON DATABASE gsl_db TO gsl_user;
   ```

2. **Run migrations**
   ```bash
   psql -U gsl_user -d gsl_db -f Backend/database/migrations/004_chat_matching_tables.sql
   ```

3. **Configure SSL**
   - Enable SSL in PostgreSQL
   - Update `DATABASE_URL` with `sslmode=require`

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
pg_dump -U gsl_user gsl_db > /backups/gsl_db_$(date +%Y%m%d).sql
```

## 📡 NATS Setup

### Production NATS Configuration

1. **Create NATS cluster** (3+ nodes recommended)

2. **Configure JetStream**
   ```bash
   nats-server -js -m 8222 \
     --store_dir=/var/lib/nats/jetstream \
     --cluster=nats://0.0.0.0:6222 \
     --routes=nats://nats1:6222,nats://nats2:6222,nats://nats3:6222
   ```

3. **Update backend NATS_URL**
   ```env
   NATS_URL=nats://nats1:4222,nats://nats2:4222,nats://nats3:4222
   ```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Obtain SSL certificate** (Let's Encrypt)
   ```bash
   sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com
   ```

2. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name api.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /ws/ {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 📊 Monitoring

### Application Monitoring

1. **Set up logging**
   - Use structured logging (JSON format)
   - Configure log rotation
   - Send logs to centralized system (ELK, Loki)

2. **Health checks**
   ```bash
   curl http://localhost:8080/api/health
   ```

3. **Set up monitoring** (Prometheus + Grafana)

### Database Monitoring

- Monitor connection pool
- Track slow queries
- Set up alerts for high CPU/memory

## ✅ Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] NATS JetStream streams created
- [ ] SSL certificates installed
- [ ] Reverse proxy configured
- [ ] Firewall rules set
- [ ] Monitoring set up
- [ ] Backup strategy configured
- [ ] Logging configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] JWT secret is strong (32+ characters)
- [ ] Database SSL enabled
- [ ] WebSocket SSL (WSS) configured
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Load testing completed

## 🐳 Docker Deployment

See [Docker Deployment Guide](docker.md) for containerized deployment.

## 📚 Additional Resources

- [Environment Configuration](environment.md)
- [Monitoring Setup](monitoring.md)
- [Docker Guide](docker.md)





