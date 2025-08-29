-- Create assessment_requests table
-- Run this in your Supabase SQL editor

-- Create assessment_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS assessment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  additional_notes TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  assigned_assessor_id UUID REFERENCES profiles(id),
  scheduled_date DATE,
  scheduled_time TIME,
  assessment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE assessment_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own assessment requests
CREATE POLICY "Users can view own assessment requests" ON assessment_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own assessment requests
CREATE POLICY "Users can insert own assessment requests" ON assessment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessment requests (only if status is pending)
CREATE POLICY "Users can update own pending assessment requests" ON assessment_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Assessors can view all assessment requests
CREATE POLICY "Assessors can view all assessment requests" ON assessment_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'assessor'
    )
  );

-- Assessors can update assessment requests they are assigned to
CREATE POLICY "Assessors can update assigned assessment requests" ON assessment_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'assessor'
    ) AND assigned_assessor_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_requests_user_id ON assessment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_vehicle_id ON assessment_requests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_status ON assessment_requests(status);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_assigned_assessor_id ON assessment_requests(assigned_assessor_id);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_created_at ON assessment_requests(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_assessment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_assessment_requests_updated_at
  BEFORE UPDATE ON assessment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_requests_updated_at();

-- Verify the table was created
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'assessment_requests'
ORDER BY ordinal_position;
