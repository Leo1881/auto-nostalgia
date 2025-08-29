-- Fix RLS policies for vehicles table to allow assessors to view all vehicles
-- Run this in your Supabase SQL editor

-- Add a policy that allows assessors to view all vehicles
CREATE POLICY "Assessors can view all vehicles" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'assessor'
    )
  );

-- Verify the new policy was created
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
WHERE tablename = 'vehicles'
ORDER BY policyname;
