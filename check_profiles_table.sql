-- Check profiles table structure
-- Run this in your Supabase SQL editor

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Also check if there's any data in the profiles table
SELECT * FROM profiles LIMIT 5;
