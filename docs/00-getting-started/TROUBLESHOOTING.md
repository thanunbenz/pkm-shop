# Troubleshooting Guide - PKM Shop

**Common issues and solutions for PKM Shop development**

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Environment Variables](#environment-variables)
- [Development Server Issues](#development-server-issues)
- [Authentication Issues](#authentication-issues)
- [API Issues](#api-issues)
- [Build Issues](#build-issues)
- [Performance Issues](#performance-issues)
- [Redis Issues](#redis-issues)
- [Email Issues](#email-issues)

---

## Installation Issues

### npm install fails with permission errors

**Error:**
```
EACCES: permission denied
```

**Solutions:**

```bash
# Option 1: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Option 2: Fix node_modules ownership
sudo chown -R $(whoami) node_modules

# Option 3: Clean install
rm -rf node_modules package-lock.json
npm install
```

### Node version mismatch

**Error:**
```
The engine "node" is incompatible with this module
```

**Solution:**

```bash
# Check current Node version
node --version

# Install Node 18+ using nvm
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### Package conflicts

**Error:**
```
unable to resolve dependency tree
```

**Solution:**

```bash
# Clean install with legacy peer deps
npm install --legacy-peer-deps

# Or force install
npm install --force

# Clean cache if needed
npm cache clean --force
```

---

## Database Issues

### Can't reach database server

**Error:**
```
P1001: Can't reach database server at `localhost:3306`
```

**Solutions:**

```bash
# 1. Check if MySQL is running
# macOS
brew services list | grep mysql

# Linux
sudo systemctl status mysql

# Windows
# Check Services app for MySQL

# 2. Start MySQL
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# 3. Test connection
mysql -u root -p -e "SELECT 1"

# 4. Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Database does not exist

**Error:**
```
P1003: Database `pkm_shop` does not exist
```

**Solution:**

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE pkm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# Or use Prisma
npx prisma migrate dev
```

### Authentication failed

**Error:**
```
P1000: Authentication failed against database server
```

**Solutions:**

```bash
# 1. Check credentials in DATABASE_URL
# Format: mysql://username:password@host:port/database

# 2. Reset MySQL password
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# 3. Create new user
mysql -u root -p
CREATE USER 'pkm_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON pkm_shop.* TO 'pkm_user'@'localhost';
FLUSH PRIVILEGES;
```

### Migration failed

**Error:**
```
Error applying migration: [migration details]
```

**Solutions:**

```bash
# 1. Check migration status
npx prisma migrate status

# 2. Reset database (WARNING: deletes all data)
npx prisma migrate reset

# 3. Apply migrations manually
npx prisma migrate resolve --applied [migration_name]

# 4. Create new migration
npx prisma migrate dev --name fix_migration

# 5. Force sync (development only)
npx prisma db push
```

### Prisma Client not generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**

```bash
# Generate Prisma Client
npx prisma generate

# Reinstall if needed
npm install @prisma/client
```

### Database connection pool exhausted

**Error:**
```
P2024: Timed out fetching a new connection from the connection pool
```

**Solutions:**

```bash
# 1. Increase connection limit in .env
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=20"

# 2. Check for connection leaks
# Make sure all Prisma queries use:
# - await prisma.$disconnect() when done
# - proper error handling

# 3. Restart application
npm run dev
```

---

## Environment Variables

### NEXTAUTH_SECRET missing

**Error:**
```
NEXTAUTH_SECRET is required
```

**Solutions:**

```bash
# 1. Generate secret
openssl rand -base64 32

# 2. Add to .env
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env

# 3. Verify
cat .env | grep NEXTAUTH_SECRET

# 4. Restart server
npm run dev
```

### Environment variables not loading

**Error:**
Variables in `.env` not being read

**Solutions:**

```bash
# 1. Check .env file exists in project root
ls -la .env

# 2. Verify file permissions
chmod 644 .env

# 3. Check for spaces in .env
# Wrong: KEY = "value"
# Correct: KEY="value"

# 4. Restart development server
# Stop server (Ctrl+C)
npm run dev

# 5. Check for .env.local (takes precedence)
ls -la .env.local
```

### RESEND_API_KEY validation failed

**Error:**
```
Invalid RESEND_API_KEY format
```

**Solution:**

```bash
# 1. Get API key from https://resend.com
# Must start with "re_"

# 2. Add to .env
RESEND_API_KEY="re_your_key_here"

# 3. Verify format
cat .env | grep RESEND_API_KEY

# Key should look like: re_AbCdEfGh123_456789
```

---

## Development Server Issues

### Port already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

```bash
# Option 1: Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Option 2: Use different port
PORT=3001 npm run dev

# Option 3: Find and kill manually
lsof -i :3000
kill -9 <PID>
```

### Server won't start

**Error:**
```
Various startup errors
```

**Solutions:**

```bash
# 1. Check for syntax errors
npm run lint

# 2. Check TypeScript errors
npx tsc --noEmit

# 3. Clear Next.js cache
rm -rf .next

# 4. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 5. Check Node version
node --version  # Should be 18+
```

### Hot reload not working

**Issue:**
Changes not reflected in browser

**Solutions:**

```bash
# 1. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart development server
# Stop server (Ctrl+C)
npm run dev

# 4. Check file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Memory issues

**Error:**
```
JavaScript heap out of memory
```

**Solutions:**

```bash
# Option 1: Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Option 2: Add to package.json scripts
{
  "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
}

# Option 3: Close other applications
# Check memory usage: top or Activity Monitor
```

---

## Authentication Issues

### Session not persisting

**Issue:**
User logged out after page refresh

**Solutions:**

```bash
# 1. Check NEXTAUTH_SECRET is set
cat .env | grep NEXTAUTH_SECRET

# 2. Check cookies are enabled in browser

# 3. Check NEXTAUTH_URL matches current URL
# Development: http://localhost:3000
# Production: https://yourdomain.com

# 4. Clear browser cookies for localhost

# 5. Check session configuration
# src/lib/auth/options.ts
```

### Login fails silently

**Issue:**
Login form submits but nothing happens

**Solutions:**

```bash
# 1. Check browser console for errors (F12)

# 2. Check database for user
mysql -u root -p pkm_shop -e "SELECT * FROM user WHERE email='your@email.com'"

# 3. Check password hash
# Make sure bcrypt is working

# 4. Check API logs
npm run dev | grep -i "auth"

# 5. Test API directly
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

### "Unauthorized" errors

**Error:**
```
401 Unauthorized
```

**Solutions:**

```bash
# 1. Check if logged in
# Open browser DevTools -> Application -> Cookies
# Look for next-auth.session-token

# 2. Check token validity
# Token might be expired

# 3. Login again
# Clear cookies and re-authenticate

# 4. Check middleware
# middleware.ts might be blocking the route
```

---

## API Issues

### CORS errors

**Error:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions:**

```bash
# 1. Check ALLOWED_ORIGINS in .env
cat .env | grep ALLOWED_ORIGINS

# 2. Add origin to .env
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# 3. Check CORS configuration
# src/config/cors.ts

# 4. Restart server
npm run dev

# 5. In development, localhost is auto-allowed
# Make sure you're using http://localhost:3000
```

### Rate limit exceeded

**Error:**
```
429 Too Many Requests
```

**Solutions:**

```bash
# 1. Wait for rate limit to reset
# Check Retry-After header

# 2. Increase rate limits (development only)
# Edit src/config/app-constants.ts
export const RATE_LIMITS = {
  GENERAL_API: 100,  # Increase from 30
}

# 3. Reset rate limits in Redis
# Connect to Redis and run: FLUSHDB

# 4. Disable rate limiting temporarily
ENABLE_REDIS_RATE_LIMIT=false npm run dev
```

### API returns 500 error

**Error:**
```
500 Internal Server Error
```

**Solutions:**

```bash
# 1. Check server logs
npm run dev
# Look for error stack trace

# 2. Check database connection
mysql -u root -p -e "SELECT 1"

# 3. Enable debug logging
# Add to .env
NODE_ENV=development

# 4. Check API route file for errors
# src/app/api/v1/[endpoint]/route.ts

# 5. Test with Postman/curl
curl -i http://localhost:3000/api/v1/products
```

### Validation errors

**Error:**
```
400 Bad Request - Validation failed
```

**Solutions:**

```bash
# 1. Check request body format
# Must be valid JSON
# Content-Type: application/json

# 2. Check required fields
# See API documentation at /api-docs

# 3. Check field types
# email must be valid email
# numbers must be numbers, not strings

# 4. Check validation schemas
# src/lib/validations/

# Example valid request:
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "price": 100.00,
    "description": "Description"
  }'
```

---

## Build Issues

### Build fails

**Error:**
```
npm run build fails with errors
```

**Solutions:**

```bash
# 1. Check for TypeScript errors
npx tsc --noEmit

# 2. Fix linting errors
npm run lint -- --fix

# 3. Clear caches
rm -rf .next
rm -rf node_modules/.cache

# 4. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 5. Check for missing environment variables
# Build needs all required env vars

# 6. Build with verbose output
npm run build -- --debug
```

### TypeScript errors

**Error:**
```
Type errors during build
```

**Solutions:**

```bash
# 1. Regenerate Prisma types
npx prisma generate

# 2. Restart TypeScript server (VS Code)
# Cmd+Shift+P -> TypeScript: Restart TS Server

# 3. Check tsconfig.json
cat tsconfig.json

# 4. Install missing type definitions
npm install --save-dev @types/package-name

# 5. Check for any type
# Replace 'any' with proper types
```

### Missing modules in production

**Error:**
```
Cannot find module '...'
```

**Solutions:**

```bash
# 1. Check dependencies vs devDependencies
# Build dependencies should be in dependencies, not devDependencies

# 2. Move to dependencies if needed
npm install --save package-name

# 3. Reinstall
npm ci

# 4. Check .npmrc file
# Make sure it's not excluding packages
```

---

## Performance Issues

### Slow page loads

**Issue:**
Pages take long to load

**Solutions:**

```bash
# 1. Check database queries
# Use Prisma Studio to inspect queries
npx prisma studio

# 2. Add database indexes
# See prisma/schema.prisma

# 3. Enable Redis caching
# Set up Upstash or local Redis

# 4. Check network tab in browser DevTools
# Look for slow API requests

# 5. Use Next.js built-in analytics
# Add to next.config.js:
experimental: {
  optimizeCss: true,
  optimizePackageImports: ['@/components'],
}
```

### High memory usage

**Issue:**
Application uses too much memory

**Solutions:**

```bash
# 1. Check for memory leaks
# Use Node.js profiler

# 2. Limit database connections
# In .env:
DATABASE_URL="...?connection_limit=10"

# 3. Close unused connections
# Make sure to call prisma.$disconnect()

# 4. Restart application regularly
# Set up PM2 or similar process manager

# 5. Increase server memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Slow database queries

**Issue:**
Database queries are slow

**Solutions:**

```bash
# 1. Add indexes
# Edit prisma/schema.prisma
# Add @@index([field_name])

# 2. Use query optimization
# Use 'select' to fetch only needed fields
# Use 'include' instead of multiple queries

# 3. Enable query logging
# In prisma/schema.prisma:
generator client {
  provider = "prisma-client-js"
  log      = ["query"]
}

# 4. Analyze slow queries
# Check MySQL slow query log

# 5. Consider pagination
# Use cursor-based pagination for large datasets
```

---

## Redis Issues

### Redis connection failed

**Error:**
```
Redis client not available
```

**Solutions:**

This is **not critical** - application falls back to in-memory rate limiting.

To fix:

```bash
# Option 1: Set up Upstash Redis (recommended)
# 1. Go to https://console.upstash.com
# 2. Create free Redis database
# 3. Add to .env:
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Option 2: Run local Redis
docker run -d -p 6379:6379 redis:latest
# Add to .env:
REDIS_URL="redis://localhost:6379"

# Option 3: Install ioredis for traditional Redis
npm install ioredis

# Option 4: Disable Redis (use in-memory)
ENABLE_REDIS_RATE_LIMIT=false
```

### Redis timeout

**Error:**
```
Redis connection timeout
```

**Solutions:**

```bash
# 1. Check Redis is running
redis-cli ping  # Should return PONG

# 2. Check network connectivity
telnet localhost 6379

# 3. Increase timeout in client config
# src/lib/redis/client.ts
connectTimeout: 10000,  # 10 seconds

# 4. Check firewall rules
# Make sure port 6379 is open

# 5. Use Upstash instead
# More reliable for production
```

---

## Email Issues

### Emails not sending

**Issue:**
Resend emails not being sent

**Solutions:**

```bash
# 1. Check RESEND_API_KEY is set
cat .env | grep RESEND_API_KEY

# 2. Verify API key is valid
# Login to https://resend.com/api-keys

# 3. Check sender domain is verified
# Go to https://resend.com/domains

# 4. Check email logs
# Check server logs for errors

# 5. Test with Resend API directly
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your@email.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

### Email validation errors

**Error:**
```
Invalid email format
```

**Solutions:**

```bash
# 1. Check EMAIL_FROM format
# Must be: "name@domain.com" or "Name <name@domain.com>"

# 2. Domain must be verified in Resend
# Free tier: use resend.dev domain
EMAIL_FROM="onboarding@resend.dev"

# 3. For custom domain, verify in Resend
# https://resend.com/domains

# 4. Check recipient email is valid
# Test with your own email first
```

---

## Getting More Help

### Check Logs

```bash
# Development logs
npm run dev

# Filter logs
npm run dev | grep -i "error"

# Production logs (if using PM2)
pm2 logs pkm-shop

# Database logs
tail -f /var/log/mysql/error.log
```

### Enable Debug Mode

```bash
# Add to .env
NODE_ENV=development
DEBUG=*

# Run with debugging
npm run dev
```

### Useful Commands

```bash
# Check system status
npm run dev | grep -E "(✅|❌|⚠️)"

# Test database connection
npx prisma db pull

# Test Redis connection
redis-cli ping

# Check port usage
lsof -i :3000

# Check disk space
df -h

# Check memory
free -h  # Linux
top      # macOS
```

### Still Having Issues?

1. ✅ Check [Developer Setup Guide](DEVELOPER_SETUP.md)
2. ✅ Check [Quick Start Guide](QUICK_START.md)
3. ✅ Search issues in project repository
4. ✅ Check documentation in `/docs`
5. ✅ Enable debug logging
6. ✅ Ask in team chat (if available)
7. ✅ Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Relevant logs

---

**Last Updated:** 2025-01-06
**Version:** 1.0.0
