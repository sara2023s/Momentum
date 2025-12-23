# Settings Feature Setup

This guide explains how to set up the Settings feature in your Supabase database.

## Step 1: Add Database Columns

Run the following SQL in your Supabase SQL Editor to add the profile fields:

```sql
-- Add profile fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "birthday" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT,
ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT;
```

**How to run:**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste the SQL above
5. Click **Run**

## Step 2: Create Storage Bucket for Profile Images

1. Go to **Storage** in your Supabase Dashboard
2. Click **Create a new bucket**
3. Name it: `avatars`
4. Set it to **Public** (or configure appropriate RLS policies)
5. Click **Create bucket**

## Step 3: Configure Storage Policies (Optional but Recommended)

If you want to restrict access, set up Row Level Security policies:

```sql
-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to profile images
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## That's it!

After completing these steps, the Settings page will be fully functional. Users can:
- Update their name
- Set their birthday
- Add a phone number
- Upload a profile image

