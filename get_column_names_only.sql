-- Get just the column names in a simple list
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'assessment_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;
