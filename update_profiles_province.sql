-- Add province field to profiles table for better province matching
-- Run this in your Supabase SQL editor

-- Add province field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS province TEXT;

-- Update existing state values to province (if they contain South African provinces)
UPDATE profiles 
SET province = state 
WHERE state IN (
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
);

-- Create an index for better performance when matching provinces
CREATE INDEX IF NOT EXISTS idx_profiles_province ON profiles(province);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('state', 'province')
ORDER BY column_name;
