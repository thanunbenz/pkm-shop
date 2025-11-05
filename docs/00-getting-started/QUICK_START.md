# Quick Start Guide - PKM Shop

**Get PKM Shop running in under 5 minutes!**

## Prerequisites

- Node.js 18+ installed
- MySQL 8+ installed and running
- Git installed

## Quick Setup

### 1. Clone and Install (1 minute)

```bash
# Clone repository
git clone <repository-url> pkm-shop
cd pkm-shop

# Install dependencies
npm install
```

### 2. Configure Environment (2 minutes)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set these REQUIRED variables:
# - DATABASE_URL (MySQL connection string)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - RESEND_API_KEY (get from https://resend.com)
# - EMAIL_FROM (your email address)
```

**Minimum .env configuration:**

```bash
DATABASE_URL="mysql://root:password@localhost:3306/pkm_shop"
NEXTAUTH_SECRET="your-generated-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"
```

### 3. Setup Database (1 minute)

```bash
# Create database and run migrations
npx prisma migrate dev

# Seed database with sample data (optional)
npm run seed
```

### 4. Start Development Server (30 seconds)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## ✅ You're Done!

The application should now be running at `http://localhost:3000`

### Default Admin Account

If you ran the seed command:

```
Email: admin@pkmshop.com
Password: admin123
```

## Next Steps

- [Complete Developer Setup Guide](DEVELOPER_SETUP.md) - Detailed setup instructions
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Common issues and solutions
- [Architecture Overview](../01-project/ARCHITECTURE.md) - System architecture
- [API Documentation](http://localhost:3000/api-docs) - Interactive API docs (after starting server)

## Common Issues

### Database Connection Failed

```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Create database manually
mysql -u root -p -e "CREATE DATABASE pkm_shop"
```

### Port 3000 Already in Use

```bash
# Use different port
PORT=3001 npm run dev
```

### Missing Environment Variables

Check startup logs for validation errors:

```bash
npm run dev | grep -i "validation"
```

## Quick Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open database GUI
npx prisma migrate   # Run database migrations
npm run seed         # Seed sample data

# Testing
npm test             # Run tests
npm run lint         # Run ESLint
```

## Need Help?

- 📖 [Complete Setup Guide](DEVELOPER_SETUP.md)
- 🐛 [Troubleshooting](TROUBLESHOOTING.md)
- 📚 [Full Documentation](../README.md)

---

**Estimated Time:** < 5 minutes
**Last Updated:** 2025-01-06
