# Production Deployment Guide

**Last Updated:** 2025-11-07
**Version:** 3.0.0
**Difficulty:** Intermediate

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Database Setup](#database-setup)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code reviewed and approved

### Security

- [ ] All environment variables set
- [ ] Secrets rotated (JWT_SECRET, NEXTAUTH_SECRET)
- [ ] Database credentials secured
- [ ] API keys configured
- [ ] CORS origins whitelisted
- [ ] Rate limiting configured
- [ ] File upload limits set

### Database

- [ ] Production database created
- [ ] Migrations applied
- [ ] Seed data loaded (if needed)
- [ ] Backups configured
- [ ] Connection pooling sized
- [ ] Indexes verified

### Performance

- [ ] Images optimized
- [ ] Bundle size analyzed
- [ ] Lighthouse score checked
- [ ] API response times tested
- [ ] Database queries optimized

---

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.production` file with all required variables:

```bash
# =============================================================================
# CORE CONFIGURATION
# =============================================================================

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# =============================================================================
# AUTHENTICATION
# =============================================================================

# NextAuth.js Configuration
NEXTAUTH_SECRET="[GENERATE: openssl rand -base64 32]"
NEXTAUTH_URL=https://yourdomain.com

# JWT Secret (for custom tokens)
JWT_SECRET="[GENERATE: openssl rand -base64 32]"

# =============================================================================
# DATABASE
# =============================================================================

# MySQL Connection String
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://user:password@host:3306/pkm_shop"

# Connection Pool Settings (optional)
# DATABASE_POOL_MIN=2
# DATABASE_POOL_MAX=10

# =============================================================================
# EMAIL SERVICE
# =============================================================================

# SendGrid Configuration (Primary)
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_SUPPORT="support@yourdomain.com"

# =============================================================================
# RATE LIMITING & CACHING
# =============================================================================

# Redis Configuration (Recommended for production)
# Option 1: Upstash (Serverless Redis)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Option 2: Traditional Redis
# REDIS_URL="redis://user:password@host:6379"

# =============================================================================
# CORS CONFIGURATION
# =============================================================================

# Allowed Origins (comma-separated)
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# =============================================================================
# ERROR TRACKING
# =============================================================================

# Sentry DSN (Optional but recommended)
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# =============================================================================
# ADMIN CONFIGURATION
# =============================================================================

# Default Admin Email (for initial setup)
ADMIN_EMAIL="admin@yourdomain.com"

# =============================================================================
# SECURITY & ID OBFUSCATION
# =============================================================================

# User ID Base (default: 10000000000)
USER_ID_BASE="10000000000"

# Order ID Prefix (default: 702)
ORDER_ID_PREFIX="702"

# =============================================================================
# FILE UPLOADS
# =============================================================================

# Max file size in bytes (default: 5MB)
MAX_FILE_SIZE=5242880

# Upload directory
UPLOAD_DIR="./public/uploads"
```

### Environment Variable Generation

```bash
# Generate secure random secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For JWT_SECRET

# Verify all required variables are set
node -e "require('dotenv').config(); console.log(process.env)" | grep -E "(NEXTAUTH_SECRET|DATABASE_URL|SENDGRID_API_KEY)"
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

#### Advantages
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Easy rollbacks
- ✅ Free tier available

#### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   cd pkm-shop
   vercel link
   ```

4. **Set Environment Variables**
   ```bash
   # Via CLI
   vercel env add NEXTAUTH_SECRET production
   vercel env add DATABASE_URL production
   vercel env add SENDGRID_API_KEY production
   # ... add all required variables

   # Or via Vercel Dashboard
   # Settings → Environment Variables
   ```

5. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod

   # Or push to main branch (automatic deployment)
   git push origin main
   ```

6. **Configure Custom Domain**
   - Go to Vercel Dashboard
   - Settings → Domains
   - Add your custom domain
   - Update DNS records

#### Database Setup for Vercel

**Recommended Options:**

1. **PlanetScale** (MySQL-compatible, serverless)
   ```bash
   # Create database
   pscale database create pkm-shop --region us-east

   # Create production branch
   pscale branch create pkm-shop production

   # Get connection string
   pscale connect pkm-shop production --execute "SELECT 1"
   ```

2. **Railway** (Simple MySQL hosting)
   - Create new project
   - Add MySQL database
   - Copy connection string

3. **Digital Ocean Managed Database**
   - Create managed MySQL cluster
   - Whitelist Vercel IPs
   - Copy connection string

---

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:password@db:3306/pkm_shop
    env_file:
      - .env.production
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: pkm_shop
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
```

#### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

### Option 3: Traditional VPS (Ubuntu/Debian)

#### Server Requirements

- **OS**: Ubuntu 22.04 LTS or Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 20GB minimum
- **Node.js**: 20.x LTS

#### Setup Steps

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js 20**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   node --version  # Should show v20.x
   ```

3. **Install MySQL**
   ```bash
   sudo apt install -y mysql-server
   sudo mysql_secure_installation
   ```

4. **Install Redis (Optional)**
   ```bash
   sudo apt install -y redis-server
   sudo systemctl enable redis-server
   ```

5. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

6. **Clone & Setup Application**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/pkm-shop.git
   cd pkm-shop
   npm install
   npm run build
   ```

7. **Setup Environment**
   ```bash
   cp .env.example .env.production
   nano .env.production  # Edit with production values
   ```

8. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

9. **Start with PM2**
   ```bash
   pm2 start npm --name "pkm-shop" -- start
   pm2 startup
   pm2 save
   ```

10. **Setup Nginx Reverse Proxy**
    ```nginx
    # /etc/nginx/sites-available/pkm-shop
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # File upload size
        client_max_body_size 10M;
    }
    ```

    ```bash
    sudo ln -s /etc/nginx/sites-available/pkm-shop /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```

11. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```

---

## 🗄️ Database Setup

### Run Migrations

```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Verify database
npx prisma db pull
```

### Create Indexes

The following indexes should be created automatically via migrations, but verify:

```sql
-- Product search indexes
SHOW INDEXES FROM Product;

-- Should include:
-- - product_search_idx (FULLTEXT on name, description)
-- - Product_price_idx
-- - Product_createdAt_idx
-- - Product_category_idx
-- - Product_issale_idx
```

### Seed Initial Data (Optional)

```bash
# Run seed script
npm run seed

# Or manually create admin user via Prisma Studio
npx prisma studio
```

---

## 📊 Post-Deployment Steps

### 1. Verify Deployment

```bash
# Check if site is accessible
curl -I https://yourdomain.com

# Test API endpoints
curl https://yourdomain.com/api/health

# Check database connection
curl https://yourdomain.com/api/v1/products
```

### 2. Setup Monitoring

**Error Tracking (Sentry)**
```bash
# Verify Sentry is configured
curl https://sentry.io/api/0/projects/YOUR_ORG/YOUR_PROJECT/
```

**Uptime Monitoring**
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com
- StatusCake: https://www.statuscake.com

### 3. Configure Backups

**Database Backups**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u user -p pkm_shop > backup_$DATE.sql
gzip backup_$DATE.sql

# Upload to S3 or backup service
aws s3 cp backup_$DATE.sql.gz s3://your-bucket/backups/
```

**Automated Backups**
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### 4. Performance Tuning

**Next.js Configuration**
```js
// next.config.js
module.exports = {
  // Enable compression
  compress: true,

  // Enable SWC minification
  swcMinify: true,

  // Reduce bundle size
  output: 'standalone',

  // Image optimization
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}
```

**Database Connection Pooling**
```env
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10"
```

### 5. Security Hardening

**HTTP Security Headers**
```js
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

---

## 📈 Monitoring & Maintenance

### Application Monitoring

**PM2 Monitoring (VPS)**
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs pkm-shop

# Restart if needed
pm2 restart pkm-shop

# View metrics
pm2 describe pkm-shop
```

**Vercel Monitoring**
- Dashboard → Analytics
- Real-time visitor tracking
- Error tracking
- Performance metrics

### Log Monitoring

**Winston Logs**
```bash
# View production logs
tail -f /var/log/pkm-shop/combined.log
tail -f /var/log/pkm-shop/error.log

# Search for errors
grep "error" /var/log/pkm-shop/combined.log
```

### Performance Metrics

**Key Metrics to Monitor:**
- Response time (target: <200ms)
- Error rate (target: <0.1%)
- CPU usage (target: <70%)
- Memory usage (target: <80%)
- Database query time (target: <50ms)

### Regular Maintenance

**Weekly:**
- [ ] Review error logs
- [ ] Check disk space
- [ ] Monitor API response times
- [ ] Review security alerts

**Monthly:**
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Test backups
- [ ] Security audit
- [ ] Database optimization

**Quarterly:**
- [ ] Rotate secrets
- [ ] Review access controls
- [ ] Update documentation
- [ ] Disaster recovery drill

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 2. Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Check environment variable
echo $DATABASE_URL

# Verify MySQL is running
sudo systemctl status mysql

# Check connection from app server
telnet db-host 3306
```

#### 3. Memory Issues

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Or in package.json
{
  "scripts": {
    "start": "NODE_OPTIONS='--max-old-space-size=4096' next start"
  }
}
```

#### 4. Slow Performance

```bash
# Enable production mode
NODE_ENV=production npm start

# Check bundle size
npm run build

# Analyze bundle
npx @next/bundle-analyzer
```

---

## 📞 Support

**Issues:**
- GitHub Issues: https://github.com/yourusername/pkm-shop/issues
- Email: support@yourdomain.com

**Documentation:**
- [Quick Start](./QUICK_START.md)
- [Developer Setup](./DEVELOPER_SETUP.md)
- [Architecture](../01-project/ARCHITECTURE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

**Last Updated:** 2025-11-07
**Maintained by:** PKM Shop Development Team
