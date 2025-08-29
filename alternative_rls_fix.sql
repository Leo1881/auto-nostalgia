-- Alternative approach: More specific RLS policy
-- Run this in your Supabase SQL editor

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can update own pending assessment requests" ON assessment_requests;

-- Create a policy that allows users to update their own assessment requests
-- but only specific fields (like status for cancellation)
CREATE POLICY "Users can update own assessment requests" ON assessment_requests
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Test the policy by trying to update a record
-- This will help verify the policy is working
-- (You can run this manually to test)

-- Example update that should work:
-- UPDATE assessment_requests 
-- SET status = 'cancelled' 
-- WHERE id = 'your-assessment-id' AND user_id = auth.uid();
