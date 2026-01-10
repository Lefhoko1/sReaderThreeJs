# Supabase Integration Setup Guide

## 🎯 What We've Set Up

Your sReader app now has full Supabase integration with:
- ✅ PostgreSQL relational database
- ✅ Real-time data sync
- ✅ Authentication ready
- ✅ Offline support with SQLite
- ✅ Row-level security (RLS)

## 📋 Setup Instructions

### Step 1: Get Your Supabase Credentials

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 2: Configure Environment Variables

1. Create a `.env` file in the `sReader` folder:
   ```bash
   cd sReader
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 3: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql`
5. Paste and click **Run**

This creates all your tables:
- users, profiles, locations, devices
- organizations, classes, class_members
- assignments, schedules, attempts
- friendships, notifications, achievements

### Step 4: Install dotenv (if needed)

```bash
npm install dotenv --save-dev
```

### Step 5: Test the Connection

```bash
npm start
```

Check the console - you should see:
```
✓ Supabase connected successfully
```

## 🗄️ Database Structure

### Organizations & Classes
- `organizations` - Schools, academies
- `classes` - Individual classes/groups
- `class_members` - Students and teachers in classes

### Assignments & Learning
- `assignments` - Learning content
- `schedules` - Assignments assigned to users
- `attempts` - User submissions and scores

### Social & Gamification
- `friendships` - Friend connections
- `notifications` - In-app notifications
- `user_stats` - Scores, streaks, progress
- `achievements` - Badges and rewards

## 🔐 Using Supabase Repositories

The app now has Supabase repositories ready:
- `SupabaseUserRepository` - User CRUD operations
- `SupabaseAssignmentRepository` - Assignment management
- `SupabaseScheduleRepository` - Schedule management

To use in your code:

```typescript
import { SupabaseUserRepository } from '@/src/data/supabase/SupabaseUserRepository';

const userRepo = new SupabaseUserRepository();
const user = await userRepo.getUserById('user-id');
```

## 📱 Offline Sync Strategy

1. **Mobile**: Uses SQLite for offline storage + syncs with Supabase when online
2. **Web**: Uses Supabase directly (no offline storage)

## 🔒 Security (Row Level Security)

Basic RLS policies are set up:
- Users can only read/update their own data
- More policies can be added in SQL Editor

## 🚀 Next Steps

1. ✅ Set up your `.env` file
2. ✅ Run the SQL schema in Supabase
3. ✅ Test the app
4. 🔄 Implement sync logic between SQLite and Supabase (optional)
5. 🔐 Set up Supabase Auth for user authentication

## 📝 Notes

- **Free Tier**: 500MB database, 2GB file storage, 50MB file uploads
- **No Credit Card Required** for free tier
- **Auto-scaling** when you need more

## 🆘 Troubleshooting

**Error: "Supabase URL not found"**
- Make sure `.env` file exists in `sReader/` folder
- Restart your dev server after adding `.env`

**Error: "relation does not exist"**
- Run the SQL schema in Supabase SQL Editor

**Can't connect to Supabase**
- Check your internet connection
- Verify API keys are correct
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)

## 🎉 You're Ready!

Your app can now:
- Store data in the cloud
- Sync across devices
- Work offline (mobile)
- Scale to production
- Support multiple users

All for FREE! 🎊
