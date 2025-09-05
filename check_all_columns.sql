-- Check ALL columns in assessment_requests table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'assessment_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;
