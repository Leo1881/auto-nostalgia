-- Update assessment_requests table schema for assessor functionality
-- Run this in your Supabase SQL editor

-- Add missing columns to assessment_requests table
ALTER TABLE assessment_requests
ADD COLUMN IF NOT EXISTS assigned_assessor_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create an index for better performance when filtering by province
-- (This will be useful when we add province to assessment_requests table)
CREATE INDEX IF NOT EXISTS idx_assessment_requests_status ON assessment_requests(status);
CREATE INDEX IF NOT EXISTS idx_assessment_requests_assigned_assessor ON assessment_requests(assigned_assessor_id);

-- Verify the columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'assessment_requests'
ORDER BY ordinal_position;
