-- Check if the report was saved to the database
-- Run this in your Supabase SQL editor

-- Check the specific assessment that just had a report generated
SELECT 
  id,
  assessment_type,
  status,
  report_url,
  report_generated_at,
  report_version,
  created_at,
  updated_at
FROM assessment_requests 
WHERE report_url IS NOT NULL
ORDER BY report_generated_at DESC;

-- Check all assessments with their report status
SELECT 
  id,
  assessment_type,
  status,
  CASE 
    WHEN report_url IS NOT NULL THEN '✅ Report Available'
    ELSE '❌ No Report'
  END as report_status,
  report_generated_at,
  report_version
FROM assessment_requests 
ORDER BY created_at DESC;

-- Check the specific assessment by ID (replace with your actual assessment ID)
-- SELECT * FROM assessment_requests WHERE id = '333e78e1-8300-4c1d-a3aa-429a4ea4760a';
