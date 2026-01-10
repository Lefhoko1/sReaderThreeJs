# Step-by-Step Visual Guide: Setting Up Locations Table

## 🎯 Your Goal
Create the `locations` table in Supabase so users can save their coordinates and address.

## 📋 Before You Start
Make sure you have:
- ✅ Supabase project created
- ✅ `.env` file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
- ✅ Users table already exists (users should be able to sign up)

## 🚀 Step 1: Go to Supabase Dashboard

```
https://app.supabase.com
├── Sign in
└── Select your project
```

## 🔧 Step 2: Open SQL Editor

```
Left Sidebar:
├── SQL Editor  ← CLICK HERE
└── (Queries/All queries section opens)
```

## 📝 Step 3: Create New Query

```
Button in top right area:
└── "New Query"  ← CLICK HERE
    
You should see a blank SQL editor
```

## 📌 Step 4: Copy the SQL Code

### CHOOSE ONE:

**Option A - MINIMAL (Just locations table):**
```
File: SQL_LOCATIONS_ONLY.sql (in sReader/ folder)
Copy: All contents of this file
Size: ~250 lines
Time: 30 seconds
```

**Option B - COMPLETE (All app tables):**
```
File: supabase-schema.sql (in sReader/ folder)
Copy: All contents of this file  
Size: ~280 lines
Time: 1 minute
```

## ✂️ Step 5: Paste the SQL

```
In the Supabase SQL Editor:
┌─────────────────────────────┐
│ [Your SQL code here]        │
│ ...                         │
│ ...                         │
└─────────────────────────────┘
         ↑
   Right-click → Paste
```

## ▶️ Step 6: Run the SQL

```
Button in editor:
└── "Run" (or Ctrl+Enter)  ← CLICK HERE

Watch for: ✅ No errors
```

## ✨ Step 7: Verify Success

### Check in Supabase Dashboard:

```
Left Sidebar:
├── Table Editor  ← CLICK HERE
│
└── You should see:
    ├── users table
    ├── profiles table
    ├── locations table  ← ✅ THIS ONE!
    ├── devices table
    └── ... other tables
```

### Click on `locations` table to see columns:

```
locations table columns:
├── user_id (UUID)
├── lat (Decimal)
├── lng (Decimal)  
├── address (Text)
└── updated_at (Timestamp)
```

## 🧪 Step 8: Test in Your App

1. **Start the app**
   ```bash
   npm run web
   ```

2. **Sign up/log in**
   - Create an account (or use existing)

3. **Go to Profile**
   - Click on your profile icon/name

4. **Add Location**
   - Button: "Add Location" or "Update Location"
   - Enter coordinates:
     - Latitude: `40.7128`
     - Longitude: `-74.0060`
     - Address: `New York, NY` (optional)
   - Click "Save Location"

5. **Check Results**
   - Location should appear in profile
   - Can click "Update Location" to edit

## 🎉 Success!

If you see your location in the profile, setup is complete!

```
Profile Screen:
┌──────────────────────────────┐
│  Welcome Back!               │
├──────────────────────────────┤
│  [Avatar] Your Name          │
│  📧 your@email.com           │
│  📍 Your Location            │
│     40.7128, -74.0060        │
│     New York, NY             │
│  [Update Location Button]    │
└──────────────────────────────┘
```

## ❌ If It Didn't Work

### Error: "Cannot insert location"
- [ ] Check `locations` table exists (Step 7)
- [ ] Make sure you're logged in with a user account
- [ ] Check browser console (F12) for error details

### Error: "406 Not Acceptable"
- [ ] Table probably doesn't exist yet
- [ ] Re-do Step 1-6 carefully
- [ ] Make sure SQL ran without errors

### Error: "Locations table not found"
- [ ] Go back to Supabase dashboard
- [ ] Check in Table Editor
- [ ] The table should be there after running SQL

### Success but location won't save
- [ ] Refresh the page (Ctrl+R)
- [ ] Check you entered valid coordinates
- [ ] Try again from step 8

## 📞 Troubleshooting

If you're still stuck:

1. **Check SQL Error Messages**
   - Look at the red error text after clicking Run
   - Common issue: "table already exists" is OK
   - Real errors will say "failed to create"

2. **Verify in Table Editor**
   - Go to Table Editor
   - Can you see `locations` table?
   - Can you see the columns?

3. **Check Browser Console** (F12)
   - Look for network errors
   - API response errors
   - Helps diagnose what's wrong

4. **Read Detailed Guides**
   - `LOCATION_SETUP.md` - Full documentation
   - `DATABASE_SETUP_QUICK.md` - Common issues

## 📊 What Gets Created

The SQL creates:
- ✅ locations table
- ✅ RLS security policy (only users see their location)
- ✅ Auto-updating timestamp trigger
- ✅ All other app tables (if using full schema)

---

## 🎯 Summary

```
5 minutes total:
1. Go to Supabase SQL Editor
2. Paste SQL code
3. Click Run
4. Verify in Table Editor
5. Test in app
```

**You're done! Users can now save locations! 🎉**
