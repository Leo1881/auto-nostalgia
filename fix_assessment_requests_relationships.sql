-- Fix foreign key relationships for assessment_requests table
-- Run this in your Supabase SQL editor

-- First, let's check the current foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'assessment_requests';

-- Check if profiles table has the correct structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- The issue is that assessment_requests.user_id references auth.users(id)
-- But we want to join with profiles table which also has id that references auth.users(id)
-- So we need to join through the user_id field

-- Let's verify the profiles table structure
SELECT * FROM profiles LIMIT 1;
