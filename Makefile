# =============================================================================
# Makefile for PKM Shop
# =============================================================================

.PHONY: help dev build start stop restart logs clean install migrate seed test docker-build docker-up docker-down docker-restart docker-logs prisma-studio db-reset

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
YELLOW := \033[1;33m
GREEN := \033[1;32m
RED := \033[1;31m
NC := \033[0m # No Color

# =============================================================================
# Help
# =============================================================================
help: ## แสดงคำสั่งที่ใช้ได้ทั้งหมด
	@echo "$(GREEN)PKM Shop - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# Local Development
# =============================================================================
install: ## ติดตั้ง dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	npm install

dev: ## รัน development server
	@echo "$(GREEN)Starting development server...$(NC)"
	npm run dev

build: ## Build โปรเจค
	@echo "$(GREEN)Building project...$(NC)"
	npm run build

start: ## รัน production server
	@echo "$(GREEN)Starting production server...$(NC)"
	npm start

lint: ## ตรวจสอบ code style
	@echo "$(GREEN)Running linter...$(NC)"
	npm run lint

# =============================================================================
# Database & Prisma
# =============================================================================
migrate: ## รัน Prisma migrations
	@echo "$(GREEN)Running Prisma migrations...$(NC)"
	npx prisma migrate dev

migrate-deploy: ## Deploy migrations to production
	@echo "$(GREEN)Deploying migrations...$(NC)"
	npx prisma migrate deploy

migrate-reset: ## รีเซ็ต database และรัน migrations ใหม่
	@echo "$(RED)Resetting database...$(NC)"
	npx prisma migrate reset

generate: ## Generate Prisma Client
	@echo "$(GREEN)Generating Prisma Client...$(NC)"
	npx prisma generate

studio: ## เปิด Prisma Studio
	@echo "$(GREEN)Opening Prisma Studio...$(NC)"
	npx prisma studio

seed: ## ใส่ข้อมูลตัวอย่างลง database
	@echo "$(GREEN)Seeding database...$(NC)"
	npx prisma db seed

db-push: ## Push schema changes to database
	@echo "$(GREEN)Pushing schema to database...$(NC)"
	npx prisma db push

db-reset: ## รีเซ็ต database ทั้งหมด
	@echo "$(RED)Resetting entire database...$(NC)"
	npx prisma migrate reset --force

# =============================================================================
# Docker Commands
# =============================================================================
docker-build: ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build

docker-up: ## เริ่ม Docker containers
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	docker-compose up -d

docker-down: ## หยุด Docker containers
	@echo "$(RED)Stopping Docker containers...$(NC)"
	docker-compose down

docker-restart: ## รีสตาร์ท Docker containers
	@echo "$(YELLOW)Restarting Docker containers...$(NC)"
	docker-compose restart

docker-logs: ## ดู logs ของ Docker containers
	@echo "$(GREEN)Showing Docker logs...$(NC)"
	docker-compose logs -f

docker-logs-app: ## ดู logs ของ app container
	@echo "$(GREEN)Showing app logs...$(NC)"
	docker-compose logs -f app

docker-logs-db: ## ดู logs ของ database container
	@echo "$(GREEN)Showing database logs...$(NC)"
	docker-compose logs -f mysql

docker-ps: ## แสดง status ของ containers
	@echo "$(GREEN)Docker containers status:$(NC)"
	docker-compose ps

docker-shell: ## เข้า shell ของ app container
	@echo "$(GREEN)Entering app container shell...$(NC)"
	docker-compose exec app sh

docker-db-shell: ## เข้า MySQL shell
	@echo "$(GREEN)Entering MySQL shell...$(NC)"
	docker-compose exec mysql mysql -uroot -p

docker-migrate: ## รัน migrations ใน Docker
	@echo "$(GREEN)Running migrations in Docker...$(NC)"
	docker-compose exec app npx prisma migrate deploy

docker-seed: ## Seed database ใน Docker
	@echo "$(GREEN)Seeding database in Docker...$(NC)"
	docker-compose exec app npx prisma db seed

docker-clean: ## ลบ Docker containers และ volumes
	@echo "$(RED)Cleaning Docker containers and volumes...$(NC)"
	docker-compose down -v

docker-rebuild: ## Rebuild และรีสตาร์ท Docker containers
	@echo "$(YELLOW)Rebuilding and restarting containers...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# =============================================================================
# Combined Commands
# =============================================================================
setup: install generate ## Setup โปรเจคครั้งแรก
	@echo "$(GREEN)Project setup complete!$(NC)"

setup-docker: docker-build docker-up docker-migrate ## Setup Docker environment
	@echo "$(GREEN)Docker environment setup complete!$(NC)"
	@echo "$(YELLOW)Application: http://localhost:3000$(NC)"
	@echo "$(YELLOW)phpMyAdmin: http://localhost:8080$(NC)"

fresh: clean install migrate seed ## เริ่มโปรเจคใหม่ทั้งหมด
	@echo "$(GREEN)Fresh installation complete!$(NC)"

# =============================================================================
# Cleanup
# =============================================================================
clean: ## ลบไฟล์ที่ไม่จำเป็น
	@echo "$(RED)Cleaning project...$(NC)"
	rm -rf node_modules
	rm -rf .next
	rm -rf dist
	rm -rf logs/*
	@echo "$(GREEN)Clean complete!$(NC)"

clean-all: clean docker-clean ## ลบทุกอย่างรวมถึง Docker
	@echo "$(GREEN)Complete cleanup done!$(NC)"

# =============================================================================
# Production Commands
# =============================================================================
prod-build: ## Build สำหรับ production
	@echo "$(GREEN)Building for production...$(NC)"
	NODE_ENV=production npm run build

prod-start: ## รัน production server
	@echo "$(GREEN)Starting production server...$(NC)"
	NODE_ENV=production npm start
