-- Fix storage policies by dropping and recreating them
-- Run this in your Supabase SQL editor

-- First, let's see what policies exist
SELECT 
  policyname,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Drop existing policies
DROP POLICY IF EXISTS "Assessors and admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can download files" ON storage.objects;
DROP POLICY IF EXISTS "Assessors and admins can update files" ON storage.objects;
DROP POLICY IF EXISTS "Assessors and admins can delete files" ON storage.objects;

-- Create new policies for 'reports' bucket

-- Policy for uploading files (assessors and admins only)
CREATE POLICY "Assessors and admins can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('assessor', 'admin')
    )
  );

-- Policy for downloading files (anyone with the URL can download)
CREATE POLICY "Anyone can download files" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports');

-- Policy for updating files (assessors and admins only)
CREATE POLICY "Assessors and admins can update files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('assessor', 'admin')
    )
  );

-- Policy for deleting files (assessors and admins only)
CREATE POLICY "Assessors and admins can delete files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reports' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('assessor', 'admin')
    )
  );

-- Verify the new policies were created
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
