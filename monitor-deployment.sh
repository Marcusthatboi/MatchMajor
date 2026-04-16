#!/bin/bash
# ============================================
# Post-Deployment Health Check & Monitoring
# ============================================
# Usage: bash monitor-deployment.sh [domain] [interval]
# Example: bash monitor-deployment.sh yourdomain.com 60

set -e

DOMAIN=${1:-localhost:3000}
INTERVAL=${2:-60}
MAX_FAILURES=5
FAILURE_COUNT=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Add https if not present
if [[ ! "$DOMAIN" =~ ^https?:// ]]; then
    DOMAIN="https://$DOMAIN"
fi

log "Starting deployment health checks"
log "Domain: $DOMAIN"
log "Check interval: ${INTERVAL}s"
log "Max consecutive failures before alert: $MAX_FAILURES"
echo ""

# Create report file
REPORT_FILE="deployment-health-$(date +%Y%m%d-%H%M%S).log"

check_endpoint() {
    local endpoint=$1
    local name=$2
    
    if curl -s -m 10 "${DOMAIN}${endpoint}" >/dev/null 2>&1; then
        success "$name endpoint responding"
        return 0
    else
        error "$name endpoint not responding"
        return 1
    fi
}

check_health() {
    log "Checking health endpoints..."
    
    check_endpoint "/api/health" "Basic health" && echo "✓" || echo "✗"
    check_endpoint "/api/health/detailed" "Detailed health" && echo "✓" || echo "✗"
    check_endpoint "/api/health/ready" "Readiness probe" && echo "✓" || echo "✗"
    check_endpoint "/api/health/live" "Liveness probe" && echo "✓" || echo "✗"
}

check_database() {
    log "Checking database connectivity..."
    
    # This would require backend to expose DB status
    # For now, test indirectly through API
    if curl -s -X GET "${DOMAIN}/api/products?limit=1" -H "Content-Type: application/json" >/dev/null 2>&1; then
        success "Database accessible via API"
        return 0
    else
        error "Database not responding"
        return 1
    fi
}

check_performance() {
    log "Checking performance metrics..."
    
    # Measure response time
    RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "${DOMAIN}/api/health")
    RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)
    
    if [ "$RESPONSE_MS" -lt 500 ]; then
        success "Response time: ${RESPONSE_MS}ms (good)"
    elif [ "$RESPONSE_MS" -lt 1000 ]; then
        warning "Response time: ${RESPONSE_MS}ms (acceptable)"
    else
        error "Response time: ${RESPONSE_MS}ms (slow)"
    fi
    
    # Check SSL certificate
    if [[ "$DOMAIN" == https* ]]; then
        CERT_EXPIRE=$(echo | openssl s_client -servername "${DOMAIN#https://}" -connect "${DOMAIN#https://}:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
        log "SSL Certificate expires: $CERT_EXPIRE"
    fi
}

check_security_headers() {
    log "Checking security headers..."
    
    HEADERS=$(curl -s -I "$DOMAIN" 2>/dev/null)
    
    echo "$HEADERS" | grep -qi "Strict-Transport-Security" && success "HSTS header present" || warning "HSTS header missing"
    echo "$HEADERS" | grep -qi "X-Content-Type-Options" && success "X-Content-Type-Options present" || warning "X-Content-Type-Options missing"
    echo "$HEADERS" | grep -qi "X-Frame-Options" && success "X-Frame-Options present" || warning "X-Frame-Options missing"
}

check_frontend() {
    log "Checking frontend loading..."
    
    FRONTEND_SIZE=$(curl -s -I "$DOMAIN" | grep -i "content-length" | awk '{print $2}')
    
    if [ ! -z "$FRONTEND_SIZE" ]; then
        success "Frontend loading (${FRONTEND_SIZE} bytes)"
        return 0
    else
        error "Frontend not responding"
        return 1
    fi
}

comprehensive_check() {
    log "Running comprehensive health check..."
    echo ""
    
    FAILED=0
    
    check_health || FAILED=$((FAILED + 1))
    echo ""
    
    check_database || FAILED=$((FAILED + 1))
    echo ""
    
    check_performance
    echo ""
    
    check_security_headers
    echo ""
    
    check_frontend || FAILED=$((FAILED + 1))
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        success "All checks passed"
        FAILURE_COUNT=0
        return 0
    else
        warning "$FAILED checks failed"
        FAILURE_COUNT=$((FAILURE_COUNT + 1))
        
        if [ $FAILURE_COUNT -ge $MAX_FAILURES ]; then
            error "Max failures ($MAX_FAILURES) reached. Alert required!"
            # You could send notification here (Slack, email, etc.)
        fi
        return 1
    fi
}

# Log to file
{
    echo "Deployment Health Check Report"
    echo "Domain: $DOMAIN"
    echo "Started: $(date)"
    echo "========================================"
} > "$REPORT_FILE"

# Main monitoring loop
log "Starting continuous monitoring (press Ctrl+C to stop)..."
echo ""

ITERATION=0
while true; do
    ITERATION=$((ITERATION + 1))
    
    echo ""
    log "Check #$ITERATION ($(date +'%H:%M:%S'))"
    
    comprehensive_check >> "$REPORT_FILE" 2>&1
    
    if [ $ITERATION -lt 1000000 ]; then
        log "Next check in ${INTERVAL}s..."
        sleep "$INTERVAL"
    fi
done
