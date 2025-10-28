# PKM Shop - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn

---

## 📝 Step-by-Step Setup

### 1. Fix npm Permissions (If needed)

If you get npm permission errors, run:

```bash
sudo chown -R $(whoami) ~/.npm
```

Or specifically:

```bash
sudo chown -R 501:20 "/Users/sumbenz/.npm"
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter any errors, try:

```bash
npm cache clean --force
npm install
```

### 3. Setup Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` and update these values:

```env
# Update with your MySQL credentials
DATABASE_URL="mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/pkm_shop"

# Generate a secure secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

# Leave as is for local development
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database

Create the database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE pkm_shop;
exit;
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

### 5. Run Development Server

```bash
npm run dev
```

Server should start at: http://localhost:3000

---

## 🧪 Verify Setup

### Test Database Connection

```bash
npx prisma studio
```

Should open Prisma Studio at http://localhost:5555

### Test Server

Visit: http://localhost:3000

You should see the homepage.

---

## 🔐 Create Admin User

After server is running, register a user and manually set them as admin:

1. Register at: http://localhost:3000/register
2. Open Prisma Studio: `npx prisma studio`
3. Go to User table
4. Find your user and change `role` to `ADMIN`

Now you can access: http://localhost:3000/dashboard

---

## ⚠️ Common Issues

### Issue: "next: command not found"

**Solution:** Run `npm install` first

### Issue: "Cannot connect to database"

**Solution:**
1. Check MySQL is running: `mysql.server status` or `brew services list`
2. Start MySQL: `mysql.server start` or `brew services start mysql`
3. Check DATABASE_URL in .env is correct

### Issue: "NEXTAUTH_SECRET is not defined"

**Solution:** Make sure .env file exists and has NEXTAUTH_SECRET set

### Issue: Prisma Client errors

**Solution:**
```bash
npx prisma generate
npx prisma migrate dev
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### Issue: npm permission errors

**Solution:**
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🗄️ Database Commands

```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database
npx prisma db pull

# Push schema without migration
npx prisma db push
```

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Generate Prisma Client
npx prisma generate
```

---

## ✅ Setup Checklist

- [ ] npm permissions fixed
- [ ] Dependencies installed (`npm install`)
- [ ] .env file created and configured
- [ ] MySQL running
- [ ] Database created
- [ ] Prisma Client generated
- [ ] Migrations applied
- [ ] Development server running
- [ ] Can access homepage
- [ ] Admin user created
- [ ] Can access dashboard

---

## 📚 Next Steps

After successful setup:

1. ✅ Review security fixes in [docs/SECURITY_FIX_REPORT.md](./docs/SECURITY_FIX_REPORT.md)
2. ✅ Check [ISSUES.md](./ISSUES.md) for remaining issues
3. ✅ Read [SECURITY_FIXES_SUMMARY.md](./SECURITY_FIXES_SUMMARY.md)

---

## 🆘 Need Help?

- Check [ISSUES.md](./ISSUES.md) for known issues
- See [docs/SECURITY_FIX_REPORT.md](./docs/SECURITY_FIX_REPORT.md) for security details
- Review [README.md](./README.md) for project overview

---

**Created:** 2025-10-28
**Status:** Ready for development after setup
