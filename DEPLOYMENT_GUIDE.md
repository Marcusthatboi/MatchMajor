# 🚀 Deployment Guide - MatchMajor

## Overview

This guide provides step-by-step instructions for deploying MatchMajor to different hosting platforms:
- **Vercel** (Frontend) - Recommended for React apps
- **Netlify** (Frontend) - Alternative frontend hosting
- **VPS/Docker** (Full stack) - For self-hosted deployments
- **Docker Compose** - Local production-like environment

---

## Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables](#environment-variables)
3. [Deployment Platforms](#deployment-platforms)
   - [Vercel (Frontend)](#vercel-frontend)
   - [Netlify (Frontend)](#netlify-frontend)
   - [VPS Deployment (Full Stack)](#vps-deployment-full-stack)
   - [Docker Compose](#docker-compose)
4. [Post-deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Pre-deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] Frontend builds successfully: `npm run build:prod`
- [ ] Backend builds successfully: `cd server && npm install`
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Security headers verified
- [ ] HTTPS/SSL certificate obtained
- [ ] DNS records configured
- [ ] Backups configured
- [ ] Monitoring/alerting set up
- [ ] CI/CD pipeline configured (GitHub Actions)

---

## Environment Variables

### Backend (.env file on VPS)

```bash
# Critical for production
NODE_ENV=production
JWT_SECRET=<generate-with-crypto>
SESSION_SECRET=<generate-with-crypto>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
FRONTEND_URL=https://yourdomain.com

# Security
COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
HELMET_HSTS_PRELOAD=true
```

### Frontend (.env in Vercel/Netlify dashboard)

```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

**Generate Secure Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deployment Platforms

### Vercel (Frontend)

**Best for:** React frontend only (API separate)

#### Step 1: Prepare Repository
```bash
# Ensure .env variables are not in git
echo ".env*" >> .gitignore
git push origin main
```

#### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select root directory (if monorepo)

#### Step 3: Configure Environment
In Vercel Dashboard → Settings → Environment Variables:
- `REACT_APP_API_URL` = `https://your-api-domain.com/api`
- `REACT_APP_ENV` = `production`

#### Step 4: Deploy
```bash
# Automatic on push to main, or manually:
# In Vercel Dashboard → Deploy
```

**Build Configuration:**
- Build Command: `npm run build:prod`
- Output Directory: `build`
- Install Command: `npm install`

#### Verification
```bash
curl https://yourdomain.vercel.app
# Should return React app HTML
```

---

### Netlify (Frontend)

**Best for:** React frontend with advanced features

#### Step 1: Connect Repository
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub and select repository

#### Step 2: Configure Build Settings
- Build Command: `npm run build:prod`
- Publish Directory: `build`

#### Step 3: Environment Variables
Netlify Dashboard → Site Settings → Build & Deploy → Environment:
- `REACT_APP_API_URL` = `https://your-api-domain.com/api`
- `REACT_APP_ENV` = `production`

#### Step 4: Configure Domain
1. Domain Settings → Add custom domain
2. Update DNS records (CNAME to Netlify)
3. Enable HTTPS (auto with Let's Encrypt)

#### Verification
```bash
curl https://yourdomain.com
# Check Response headers and SSL certificate
```

---

### VPS Deployment (Full Stack)

**Best for:** Full control, self-hosted, Docker support

#### Prerequisites

**On your VPS (Ubuntu 20.04+ or similar):**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /home/app/matchmajor
cd /home/app/matchmajor
```

#### Step 1: Clone Repository

```bash
cd /home/app/matchmajor
git clone <your-repo> .
```

#### Step 2: Configure Environment

```bash
# Copy and edit production environment
cp .env.production .env

# Edit with your values
nano .env
# Update:
# - MONGODB_URI (if using external)
# - JWT_SECRET
# - SESSION_SECRET  
# - FRONTEND_URL
# - ALLOWED_ORIGINS
# - Any API keys
```

#### Step 3: Set Permissions

```bash
# Make deploy script executable
chmod +x deploy-vps.sh

# Create non-root user for app (optional but recommended)
sudo useradd -m -s /bin/bash matchmajor
sudo chown -R matchmajor:matchmajor /home/app/matchmajor
```

#### Step 4: Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/matchmajor`:

```nginx
upstream matchmajor_api {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    
    # API proxy
    location /api/ {
        proxy_pass http://matchmajor_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend static files
    location / {
        proxy_pass http://matchmajor_api;
        proxy_set_header Host $host;
        
        # Try to serve from build folder
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/matchmajor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### Step 6: Deploy

```bash
cd /home/app/matchmajor
./deploy-vps.sh production
```

#### Step 7: Monitor Status

```bash
# View logs
docker-compose logs -f

# Check containers
docker-compose ps

# Health check
curl https://yourdomain.com/api/health
```

---

### Docker Compose

**Best for:** Local production simulation

```bash
# Build and start
docker-compose up --build

# In background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Test deployment:**
```bash
curl http://localhost:5000/api/health
curl http://localhost:3000
```

---

## Post-deployment

### 1. Health Checks

```bash
# API health
curl https://yourdomain.com/api/health

# Frontend loading
curl -I https://yourdomain.com

# Database connectivity
docker-compose exec mongodb mongosh -u admin -p admin
```

### 2. Monitor Logs

```bash
# Real-time logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs app -f
```

### 3. Set Up Monitoring

**Install monitoring tools:**
```bash
# Option 1: Prometheus + Grafana
docker run -d -p 9090:9090 prom/prometheus

# Option 2: New Relic
npm install newrelic

# Option 3: DataDog
# Sign up at datadog.com and follow setup
```

### 4. Configure Backups

```bash
# MongoDB backup
docker-compose exec mongodb mongodump --username admin --password admin --out=/backup/$(date +%Y%m%d)

# Automate with cron
0 2 * * * /home/app/matchmajor/backup.sh
```

### 5. Enable Auto-renewal

```bash
# For SSL certificates
sudo systemctl enable certbot.timer

# For Docker updates
docker image prune -f
docker container prune -f
```

---

## Troubleshooting

### Build Fails

**Problem:** `npm run build` fails

**Solution:**
```bash
# Clear cache
rm -rf node_modules
npm cache clean --force
npm install
npm run build:prod
```

### Docker Issues

**Problem:** Container won't start

**Solution:**
```bash
# Check logs
docker logs matchmajor-app-prod

# Rebuild
docker-compose down
docker-compose up --build

# Reset completely
docker system prune -a
```

### API Connection Issues

**Problem:** Frontend can't reach API

**Solution:**
```bash
# Check CORS configuration
echo $FRONTEND_URL
echo $ALLOWED_ORIGINS

# Test API directly
curl https://yourdomain.com/api/health

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

### Database Issues

**Problem:** MongoDB connection fails

**Solution:**
```bash
# Check MongoDB status
docker-compose ps mongodb

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Check credentials
grep MONGODB_URI .env

# Rebuild MongoDB
docker-compose down -v
docker-compose up mongodb
```

### Certificate Issues

**Problem:** SSL certificate expired

**Solution:**
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check expiry
sudo certbot certificates

# Update Nginx
sudo systemctl restart nginx
```

---

## Performance Optimization

### Enable Caching

In `nginx.conf`:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    add_header X-Cache-Status $upstream_cache_status;
}
```

### Enable Compression

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Database Indexing

```bash
# In MongoDB
db.products.createIndex({ name: 1, price: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

---

## Maintenance

### Regular Tasks

- **Daily**: Monitor error logs, check uptime
- **Weekly**: Review analytics, check disk usage
- **Monthly**: Update dependencies, run security audit
- **Quarterly**: Database optimization, performance review

### Update Application

```bash
cd /home/app/matchmajor

# Pull latest code
git pull origin main

# Rebuild and deploy
./deploy-vps.sh production
```

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Database user permissions limited
- [ ] Secrets in environment variables only
- [ ] Regular backups configured
- [ ] Monitoring/alerting active

---

## Support & Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Last Updated**: April 2026
**Version**: 1.0.0
