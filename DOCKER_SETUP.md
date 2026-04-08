# Docker Setup Guide for MatchMajor

This guide explains how to containerize and run the MatchMajor application using Docker.

## Overview

The containerization includes:
- **MongoDB** - Database service
- **Backend (Express)** - Node.js API server
- **Frontend (React)** - React application

## Prerequisites

- Docker Desktop installed ([download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- Ports 3000 (frontend), 5000 (backend), and 27017 (MongoDB) available

## File Structure

```
├── Dockerfile                    # Production multi-stage build
├── Dockerfile.dev.backend        # Development backend
├── Dockerfile.dev.frontend       # Development frontend
├── docker-compose.yml            # Production compose file
├── docker-compose.dev.yml        # Development compose file
├── .dockerignore                 # Files to exclude from Docker build
├── .env.docker                   # Docker environment template
```

## Development Setup

### 1. Build and Start Containers

```bash
# Start all services (frontend, backend, MongoDB)
docker-compose -f docker-compose.dev.yml up --build

# Start in background (detached mode)
docker-compose -f docker-compose.dev.yml up -d --build
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

### 3. View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f mongodb
```

### 4. Stop and Remove Containers

```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (clears database)
docker-compose -f docker-compose.dev.yml down -v
```

### 5. Hot Reload in Development

- **Frontend**: Changes to `src/` automatically update (React hot reload)
- **Backend**: Changes to `server/` automatically reload (nodemon)

## Production Setup

### 1. Prepare Environment

```bash
# Copy and customize the environment template
cp .env.docker .env

# Edit .env with production values
# IMPORTANT: Change all "change_me_in_production" values
```

### 2. Build and Start Single Container

```bash
# Build and start
docker-compose up --build

# Start in background
docker-compose up -d --build

# Or with environment file
docker-compose --env-file .env up -d --build
```

### 3. Access the Application

- **Frontend & Backend**: http://localhost:3000 or http://localhost:5000
- Both are served from the same container in production

### 4. View Logs

```bash
docker-compose logs -f
```

### 5. Stop the Application

```bash
docker-compose down
```

## Environment Variables

### Development (docker-compose.dev.yml)

```
NODE_ENV=development
MONGODB_URI=mongodb://matchmajor:matchmajor_password@mongodb:27017/matchmajor
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### Production (docker-compose.yml)

Use `.env` file with your custom values:
```
MONGO_USER=your_username
MONGO_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret
```

## Useful Docker Commands

### Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop a specific container
docker stop container_name

# Remove a specific container
docker rm container_name

# Remove unused images
docker image prune
```

### Database Management

```bash
# Access MongoDB shell
docker exec -it matchmajor-db mongosh -u matchmajor -p matchmajor_password

# Backup database
docker exec matchmajor-db mongodump --out /data/backup -u matchmajor -p matchmajor_password

# Restore database
docker exec -i matchmajor-db mongorestore /data/backup -u matchmajor -p matchmajor_password
```

### View Container Details

```bash
# Inspect container
docker inspect container_name

# View resource usage
docker stats

# View running processes in container
docker top container_name
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000    # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Kill process
kill -9 process_id   # macOS/Linux
taskkill /PID process_id /F    # Windows
```

### MongoDB Connection Failed

```bash
# Check MongoDB container logs
docker-compose logs mongodb

# Verify MongoDB is running and healthy
docker-compose ps
```

### Frontend Cannot Connect to Backend

- **Development**: Should be `http://localhost:5000`
- **Production**: Both on same container
- Check CORS settings in `server/server.js`
- Verify backend container is running: `docker ps`

### Build Failures

```bash
# Clear Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Performance Tips

1. **Development**: Use volumes for hot reload (already configured)
2. **Production**: Use multi-stage builds to minimize image size (Dockerfile)
3. **MongoDB**: Add indexes for faster queries
4. **Frontend**: Build is optimized; serves static files in production

## Deployment Options

### With Docker Hub

```bash
# Login to Docker Hub
docker login

# Build and tag image
docker build -t username/matchmajor:latest .

# Push to Docker Hub
docker push username/matchmajor:latest

# Pull and run on server
docker pull username/matchmajor:latest
docker run -d -p 5000:5000 --env-file .env username/matchmajor:latest
```

### With Docker Swarm or Kubernetes

Refer to official Docker Swarm or Kubernetes documentation for deployment.

## Security Best Practices

1. **Never** commit `.env` file with real secrets
2. Update `JWT_SECRET` to a strong random value
3. Use strong MongoDB passwords
4. Run containers with non-root users in production
5. Keep base images updated: `docker pull node:18-alpine`
6. Use secrets management for sensitive data

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)

## Next Steps

1. Test development setup locally
2. Configure production environment variables
3. Push to production server
4. Monitor container health and logs
5. Set up automated backups
