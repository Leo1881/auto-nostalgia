-- Fix RLS policies for assessment_requests table to allow assessors to update requests
-- Run this in your Supabase SQL editor

-- Add a policy that allows assessors to update assessment requests
CREATE POLICY "Assessors can update assessment requests" ON assessment_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'assessor'
    )
  );

-- Also add a policy for assessors to update with check
CREATE POLICY "Assessors can update assessment requests with check" ON assessment_requests
  FOR UPDATE WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'assessor'
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
WHERE tablename = 'assessment_requests'
ORDER BY policyname;
