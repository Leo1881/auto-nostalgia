-- Copy phone number from assessor_requests to profiles table
-- Run this in your Supabase SQL editor

-- Update the profiles table with phone number from assessor_requests
UPDATE profiles 
SET 
  phone = (
    SELECT phone_number 
    FROM assessor_requests 
    WHERE user_id = profiles.id
  ),
  updated_at = NOW()
WHERE id = '0290a8df-e395-4347-a295-c3c375f6de5d';

-- Verify the update
SELECT 
  p.id,
  p.full_name,
  p.phone as profile_phone,
  ar.phone_number as assessor_phone
FROM profiles p
LEFT JOIN assessor_requests ar ON p.id = ar.user_id
WHERE p.id = '0290a8df-e395-4347-a295-c3c375f6de5d';
