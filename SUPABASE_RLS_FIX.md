# Supabase RLS Policy Fix for Image Upload

## Problem
Upload failing with: `StorageApiError: new row violates row-level security policy`

This means the storage bucket `MyStorageImages` has RLS policies that prevent authenticated users from uploading files.

## Solution

You need to enable RLS policies on the `MyStorageImages` bucket to allow uploads and public read access.

### Step 1: Open Supabase Dashboard
Go to: https://app.supabase.com → Your Project → Storage

### Step 2: Navigate to Bucket Policies
1. Click on the `MyStorageImages` bucket
2. Go to the **Policies** tab
3. Look for existing policies and add the missing ones

### Step 3: Add/Verify These RLS Policies

**Policy 1: Allow All Users to Read (Public Read)**
```sql
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'MyStorageImages');
```

**Policy 2: Allow Authenticated Users to Upload**
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'MyStorageImages'
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Allow Users to Update Their Own Files**
```sql
CREATE POLICY "Authenticated Update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'MyStorageImages'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'MyStorageImages'
  AND auth.role() = 'authenticated'
);
```

**Policy 4: Allow Users to Delete Their Own Files**
```sql
CREATE POLICY "Authenticated Delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'MyStorageImages'
  AND auth.role() = 'authenticated'
);
```

### Step 4: Via Supabase Dashboard UI

1. Go to Storage → `MyStorageImages` → Policies
2. Click "New Policy" or edit existing ones
3. For **INSERT** operations:
   - Template: "Authenticated users can upload files"
   - This should automatically create the INSERT policy
4. For **SELECT** operations:
   - Template: "Public access"
   - This allows anyone to read files

### Step 5: Verify

After adding policies:
1. Try uploading an image again
2. Check the browser console for: `[ActionConfigurator] Success: Image uploaded successfully!`
3. Verify the image appears in Supabase Storage → `MyStorageImages/AssignmentImages/`

## Troubleshooting

If you still get the error:

1. **Check Bucket RLS Status**: Is RLS enabled on the bucket?
   - Go to Storage → `MyStorageImages` → Settings
   - Check if RLS toggle is ON or OFF
   - If OFF, enable it

2. **Check User Authentication**: Is your user properly authenticated?
   - Check browser console for Supabase auth logs
   - Verify token is valid

3. **Policy Scope**: Make sure policies reference the correct bucket name `MyStorageImages`

## Alternative (Less Secure - For Testing Only)

If policies aren't working, you can temporarily disable RLS:

⚠️ **WARNING**: Only for development/testing!

```sql
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

Then re-enable after testing:
```sql
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## Files Modified in This Session

- `src/presentation/components/assignment/ActionConfigurator.tsx` - Image upload implementation with comprehensive logging

## Expected Behavior After Fix

✅ Image picker opens → ✅ Preview displays → ✅ Upload button triggered → ✅ Supabase accepts file → ✅ Public URL returned
