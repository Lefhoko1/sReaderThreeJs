# Quick Database Setup Guide

## 🎯 For Location Features to Work

The **locations table** needs to be created in your Supabase database. This is a one-time setup.

### Step-by-Step Instructions

#### 1. Go to Supabase Dashboard
- Visit [https://app.supabase.com](https://app.supabase.com)
- Sign in and select your project
- Look for your project's API keys (you'll need them in `.env`)

#### 2. Open SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** button
- You'll see a blank SQL editor

#### 3. Copy the Database Schema
The locations table and all related setup is in this file:
```
/workspaces/sReaderThreeJs/sReader/supabase-schema.sql
```

**Copy the ENTIRE contents** of that file.

#### 4. Paste into SQL Editor
- Paste the entire schema into the Supabase SQL Editor
- Click the **"Run"** button

#### 5. Verify Setup
- Go to **"Table Editor"** in Supabase
- You should see these tables:
  - ✅ `users`
  - ✅ `profiles`
  - ✅ `locations` ← This is what you need!
  - ✅ `devices`
  - ✅ `organizations`
  - ... and more

### 📍 What is the Locations Table?

It stores user location information:

| Column | Type | Purpose |
|--------|------|---------|
| `user_id` | UUID | Which user this location belongs to |
| `lat` | DECIMAL | Latitude coordinate (-90 to 90) |
| `lng` | DECIMAL | Longitude coordinate (-180 to 180) |
| `address` | TEXT | Optional: City, neighborhood, or address name |
| `updated_at` | TIMESTAMP | When location was last updated |

### 🔒 Security (RLS Policy)

The schema automatically sets up security so users can **only see/edit their own location**:
```sql
CREATE POLICY "Users can view own location" ON public.locations
  FOR ALL USING (auth.uid() = user_id);
```

### ✨ How It Works in Your App

1. **User navigates to Profile**
   - If no location is set, they see "Add Location" button
   - If location is set, it displays the coordinates and address

2. **User adds/updates location**
   - Goes to LocationScreen
   - Enters latitude, longitude, and optional address
   - Clicks "Save Location"
   - Data saves to the `locations` table in Supabase

3. **Location appears in profile**
   - Next time they open their profile, the location is there
   - They can click "Update Location" to change it

### 🔧 .env Configuration

Make sure you have these in your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from Supabase Dashboard → Settings → API

### 🧪 Testing It

1. Sign up for an account in the app
2. Go to your Profile screen
3. Click "Add Location"
4. Enter test coordinates:
   - Latitude: `40.7128` (New York)
   - Longitude: `-74.0060`
   - Address: `New York, NY`
5. Click "Save Location"
6. Check your profile - the location should appear!

### ❓ Troubleshooting

**Problem: "406 Not Acceptable" error**
- Location table hasn't been created yet
- Follow steps above to run the SQL schema

**Problem: Location won't save**
- Check browser console (F12) for error messages
- Make sure you're logged in
- Verify the `locations` table exists in Supabase

**Problem: Can't see location in profile**
- Refresh the page
- Make sure you saved the location successfully
- Check that Supabase tables were created (go to Table Editor)

### 📚 More Information

See [LOCATION_SETUP.md](./LOCATION_SETUP.md) for detailed location feature documentation.

---

**✅ After setup, users can add locations and see them in their profiles!**
