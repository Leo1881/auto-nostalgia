-- Add report storage fields to assessment_requests table
-- Run this in your Supabase SQL editor

-- Add new fields for report storage
ALTER TABLE assessment_requests
ADD COLUMN IF NOT EXISTS report_url TEXT,
ADD COLUMN IF NOT EXISTS report_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS report_version INTEGER DEFAULT 1;

-- Create index for better performance when filtering by report availability
CREATE INDEX IF NOT EXISTS idx_assessment_requests_report_url ON assessment_requests(report_url);

-- Verify the columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'assessment_requests'
AND column_name IN ('report_url', 'report_generated_at', 'report_version')
ORDER BY column_name;
