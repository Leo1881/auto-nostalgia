-- Add scheduling fields to assessment_requests table
-- Run this in your Supabase SQL editor

-- Add new fields for assessment scheduling
ALTER TABLE assessment_requests
ADD COLUMN IF NOT EXISTS assessment_location TEXT,
ADD COLUMN IF NOT EXISTS assessment_notes TEXT;

-- Verify the columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'assessment_requests'
AND column_name IN ('scheduled_date', 'scheduled_time', 'assessment_location', 'assessment_notes')
ORDER BY column_name;
