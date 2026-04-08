.PHONY: help dev dev-build dev-logs dev-stop prod prod-build prod-logs prod-stop restart clean db-shell

help:
	@echo "MatchMajor Docker Commands"
	@echo "=========================="
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev              - Start development environment"
	@echo "  make dev-build        - Build and start development environment"
	@echo "  make dev-logs         - View development logs"
	@echo "  make dev-stop         - Stop development environment"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod             - Start production environment"
	@echo "  make prod-build       - Build and start production environment"
	@echo "  make prod-logs        - View production logs"
	@echo "  make prod-stop        - Stop production environment"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make restart          - Restart all containers"
	@echo "  make clean            - Remove all containers and volumes"
	@echo "  make db-shell         - Access MongoDB shell"
	@echo "  make help             - Show this help message"

# Development
dev:
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml up --build

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-stop:
	docker-compose -f docker-compose.dev.yml down

# Production
prod:
	docker-compose up

prod-build:
	docker-compose up --build

prod-logs:
	docker-compose logs -f

prod-stop:
	docker-compose down

# Utility
restart:
	docker-compose down
	docker-compose up -d

clean:
	docker-compose down -v
	docker system prune -a --volumes

db-shell:
	docker exec -it matchmajor-db mongosh -u matchmajor -p matchmajor_password

status:
	docker ps
	docker stats
