# 🚀 Running the ShorOOt Application

## Current Status

✅ **Application is running on `http://localhost:3000`**

The development server is active and ready to use, but the database needs to be configured.

---

## 📋 Prerequisites

1. **Node.js 18+** - ✅ Already installed
2. **PostgreSQL Database** - Needs setup
3. **Environment Variables** - ✅ Created (`.env.local`)

---

## 🗄️ Database Setup

The application requires a PostgreSQL database. You have two options:

### Option 1: Use Neon (Recommended for Quick Start)

Neon provides free PostgreSQL hosting with a generous free tier.

#### Steps:
1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@...`)
5. Update `.env.local`:
   ```
   DATABASE_URL="your-neon-connection-string-here"
   ```
6. Restart the dev server

### Option 2: Use Local PostgreSQL

#### On Windows:
1. Install PostgreSQL from https://www.postgresql.org/download/windows/
2. Create a database:
   ```bash
   createdb shoroot
   ```
3. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/shoroot"
   ```
4. Restart the dev server

### Option 3: Use Docker

```bash
docker run --name shoroot-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Then use in .env.local:
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
```

---

## ⚙️ Environment Configuration

The `.env.local` file has been created with the following:

```env
# Database - UPDATE THIS with your actual database URL
DATABASE_URL="postgresql://user:pass@localhost/shoroot?sslmode=disable"

# Auth - Already configured
NEXTAUTH_SECRET="super-secret-nextauth-key-12345-production-ready"
NEXTAUTH_URL="http://localhost:3000"

# Admin - Default credentials
SUPER_ADMIN_USERNAME="admin"
SUPER_ADMIN_PASSWORD="admin123"
SUPER_ADMIN_EMAIL="admin@shoroot.com"

# Telegram - Optional, for notifications
TELEGRAM_BOT_TOKEN="your-telegram-bot-token-here"
TELEGRAM_CHAT_ID="your-telegram-chat-id-here"
```

---

## 🚀 Running the Application

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 3. Initialize Database Schema

Once you have a database connection configured:

```bash
npm run db:push
```

This will:
- Create all necessary tables
- Set up relationships
- Initialize the schema

### 4. (Optional) Seed Database

To populate with test data:

```bash
npm run db:seed
```

This will create a default admin user with credentials from `.env.local`.

---

## 📊 What Happens When Running

### Development Server (`npm run dev`)

```
✓ Next.js starts on http://localhost:3000
✓ Hot reload enabled - changes reflect instantly
✓ API routes available at /api/*
✓ Database connection tested on first request
```

### After Database is Connected

You'll see:
```
✓ GET / 200  (Page loads)
✓ GET /api/bets/public 200  (Bets endpoint works)
✓ GET /api/bets/all 200  (All bets endpoint works)
```

---

## 🔧 Build for Production

To build the application for production:

```bash
npm run build
npm start
```

---

## 📝 Common Setup Issues

### Issue: "relation 'bets' does not exist"
**Cause:** Database tables haven't been created yet
**Solution:** Run `npm run db:push` after setting DATABASE_URL

### Issue: "Cannot connect to database"
**Cause:** DATABASE_URL is incorrect or database server is down
**Solution:** 
1. Verify DATABASE_URL in `.env.local`
2. Check if database server is running
3. Test connection with a database client

### Issue: "NEXTAUTH_SECRET is missing"
**Cause:** .env.local not loaded
**Solution:** Make sure `.env.local` exists in project root and has NEXTAUTH_SECRET

### Issue: Port 3000 already in use
**Cause:** Another process is using port 3000
**Solution:** 
```bash
# Kill the process or use a different port
PORT=3001 npm run dev
```

---

## 📚 Database Commands

Once your database is configured:

```bash
# Push schema changes to database
npm run db:push

# Generate migration files
npm run db:generate

# Seed database with test data
npm run db:seed
```

---

## 🎯 Quick Start Checklist

- [ ] Database URL configured in `.env.local`
- [ ] Database server is running
- [ ] Run `npm run db:push` to initialize schema
- [ ] Run `npm run db:seed` to create admin user (optional)
- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Login with admin credentials (from `.env.local`)

---

## 🔗 Useful Links

- **Neon Database**: https://neon.tech (free PostgreSQL hosting)
- **PostgreSQL**: https://www.postgresql.org
- **Next.js Docs**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team

---

## 📱 Accessing the Application

### Development
- **URL**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Dashboard**: http://localhost:3000/dashboard
- **Login**: http://localhost:3000/auth/login

### Default Admin Credentials
- **Email**: admin@shoroot.com
- **Password**: admin123
- **Username**: admin

(Can be changed in `.env.local`)

---

## 🔐 Security Notes

⚠️ **Development Only:**
- NEXTAUTH_SECRET should be unique in production
- Database credentials should be secure
- Never commit `.env.local` to version control

---

## 🎉 You're All Set!

Your application is now:
1. ✅ Running on http://localhost:3000
2. ⏳ Waiting for database configuration
3. 🚀 Ready to accept incoming requests

**Next step:** Configure your database URL in `.env.local` and run `npm run db:push`

---

## 📞 Getting Help

If you encounter issues:

1. Check the error message in the browser console
2. Check the server logs in the terminal
3. Review `.env.local` configuration
4. Ensure database server is running
5. Check network connectivity

---

**Application is ready! Configure your database and you're good to go.** 🚀
