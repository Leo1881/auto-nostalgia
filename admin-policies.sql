-- Admin policies for assessor_requests table
-- Run these commands in your Supabase SQL editor

-- Allow admins to view all assessor requests
CREATE POLICY "Admins can view all assessor requests" ON assessor_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update all assessor requests
CREATE POLICY "Admins can update all assessor requests" ON assessor_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
