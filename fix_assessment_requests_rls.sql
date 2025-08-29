-- Fix RLS policies for assessment_requests table
-- Run this in your Supabase SQL editor

-- First, let's check the current policies
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
WHERE tablename = 'assessment_requests';

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update own pending assessment requests" ON assessment_requests;

-- Create a new, more permissive update policy
CREATE POLICY "Users can update own assessment requests" ON assessment_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Also create a policy for users to update their own assessment requests
CREATE POLICY "Users can update own assessment requests with check" ON assessment_requests
  FOR UPDATE WITH CHECK (auth.uid() = user_id);

-- Verify the policies were created
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
WHERE tablename = 'assessment_requests';
