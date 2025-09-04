-- Fix existing storage policies to use 'reports' bucket
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

-- Now update the policies to use 'reports' bucket instead of any other bucket name

-- Update INSERT policy
UPDATE pg_policies 
SET 
  qual = REPLACE(qual, 'auto-nostalgia-files', 'reports'),
  with_check = REPLACE(with_check, 'auto-nostalgia-files', 'reports')
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%upload%';

-- Update SELECT policy  
UPDATE pg_policies 
SET qual = REPLACE(qual, 'auto-nostalgia-files', 'reports')
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%download%';

-- Update UPDATE policy
UPDATE pg_policies 
SET 
  qual = REPLACE(qual, 'auto-nostalgia-files', 'reports'),
  with_check = REPLACE(with_check, 'auto-nostalgia-files', 'reports')
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%update%';

-- Update DELETE policy
UPDATE pg_policies 
SET qual = REPLACE(qual, 'auto-nostalgia-files', 'reports')
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%delete%';

-- Verify the changes
SELECT 
  policyname,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
