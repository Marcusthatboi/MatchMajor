# MatchMajor - Study Partner Matching Application

## Project Overview

MatchMajor is a full-stack web application that helps college students find study partners based on their profiles, interests, and academic goals. The application features user authentication, profile creation, matching algorithms, chat rooms, and community posts.

---

## Table of Contents

1. [Software Requirements](#software-requirements)
2. [Project Structure](#project-structure)
3. [Quick Start (Docker)](#quick-start-docker)
4. [Manual Setup (Without Docker)](#manual-setup-without-docker)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Accessing the Application](#accessing-the-application)
8. [Database Setup](#database-setup)
9. [Troubleshooting](#troubleshooting)
10. [Additional Resources](#additional-resources)

---

## Software Requirements

### Option 1: Docker Setup (Recommended)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (included with Docker Desktop)
- Windows, macOS, or Linux with 4GB+ RAM
- Ports 3000, 5000, and 27017 available

### Option 2: Manual Setup (Without Docker)

#### Required Software
1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
   - Includes npm package manager
   
2. **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
   - Community Edition
   
3. **Git** - [Download](https://git-scm.com/)
   - For version control

#### Optional
- **MongoDB Compass** - [Download](https://www.mongodb.com/products/tools/compass)
  - Visual MongoDB database management tool
- **Postman** - [Download](https://www.postman.com/downloads/)
  - API testing tool
- **Visual Studio Code** - [Download](https://code.visualstudio.com/)
  - Code editor

---

## Project Structure

```
MatchMajor/
├── backend/
│   ├── config/              # Database and server config
│   ├── controllers/         # Route logic
│   ├── middleware/          # Express middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   └── server.js            # Main server file
├── src/                     # React frontend source
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   ├── api/                # API client functions
│   ├── hooks/              # Custom React hooks
│   └── App.js              # Main React component
├── public/                 # Static files
├── database-exports/       # Database backup files
├── docker-compose.yml      # Production Docker config
├── docker-compose.dev.yml  # Development Docker config
├── Dockerfile              # Production Docker image
└── package.json            # Project dependencies
```

---

## Quick Start (Docker)

### For Development (Hot Reload)

#### Step 1: Verify Docker Installation
```bash
docker --version
docker-compose --version
```

#### Step 2: Navigate to Project Directory
```bash
cd c:\Users\marcu\OneDrive\Documents\GitHub\WebDevG92\MatchMajor
```

#### Step 3: Build and Start Services
```bash
docker-compose -f docker-compose.dev.yml up --build
```

This command will:
- Build Docker images for frontend and backend
- Pull MongoDB image
- Create network bridge
- Start all three services

#### Step 4: Wait for Services to Start
Watch for messages indicating:
- ✅ MongoDB is running
- ✅ Backend server listening on port 5000
- ✅ Frontend available on port 3000

#### Step 5: Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **MongoDB:** localhost:27017

### For Production

```bash
# Build and run optimized single container
docker-compose up --build

# Subsequent runs (no rebuild needed)
docker-compose up
```

### Stop Docker Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

---

## Manual Setup (Without Docker)

### Step 1: Install Required Software

#### Windows:
```bash
# Node.js
# Download from https://nodejs.org/ and run installer

# MongoDB
# Download Community Edition from https://www.mongodb.com/try/download/community
# Run installer and select "Install MongoDB as a Service"

# Verify installation
node --version
npm --version
mongod --version
```

#### macOS:
```bash
# Using Homebrew
brew install node
brew install mongodb-community

# Verify installation
node --version
npm --version
mongod --version
```

#### Linux (Ubuntu):
```bash
# Node.js
sudo apt update
sudo apt install nodejs npm

# MongoDB
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Verify installation
node --version
npm --version
mongosh --version
```

### Step 2: Clone/Navigate to Project

```bash
# Navigate to project directory
cd c:\Users\marcu\OneDrive\Documents\GitHub\WebDevG92\MatchMajor
```

### Step 3: Install Frontend Dependencies

```bash
# Install React and dependencies
npm install
```

This installs packages listed in `package.json`:
- React
- React Router
- Axios (HTTP client)
- Other UI libraries

### Step 4: Install Backend Dependencies

```bash
# Navigate to backend folder
cd server

# Install Node.js packages
npm install

# Navigate back to project root
cd ..
```

This installs packages for:
- Express (web framework)
- MongoDB driver (Mongoose)
- JWT authentication
- CORS
- Environment management

### Step 5: Verify MongoDB is Running

#### Windows:
```bash
# MongoDB runs as a Windows Service
# Check Services (Win+R > services.msc) or run:
net start MongoDB
```

#### macOS:
```bash
# Start MongoDB
brew services start mongodb-community
```

#### Linux:
```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl status mongod
```

#### Verify Connection:
```bash
# Test MongoDB connection
mongosh
> show databases
> exit
```

---

## Environment Configuration

### Step 1: Create Backend .env File

Navigate to server folder and create `.env`:

```bash
cd server
```

Create file `server/.env` with contents:

```
# NODE ENVIRONMENT
NODE_ENV=development
PORT=5000

# DATABASE
MONGODB_URI=mongodb://localhost:27017/matchmajor
MONGODB_TIMEOUT=30000
MONGODB_POOL_SIZE=10

# JWT & AUTHENTICATION
JWT_SECRET=your_super_secure_jwt_secret_key_with_at_least_32_characters_2024!
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# CORS & DOMAIN
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5001
ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
ALLOWED_HEADERS=Content-Type,Authorization

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_AUTH_WINDOW=900000

# SECURITY
ENABLE_HELMET=true
ENABLE_CORS=true
ENABLE_RATE_LIMIT=true
ENABLE_CSRF=true
SESSION_SECRET=your_session_secret_key_min_32_chars_for_development_2024!
COOKIE_SECURE=false
COOKIE_SAME_SITE=Strict
COOKIE_HTTP_ONLY=true
MAX_FILE_SIZE=10485760
```

### Step 2: Create Frontend .env File

Navigate to root and create `.env`:

```bash
cd ..
```

Create file `.env` with contents:

```
# FRONTEND API
REACT_APP_API_URL=http://localhost:5000/api

# NODE ENVIRONMENT
NODE_ENV=development
PORT=3000
```

### Step 3: Verify .env Files

Ensure you have:
- `server/.env` ✓
- `.env` ✓

**Note:** Do NOT commit .env files to Git (already in .gitignore)

---

## Running the Application

### Option 1: Docker (Recommended)

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Production optimized
docker-compose up --build
```

### Option 2: Manual - Start All Services

#### Terminal 1 - Start Backend Server

```bash
cd server
npm start
```

Expected output:
```
✅ Server running on port 5000
✅ MongoDB connected
```

#### Terminal 2 - Start Frontend Development Server

```bash
npm start
```

Expected output:
```
Compiled successfully!
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
```

#### Terminal 3 - Verify MongoDB (Optional)

```bash
mongosh

# In MongoDB shell
> show databases
> use matchmajor
> show collections
> exit
```

---

## Accessing the Application

Once running, open your browser and visit:

### Frontend
- **URL:** http://localhost:3000
- **Features:**
  - Login/Register
  - View matches
  - Create profile/survey
  - Chat rooms
  - Community posts

### Backend API
- **URL:** http://localhost:5000/api
- **Example endpoints:**
  - GET `/api/matches` - Get study partner matches
  - POST `/api/survey` - Save user profile
  - GET `/api/messages/:chatroomId` - Get chat messages
  - POST `/api/posts` - Create community post

### MongoDB
- **Connection:** mongodb://localhost:27017/matchmajor
- **Tool:** Use MongoDB Compass or mongosh CLI

---

## Database Setup

### Option 1: MongoDB Initialization (Automatic)

On first run, MongoDB automatically:
- Creates database `matchmajor`
- Creates necessary collections
- Applies schema validation

### Option 2: Manual Database Import

If sample data exists in `database-exports/`:

```bash
cd server/scripts

# Direct import using native driver
node importDatabaseDirect.js

# Or using Mongoose models
node importDatabase.js
```

### Option 3: MongoDB Compass (Visual)

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Create database: `matchmajor`
4. Create collections: users, surveys, posts, messages, chatrooms
5. Verify in Compass GUI

---

## Troubleshooting

### MongoDB Connection Issues

#### Error: "connect ECONNREFUSED 127.0.0.1:27017"

**Solution 1: Start MongoDB Service**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Solution 2: Verify MongoDB is Running**
```bash
mongosh
# If connected, you see: test>
```

**Solution 3: Check MongoDB Logs**
```bash
# Windows Event Viewer
# macOS/Linux
tail -f /var/log/mongodb/mongod.log
```

### Port Already in Use

#### Error: "listen EADDRINUSE :::5000"

**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Frontend Not Loading

#### Error: "Failed to fetch from API"

**Solution 1: Check Backend is Running**
```bash
# Backend should show: ✅ Server running on port 5000
curl http://localhost:5000/api/health
```

**Solution 2: Verify .env Configuration**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Solution 3: Clear Browser Cache**
- Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
- Clear cached data and refresh

### Docker Issues

#### Error: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Start Docker Desktop
# On Windows/Mac: Open Docker Desktop application
# On Linux:
sudo systemctl start docker
```

#### Error: "Port 3000 is already allocated"

**Solution:**
```bash
# Stop existing containers
docker-compose down

# Remove all stopped containers
docker system prune

# Try again
docker-compose -f docker-compose.dev.yml up --build
```

### Build Errors

#### Error: "npm ERR! code ERESOLVE"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Additional Resources

### Documentation Files
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Comprehensive Docker guide
- [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) - Docker commands reference
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [DATABASE_MANAGEMENT_GUIDE.md](./DATABASE_MANAGEMENT_GUIDE.md) - Database operations
- [MATCHING_ALGORITHM.md](./MATCHING_ALGORITHM.md) - Matching logic explanation
- [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) - API endpoints
- [AUTHENTICATION_SUMMARY.md](./AUTHENTICATION_SUMMARY.md) - Auth system details

### External Resources
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)

### Quick Commands Reference

```bash
# Development
npm start                                    # Start frontend
cd server && npm start                      # Start backend
docker-compose -f docker-compose.dev.yml up --build  # Start all (Docker)

# Production
npm run build                               # Build React app
docker-compose up --build                  # Production (Docker)

# Database
mongosh                                     # Connect to MongoDB
node server/scripts/importDatabase.js       # Import sample data

# Utilities
docker-compose logs -f                      # View logs
docker-compose down                         # Stop all services
npm install                                 # Install dependencies
```

---

## Getting Help

If you encounter issues:

1. **Check logs** - Review console and Docker logs for error messages
2. **Verify prerequisites** - Ensure all software is installed correctly
3. **Check documentation** - Review README and specific guide files
4. **Test connections** - Use commands above to verify each service
5. **Clear cache** - Remove node_modules and reinstall

---

## License

MatchMajor - All Rights Reserved 2024

---

## Last Updated

April 24, 2026

**For questions or issues, contact the development team.**
