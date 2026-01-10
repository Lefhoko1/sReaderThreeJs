-- ============================================================
-- QUICK SETUP: Just the Locations Table SQL
-- ============================================================
-- If you only want to add the locations table without the full schema,
-- run this SQL in Supabase SQL Editor:

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy (users can only see their own location)
CREATE POLICY "Users can view own location" ON public.locations
  FOR ALL USING (auth.uid() = user_id);

-- Create trigger for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VERIFICATION
-- ============================================================
-- After running the above, you should be able to:

-- 1. Check the table was created:
SELECT * FROM public.locations;

-- 2. Test inserting a location (replace 'user-id' with actual UUID):
-- INSERT INTO public.locations (user_id, lat, lng, address)
-- VALUES ('user-id', 40.7128, -74.0060, 'New York, NY');

-- 3. Check your location:
-- SELECT * FROM public.locations WHERE user_id = 'user-id';

-- ============================================================
-- NOTES:
-- - The users table must exist first
-- - Make sure you're using the correct user UUID
-- - RLS policy ensures users can only see their own location
-- - updated_at is automatically set to NOW() on update
