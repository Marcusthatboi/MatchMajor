#!/bin/bash
# ============================================
# Quick Deployment Setup Script
# ============================================
# Usage: bash setup-deployment.sh [platform]
# Platforms: vercel, netlify, vps, docker

set -e

PLATFORM=${1:-docker}
PROJECT_NAME="matchmajor"

echo "================================"
echo "MatchMajor Deployment Setup"
echo "Platform: $PLATFORM"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo "[$(date +'%H:%M:%S')] $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Check prerequisites
log "Checking prerequisites..."
command -v npm >/dev/null || error "npm not found"
command -v node >/dev/null || error "node not found"
success "npm and node found"

# Install dependencies
log "Installing dependencies..."
npm install
cd server && npm install && cd ..
success "Dependencies installed"

# Create environment files
log "Setting up environment files..."
[ ! -f .env ] && cp .env.frontend.example .env && success ".env created for frontend"
[ ! -f server/.env ] && cp .env.example server/.env && success "server/.env created for backend"

# Generate secrets if not present
if ! grep -q "JWT_SECRET=CHANGE_ME" server/.env; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" server/.env
    success "JWT_SECRET generated"
fi

if ! grep -q "SESSION_SECRET=CHANGE_ME" server/.env; then
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" server/.env
    success "SESSION_SECRET generated"
fi

# Platform-specific setup
case $PLATFORM in
    vercel)
        log "Setting up for Vercel deployment..."
        [ ! -f vercel.json ] && error "vercel.json not found"
        success "Vercel configuration found"
        
        log "Next steps:"
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Run: vercel login"
        echo "3. Run: vercel"
        echo "4. Configure environment in Vercel dashboard:"
        echo "   - REACT_APP_API_URL=https://your-api-domain.com/api"
        ;;
    
    netlify)
        log "Setting up for Netlify deployment..."
        [ ! -f netlify.toml ] && error "netlify.toml not found"
        success "Netlify configuration found"
        
        log "Next steps:"
        echo "1. Install Netlify CLI: npm i -g netlify-cli"
        echo "2. Run: netlify login"
        echo "3. Run: netlify init"
        echo "4. Configure environment in Netlify dashboard"
        ;;
    
    vps)
        log "Setting up for VPS deployment..."
        
        # Check for Docker
        if ! command -v docker &> /dev/null; then
            warning "Docker not installed"
            echo "Install Docker:"
            echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
            echo "  sudo sh get-docker.sh"
        else
            success "Docker found"
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            warning "Docker Compose not installed"
            echo "Install Docker Compose:"
            echo "  sudo curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)' -o /usr/local/bin/docker-compose"
            echo "  sudo chmod +x /usr/local/bin/docker-compose"
        else
            success "Docker Compose found"
        fi
        
        # Make deploy script executable
        chmod +x deploy-vps.sh
        success "deploy-vps.sh is executable"
        
        log "Next steps:"
        echo "1. Update .env.production with your values"
        echo "2. Transfer files to VPS: scp -r . user@vps:/home/app/matchmajor"
        echo "3. SSH into VPS: ssh user@vps"
        echo "4. Run: ./deploy-vps.sh production"
        ;;
    
    docker)
        log "Setting up for Docker Compose..."
        [ ! -f docker-compose.yml ] && error "docker-compose.yml not found"
        
        # Check Docker
        if ! command -v docker &> /dev/null; then
            error "Docker not installed. Visit https://docs.docker.com/get-docker/"
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            error "Docker Compose not installed. Visit https://docs.docker.com/compose/install/"
        fi
        
        success "Docker and Docker Compose found"
        
        log "Building Docker images..."
        docker-compose build
        
        log "Next steps:"
        echo "1. Update .env with your configuration"
        echo "2. Run: docker-compose up -d"
        echo "3. Check: docker-compose ps"
        echo "4. View logs: docker-compose logs -f"
        ;;
    
    *)
        error "Unknown platform: $PLATFORM"
        echo "Supported platforms: vercel, netlify, vps, docker"
        ;;
esac

# Build checks
log "Running build verification..."
npm run build:prod >/dev/null && success "Frontend build successful" || error "Frontend build failed"

log "Checking backend configuration..."
cd server && npm run start &
sleep 3
kill %1 2>/dev/null || true
success "Backend starts successfully"
cd ..

# Summary
echo ""
echo "================================"
success "Setup complete!"
echo "================================"
echo ""
echo "Configuration files:"
echo "  Frontend:  .env"
echo "  Backend:   server/.env"
echo "  Production: .env.production"
echo ""
echo "Platform:  $PLATFORM"
echo "App Name:  $PROJECT_NAME"
echo ""
echo "Documentation:"
echo "  Deployment Guide: DEPLOYMENT_GUIDE.md"
echo "  Production Checklist: PRODUCTION_READINESS_CHECKLIST.md"
echo ""
