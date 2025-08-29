-- Check vehicles table structure
-- Run this in your Supabase SQL editor

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
ORDER BY ordinal_position;

-- Also check if there's any data in the vehicles table
SELECT * FROM vehicles LIMIT 3;
