# PKM Shop - Docker Setup Guide

## สารบัญ
- [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
- [การติดตั้ง](#การติดตั้ง)
- [การใช้งาน Makefile](#การใช้งาน-makefile)
- [Docker Commands](#docker-commands)
- [การจัดการ Database](#การจัดการ-database)
- [Troubleshooting](#troubleshooting)

---

## ข้อกำหนดเบื้องต้น

ต้องติดตั้งซอฟต์แวร์ต่อไปนี้:

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Make (optional แต่แนะนำ)

ตรวจสอบการติดตั้ง:
```bash
docker --version
docker-compose --version
make --version
```

---

## การติดตั้ง

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd pkm-shop
```

### 2. สร้างไฟล์ Environment Variables
```bash
cp .env.docker .env
```

ปรับค่าใน `.env` ตามต้องการ:
```env
DB_ROOT_PASSWORD=your_secure_password
DB_NAME=pkm_shop
DB_USER=pkm_user
DB_PASSWORD=your_db_password
NEXTAUTH_SECRET=your_nextauth_secret
JWT_SECRET=your_jwt_secret
```

### 3. เริ่มต้นใช้งานด้วย Docker

#### วิธีที่ 1: ใช้ Makefile (แนะนำ)
```bash
make setup-docker
```

#### วิธีที่ 2: ใช้ Docker Compose โดยตรง
```bash
docker-compose build
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

---

## การใช้งาน Makefile

Makefile มีคำสั่งที่ใช้งานได้ดังนี้:

### แสดงคำสั่งทั้งหมด
```bash
make help
```

### Development Commands
```bash
make install          # ติดตั้ง dependencies
make dev             # รัน development server
make build           # Build โปรเจค
make start           # รัน production server
make lint            # ตรวจสอบ code style
```

### Database Commands
```bash
make migrate         # รัน Prisma migrations
make migrate-deploy  # Deploy migrations to production
make migrate-reset   # รีเซ็ต database และรัน migrations ใหม่
make generate        # Generate Prisma Client
make studio          # เปิด Prisma Studio
make seed            # ใส่ข้อมูลตัวอย่าง
make db-push         # Push schema changes to database
make db-reset        # รีเซ็ต database ทั้งหมด
```

### Docker Commands
```bash
make docker-build    # Build Docker images
make docker-up       # เริ่ม Docker containers
make docker-down     # หยุด Docker containers
make docker-restart  # รีสตาร์ท Docker containers
make docker-logs     # ดู logs ทั้งหมด
make docker-logs-app # ดู logs ของ app
make docker-logs-db  # ดู logs ของ database
make docker-ps       # แสดง status ของ containers
make docker-shell    # เข้า shell ของ app container
make docker-db-shell # เข้า MySQL shell
make docker-migrate  # รัน migrations ใน Docker
make docker-seed     # Seed database ใน Docker
make docker-clean    # ลบ containers และ volumes
make docker-rebuild  # Rebuild และรีสตาร์ท
```

### Combined Commands
```bash
make setup           # Setup โปรเจคครั้งแรก
make setup-docker    # Setup Docker environment
make fresh           # เริ่มโปรเจคใหม่ทั้งหมด
```

### Cleanup Commands
```bash
make clean           # ลบไฟล์ที่ไม่จำเป็น
make clean-all       # ลบทุกอย่างรวมถึง Docker
```

---

## Docker Commands

### การจัดการ Containers

#### เริ่ม containers
```bash
docker-compose up -d
```

#### หยุด containers
```bash
docker-compose down
```

#### รีสตาร์ท containers
```bash
docker-compose restart
```

#### ดู status
```bash
docker-compose ps
```

#### ดู logs
```bash
# ดู logs ทั้งหมด
docker-compose logs -f

# ดู logs ของ service เดียว
docker-compose logs -f app
docker-compose logs -f mysql
```

### การจัดการ Images

#### Build images
```bash
docker-compose build
```

#### Build โดยไม่ใช้ cache
```bash
docker-compose build --no-cache
```

#### ลบ images
```bash
docker-compose down --rmi all
```

### การเข้าถึง Containers

#### เข้า shell ของ app container
```bash
docker-compose exec app sh
```

#### เข้า MySQL shell
```bash
docker-compose exec mysql mysql -uroot -p
```

#### รันคำสั่งใน container
```bash
docker-compose exec app npm run build
docker-compose exec app npx prisma migrate deploy
```

---

## การจัดการ Database

### Prisma Migrations

#### สร้าง migration ใหม่
```bash
# Local
npx prisma migrate dev --name migration_name

# Docker
docker-compose exec app npx prisma migrate dev --name migration_name
```

#### Deploy migrations
```bash
# Local
npx prisma migrate deploy

# Docker
make docker-migrate
# หรือ
docker-compose exec app npx prisma migrate deploy
```

#### รีเซ็ต database
```bash
# Local
npx prisma migrate reset

# Docker
docker-compose exec app npx prisma migrate reset
```

### Prisma Studio

เปิด Prisma Studio สำหรับจัดการข้อมูล:

```bash
# Local
make studio
# หรือ
npx prisma studio

# Docker
docker-compose exec app npx prisma studio
```

### phpMyAdmin

เข้าถึง phpMyAdmin สำหรับจัดการ MySQL:

```
URL: http://localhost:8080
Username: root
Password: ตามที่ตั้งใน .env (DB_ROOT_PASSWORD)
```

### Backup และ Restore

#### Backup database
```bash
docker-compose exec mysql mysqldump -uroot -p pkm_shop > backup.sql
```

#### Restore database
```bash
docker-compose exec -T mysql mysql -uroot -p pkm_shop < backup.sql
```

---

## Services และ Ports

| Service | Port | Description |
|---------|------|-------------|
| Next.js App | 3000 | เว็บแอปพลิเคชัน |
| MySQL | 3306 | ฐานข้อมูล |
| phpMyAdmin | 8080 | จัดการฐานข้อมูล |

### URLs
- **Application**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
- **Health Check**: http://localhost:3000/api/health

---

## Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. Port ถูกใช้งานอยู่แล้ว
```bash
# ตรวจสอบ port ที่ใช้งาน
lsof -i :3000
lsof -i :3306

# แก้ไขโดยเปลี่ยน port ใน .env
APP_PORT=3001
DB_PORT=3307
```

#### 2. Database connection failed
```bash
# ตรวจสอบ MySQL container
docker-compose logs mysql

# รีสตาร์ท MySQL
docker-compose restart mysql

# ตรวจสอบ health check
docker-compose ps
```

#### 3. Prisma Client ไม่ตรงกับ schema
```bash
# Generate Prisma Client ใหม่
docker-compose exec app npx prisma generate
```

#### 4. Container ไม่ start
```bash
# ดู logs เพื่อหาสาเหตุ
docker-compose logs

# ลบและสร้างใหม่
docker-compose down -v
docker-compose up -d
```

#### 5. Out of disk space
```bash
# ลบ unused images และ containers
docker system prune -a

# ลบ volumes ที่ไม่ใช้งาน
docker volume prune
```

### การรีเซ็ตโปรเจคทั้งหมด

หากต้องการเริ่มต้นใหม่ทั้งหมด:

```bash
# ใช้ Makefile
make clean-all

# หรือ manual
docker-compose down -v
rm -rf node_modules .next
docker-compose build --no-cache
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

---

## Best Practices

### Development
1. ใช้ `make dev` สำหรับ local development
2. ใช้ Docker เมื่อต้องการ test ใน production-like environment
3. รัน `make lint` ก่อน commit

### Production
1. ตั้งค่า environment variables ที่ปลอดภัย
2. ใช้ `make docker-migrate` เพื่อ deploy migrations
3. ตรวจสอบ logs ด้วย `make docker-logs`
4. Backup database เป็นประจำ

### Database
1. สร้าง migration สำหรับทุก schema changes
2. Test migrations ใน development ก่อน
3. ใช้ `prisma studio` สำหรับดูข้อมูล
4. อย่า commit sensitive data

---

## การ Deploy

### Production Checklist

- [ ] เปลี่ยน `NODE_ENV=production`
- [ ] ตั้งค่า `NEXTAUTH_SECRET` และ `JWT_SECRET` ใหม่
- [ ] เปลี่ยน database password
- [ ] ปิด phpMyAdmin (หรือจำกัดการเข้าถึง)
- [ ] ตั้งค่า `SKIP_EMAIL_SEND=false`
- [ ] ตรวจสอบ environment variables ทั้งหมด
- [ ] Setup SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Setup monitoring และ logging
- [ ] Test health check endpoint

---

## การอัพเดทโปรเจค

```bash
# Pull code ใหม่
git pull origin main

# Rebuild containers
make docker-rebuild

# รัน migrations
make docker-migrate

# ตรวจสอบ status
make docker-ps
make docker-logs
```

---

## License

[ระบุ license ของโปรเจค]

## Support

หากมีปัญหาหรือคำถาม:
- เปิด issue ใน GitHub
- ติดต่อทีมพัฒนา
- อ่าน documentation เพิ่มเติม
