-- Check RLS policies for assessment_requests table
-- Run this in your Supabase SQL editor

-- Check current RLS policies
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
WHERE tablename = 'assessment_requests'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'assessment_requests';

-- Test if assessors can update assessment requests
-- This will help identify if there are permission issues
SELECT 
  'Current user can update assessment_requests' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM assessment_requests 
      WHERE id = 'test-id' 
      AND auth.uid() = assigned_assessor_id
    ) THEN 'YES'
    ELSE 'NO'
  END as can_update;
