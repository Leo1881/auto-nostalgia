-- Check current storage setup
-- Run this in your Supabase SQL editor

-- 1. Check what storage buckets exist
SELECT 
  name as bucket_name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 2. Check existing storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 3. Check if the 'reports' bucket exists specifically
SELECT 
  name as bucket_name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE name = 'reports';

-- 4. Check current user's role (run this while logged in as assessor)
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles 
WHERE id = auth.uid();
