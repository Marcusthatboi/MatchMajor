# Quick Start Commands

## Development - All Services with Hot Reload
```bash
docker-compose -f docker-compose.dev.yml up --build
```
Then visit: http://localhost:3000 (Frontend) and http://localhost:5000 (Backend API)

## Production - Single Optimized Container
```bash
# First time - build and run
docker-compose up --build

# Subsequent times - just run
docker-compose up
```
Then visit: http://localhost:3000

## Stop All Services
```bash
docker-compose down
```

## View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

## Remove Everything (Start Fresh)
```bash
docker-compose down -v
docker system prune -a
```

## Access MongoDB
```bash
docker exec -it matchmajor-db mongosh -u matchmajor -p matchmajor_password
```

## View Container Status
```bash
docker ps
docker stats
```

## For Development Issues

### Frontend not updating?
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Backend not connecting to DB?
```bash
docker-compose logs mongodb
docker-compose logs backend
```

### Port conflicts?
```bash
lsof -i :3000      # macOS/Linux
netstat -ano | findstr :3000   # Windows
```
