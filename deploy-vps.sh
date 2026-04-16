#!/bin/bash
# ============================================
# VPS Deployment Script for MatchMajor
# ============================================
# Usage: bash deploy-vps.sh [production|staging]
# Prerequisites: Docker, Docker Compose installed on VPS
# Run as: ssh user@vps-ip "bash -s" < deploy-vps.sh production

set -e

ENVIRONMENT=${1:-staging}
APP_NAME="matchmajor"
APP_DIR="/home/app/matchmajor"
LOG_FILE="/var/log/${APP_NAME}-deploy.log"

echo "================================"
echo "Deploying MatchMajor - ${ENVIRONMENT}"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# Check prerequisites
log "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || error "Docker is not installed"
command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"
success "All prerequisites met"

# Create app directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    log "Creating app directory at $APP_DIR"
    mkdir -p "$APP_DIR"
fi

# Navigate to app directory
cd "$APP_DIR"
log "Working directory: $(pwd)"

# Pull latest code (if Git is set up)
if [ -d .git ]; then
    log "Pulling latest code from Git..."
    git pull origin main || warning "Git pull failed"
fi

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    log "Loading production environment..."
    [ -f .env ] || error ".env file not found in $APP_DIR"
    source .env
    DOCKER_COMPOSE_FILE="docker-compose.yml"
    
    # Additional security checks for production
    [ -z "$JWT_SECRET" ] && error "JWT_SECRET is not set in .env"
    [ -z "$MONGO_PASSWORD" ] && error "MONGO_PASSWORD is not set in .env"
else
    log "Loading staging environment..."
    DOCKER_COMPOSE_FILE="docker-compose.dev.yml"
fi

# Stop and remove old containers
log "Stopping old containers..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || warning "Could not stop existing containers"

# Build images
log "Building Docker images..."
docker-compose -f "$DOCKER_COMPOSE_FILE" build || error "Docker build failed"

# Start services
log "Starting services..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d || error "Could not start services"

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 10

# Health checks
log "Running health checks..."
MONGO_HEALTH=$(docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mongodb echo 'db.runCommand("ping").ok' | mongosh -u admin -p admin 2>/dev/null || echo "0")
if [ "$MONGO_HEALTH" != "1" ]; then
    warning "MongoDB health check failed"
else
    success "MongoDB is healthy"
fi

# Check if API is responding
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    success "API is responding"
else
    warning "API health check returned status $API_RESPONSE"
fi

# Run database migrations if needed
if [ -f scripts/migrate.sh ]; then
    log "Running database migrations..."
    bash scripts/migrate.sh || warning "Migration script failed"
fi

# Display logs
log "Recent logs:"
docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=20

# Summary
log "================================"
success "Deployment completed successfully!"
log "Environment: $ENVIRONMENT"
log "Containers running:"
docker-compose -f "$DOCKER_COMPOSE_FILE" ps
log "================================"

# Cleanup old images (optional)
log "Cleaning up unused images..."
docker image prune -f --filter "dangling=true" || true

success "Deployment pipeline complete"
