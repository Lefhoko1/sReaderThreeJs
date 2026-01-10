# Setting Up the Locations Table

The locations table is essential for saving user location data (latitude, longitude, and address). Follow these steps to set it up in your Supabase instance.

## Option 1: Manual Setup (Recommended for First Time)

1. **Go to Supabase Dashboard**
   - Visit https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run"

4. **Verify the Table**
   - Go to "Table Editor" 
   - You should now see a `locations` table with columns: `user_id`, `lat`, `lng`, `address`, `updated_at`

## Option 2: Automated Setup

Run the setup helper script:

```bash
node scripts/setupDatabaseSchema.js
```

This will display the SQL schema that needs to be run in the Supabase SQL Editor.

## What Gets Created

The `locations` table includes:

```sql
CREATE TABLE public.locations (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

With RLS Policy:
```sql
CREATE POLICY "Users can view own location" ON public.locations
  FOR ALL USING (auth.uid() = user_id);
```

And automatic trigger for `updated_at`:
```sql
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## How It Works

1. **Saving Location**: When a user enters their latitude, longitude, and address in the LocationScreen, it's saved to the database
2. **Updating Location**: Users can update their location anytime from the ProfileScreen
3. **Retrieving Location**: The app fetches the location when the user loads their profile
4. **Security**: Row Level Security (RLS) ensures users can only see/modify their own location data

## Testing Location Features

1. **Add Location**
   - Go to ProfileScreen
   - Click "Add Location"
   - Enter coordinates (e.g., lat: 40.7128, lng: -74.0060 for New York)
   - Click "Save Location"

2. **View Location**
   - Check ProfileScreen to see your saved location
   - Should display coordinates and address (if provided)

3. **Update Location**
   - Click "Update Location" on ProfileScreen
   - Modify coordinates or address
   - Click "Save Location"

## Troubleshooting

### "Location not found" error
- Make sure the `locations` table has been created in Supabase
- Check that RLS policy is enabled
- Verify you're logged in with an authenticated user

### "406 Not Acceptable" error
- This occurs when a user hasn't set a location yet
- It's handled gracefully - the app will prompt them to add one

### Location data not saving
- Check that the `locations` table exists in Supabase
- Verify RLS policy allows the user to insert/update data
- Check browser console for API errors

## Database Schema Dependencies

The locations table depends on:
- `users` table (via foreign key)
- `update_updated_at_column()` function (for timestamp auto-update)

Make sure the full `supabase-schema.sql` is executed to create all dependencies.

---

✅ Once setup is complete, the location management system is fully functional!
