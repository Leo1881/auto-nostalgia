-- Add assessment completion fields to assessment_requests table
-- Run this in your Supabase SQL editor

-- Add new fields for assessment completion
ALTER TABLE assessment_requests
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS vehicle_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS completion_date DATE;

-- Verify the columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'assessment_requests'
AND column_name IN ('completed_at', 'vehicle_value', 'completion_date')
ORDER BY column_name;
