# =============================================================================
# Makefile for PKM Shop
# =============================================================================

.PHONY: help dev dev-clean build start lint lint-fix test test-watch test-ui type-check check-all \
	install generate migrate migrate-deploy migrate-reset seed studio db-push db-reset db-backup db-restore \
	docker-build docker-up docker-down docker-restart docker-logs docker-logs-app docker-logs-db \
	docker-ps docker-shell docker-db-shell docker-migrate docker-seed docker-clean docker-rebuild docker-prune \
	setup setup-docker fresh clean clean-all clean-logs prod-build prod-start

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
YELLOW := \033[1;33m
GREEN := \033[1;32m
RED := \033[1;31m
BLUE := \033[1;34m
CYAN := \033[1;36m
NC := \033[0m # No Color

# Project variables
PROJECT_NAME := pkm-shop
TIMESTAMP := $(shell date +%Y%m%d_%H%M%S)

# =============================================================================
# Help
# =============================================================================
help: ## แสดงคำสั่งที่ใช้ได้ทั้งหมด
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║$(NC)  $(GREEN)PKM Shop - Makefile Commands$(NC)                           $(CYAN)║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(BLUE)📦 Development:$(NC)"
	@grep -E '^(dev|dev-clean|build|start|lint|lint-fix|test|test-watch|test-ui|type-check|check-all):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)🗄️  Database & Prisma:$(NC)"
	@grep -E '^(install|generate|migrate|migrate-deploy|migrate-reset|seed|studio|db-push|db-reset|db-backup|db-restore):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)🐳 Docker:$(NC)"
	@grep -E '^(docker-build|docker-up|docker-down|docker-restart|docker-logs|docker-logs-app|docker-logs-db|docker-ps|docker-shell|docker-db-shell|docker-migrate|docker-seed|docker-clean|docker-rebuild|docker-prune):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)🚀 Setup & Cleanup:$(NC)"
	@grep -E '^(setup|setup-docker|fresh|clean|clean-all|clean-logs|prod-build|prod-start):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(CYAN)💡 Tip: Run 'make <command>' to execute$(NC)"
	@echo ""

# =============================================================================
# Local Development
# =============================================================================
install: ## ติดตั้ง dependencies
	@echo "$(GREEN)📦 Installing dependencies...$(NC)"
	npm install

dev: ## รัน development server
	@echo "$(GREEN)🚀 Starting development server...$(NC)"
	npm run dev

dev-clean: ## รัน dev server (ลบ .next cache ก่อน)
	@echo "$(YELLOW)🧹 Cleaning .next cache...$(NC)"
	npm run dev:clean

build: ## Build โปรเจค
	@echo "$(GREEN)🔨 Building project...$(NC)"
	npm run build

start: ## รัน production server
	@echo "$(GREEN)▶️  Starting production server...$(NC)"
	npm start

lint: ## ตรวจสอบ code style
	@echo "$(BLUE)🔍 Running linter...$(NC)"
	npm run lint

lint-fix: ## แก้ไข code style อัตโนมัติ
	@echo "$(BLUE)🔧 Fixing linter issues...$(NC)"
	npm run lint -- --fix

test: ## รัน tests ทั้งหมด
	@echo "$(GREEN)🧪 Running tests...$(NC)"
	npm run test

test-watch: ## รัน tests แบบ watch mode
	@echo "$(GREEN)👀 Running tests in watch mode...$(NC)"
	npm run test:watch

test-ui: ## รัน tests พร้อม UI
	@echo "$(GREEN)🎨 Running tests with UI...$(NC)"
	npm run test:ui

type-check: ## ตรวจสอบ TypeScript types
	@echo "$(BLUE)📝 Checking TypeScript types...$(NC)"
	npx tsc --noEmit

check-all: lint type-check test ## รันการตรวจสอบทั้งหมด (lint + type + test)
	@echo "$(GREEN)✅ All checks passed!$(NC)"

# =============================================================================
# Database & Prisma
# =============================================================================
generate: ## Generate Prisma Client
	@echo "$(GREEN)⚙️  Generating Prisma Client...$(NC)"
	npx prisma generate

migrate: ## รัน Prisma migrations (dev)
	@echo "$(GREEN)🔄 Running Prisma migrations...$(NC)"
	npx prisma migrate dev

migrate-deploy: ## Deploy migrations to production
	@echo "$(GREEN)🚀 Deploying migrations...$(NC)"
	npx prisma migrate deploy

migrate-reset: ## รีเซ็ต database และรัน migrations ใหม่
	@echo "$(RED)⚠️  Resetting database...$(NC)"
	npx prisma migrate reset

seed: ## ใส่ข้อมูลตัวอย่างลง database
	@echo "$(GREEN)🌱 Seeding database...$(NC)"
	npm run seed

studio: ## เปิด Prisma Studio
	@echo "$(CYAN)🎨 Opening Prisma Studio...$(NC)"
	@echo "$(YELLOW)Access at: http://localhost:5555$(NC)"
	npx prisma studio

db-push: ## Push schema changes to database (ไม่สร้าง migration)
	@echo "$(GREEN)📤 Pushing schema to database...$(NC)"
	npx prisma db push

db-reset: ## รีเซ็ต database ทั้งหมด (force)
	@echo "$(RED)🗑️  Resetting entire database...$(NC)"
	npx prisma migrate reset --force

db-backup: ## Backup database เป็น SQL file
	@echo "$(GREEN)💾 Backing up database...$(NC)"
	@mkdir -p backups
	docker-compose exec -T mysql mysqldump -uroot -p$${DB_ROOT_PASSWORD:-sumbenz2806} pkm_shop > backups/backup_$(TIMESTAMP).sql
	@echo "$(GREEN)✅ Backup saved to: backups/backup_$(TIMESTAMP).sql$(NC)"

db-restore: ## Restore database จาก backup (ใช้: make db-restore FILE=backup.sql)
	@echo "$(YELLOW)🔄 Restoring database from $(FILE)...$(NC)"
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Error: Please specify FILE=<backup.sql>$(NC)"; \
		exit 1; \
	fi
	docker-compose exec -T mysql mysql -uroot -p$${DB_ROOT_PASSWORD:-sumbenz2806} pkm_shop < $(FILE)
	@echo "$(GREEN)✅ Database restored from $(FILE)$(NC)"

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
	@echo "$(YELLOW)🔄 Rebuilding and restarting containers...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

docker-prune: ## ลบ Docker resources ที่ไม่ใช้งาน (images, volumes, networks)
	@echo "$(RED)🧹 Cleaning up unused Docker resources...$(NC)"
	docker system prune -af
	docker volume prune -f
	@echo "$(GREEN)✅ Docker cleanup complete!$(NC)"

# =============================================================================
# Combined Commands
# =============================================================================
setup: install generate ## Setup โปรเจคครั้งแรก
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║$(NC)  $(GREEN)✅ Project Setup Complete!$(NC)                             $(CYAN)║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)📝 Next steps:$(NC)"
	@echo "  1. Copy .env.docker to .env and configure"
	@echo "  2. Run 'make migrate' to setup database"
	@echo "  3. Run 'make dev' to start development server"
	@echo ""

setup-docker: docker-build docker-up docker-migrate ## Setup Docker environment
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║$(NC)  $(GREEN)✅ Docker Environment Ready!$(NC)                           $(CYAN)║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)🌐 Access Points:$(NC)"
	@echo "  • Application:  $(CYAN)http://localhost:3000$(NC)"
	@echo "  • phpMyAdmin:   $(CYAN)http://localhost:8080$(NC)"
	@echo "  • Health Check: $(CYAN)http://localhost:3000/api/health$(NC)"
	@echo "  • API Docs:     $(CYAN)http://localhost:3000/api-docs$(NC)"
	@echo ""
	@echo "$(YELLOW)💡 Useful commands:$(NC)"
	@echo "  • make docker-logs     - View all logs"
	@echo "  • make docker-shell    - Enter app container"
	@echo "  • make docker-ps       - Check container status"
	@echo ""

fresh: clean install generate migrate seed ## เริ่มโปรเจคใหม่ทั้งหมด
	@echo "$(GREEN)✅ Fresh installation complete!$(NC)"

# =============================================================================
# Cleanup
# =============================================================================
clean: ## ลบไฟล์ที่ไม่จำเป็น (node_modules, .next, etc.)
	@echo "$(RED)🧹 Cleaning project files...$(NC)"
	@rm -rf node_modules
	@rm -rf .next
	@rm -rf dist
	@rm -rf .turbo
	@echo "$(GREEN)✅ Project cleaned!$(NC)"

clean-logs: ## ลบ log files ทั้งหมด
	@echo "$(YELLOW)🗑️  Cleaning log files...$(NC)"
	@rm -rf logs/*
	@touch logs/.gitkeep
	@echo "$(GREEN)✅ Logs cleaned!$(NC)"

clean-all: clean clean-logs docker-clean ## ลบทุกอย่าง (project + docker + logs)
	@echo "$(GREEN)✅ Complete cleanup done!$(NC)"

# =============================================================================
# Production Commands
# =============================================================================
prod-build: ## Build สำหรับ production
	@echo "$(GREEN)🏗️  Building for production...$(NC)"
	NODE_ENV=production npm run build
	@echo "$(GREEN)✅ Production build complete!$(NC)"

prod-start: ## รัน production server
	@echo "$(GREEN)🚀 Starting production server...$(NC)"
	NODE_ENV=production npm start

# =============================================================================
# Quality & Verification
# =============================================================================
verify: lint type-check ## ตรวจสอบ code quality (lint + types)
	@echo "$(GREEN)✅ Code verification passed!$(NC)"

verify-all: verify test ## ตรวจสอบทั้งหมด (lint + types + tests)
	@echo "$(GREEN)✅ All verifications passed!$(NC)"

ci: install generate verify-all build ## รัน CI pipeline (install + verify + build)
	@echo "$(GREEN)✅ CI pipeline completed successfully!$(NC)"

# =============================================================================
# Docker Utilities
# =============================================================================
docker-health: ## ตรวจสอบ health ของ containers
	@echo "$(BLUE)🏥 Checking container health...$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(BLUE)📊 Container stats:$(NC)"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(shell docker-compose ps -q) 2>/dev/null || echo "No containers running"

docker-size: ## แสดงขนาดของ Docker images
	@echo "$(BLUE)📦 Docker image sizes:$(NC)"
	@docker images | grep $(PROJECT_NAME) || echo "No images found"

# =============================================================================
# Development Utilities
# =============================================================================
ports: ## แสดง ports ที่ใช้งาน
	@echo "$(BLUE)🔌 Active ports:$(NC)"
	@echo "$(YELLOW)Application:$(NC) 3000"
	@echo "$(YELLOW)MySQL:$(NC)       3306"
	@echo "$(YELLOW)phpMyAdmin:$(NC)  8080"
	@echo "$(YELLOW)Prisma Studio:$(NC) 5555"
	@echo ""
	@echo "$(BLUE)🔍 Checking port availability:$(NC)"
	@lsof -i :3000 || echo "  Port 3000: ✅ Available"
	@lsof -i :3306 || echo "  Port 3306: ✅ Available"
	@lsof -i :8080 || echo "  Port 8080: ✅ Available"

status: ## แสดงสถานะของโปรเจค
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║$(NC)  $(GREEN)PKM Shop - Project Status$(NC)                             $(CYAN)║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(BLUE)📊 Project Info:$(NC)"
	@echo "  • Name:    $(PROJECT_NAME)"
	@echo "  • Node:    $$(node --version 2>/dev/null || echo 'Not installed')"
	@echo "  • npm:     $$(npm --version 2>/dev/null || echo 'Not installed')"
	@echo ""
	@echo "$(BLUE)🐳 Docker Status:$(NC)"
	@docker-compose ps 2>/dev/null || echo "  Docker not running"
	@echo ""
	@echo "$(BLUE)📦 Dependencies:$(NC)"
	@[ -d "node_modules" ] && echo "  ✅ node_modules installed" || echo "  ❌ node_modules not found (run 'make install')"
	@[ -f ".next/BUILD_ID" ] && echo "  ✅ Project built" || echo "  ⚠️  Project not built (run 'make build')"
	@echo ""
