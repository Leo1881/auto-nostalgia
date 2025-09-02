-- Consolidate assessor data into profiles table
-- This migration moves all assessor-specific data from assessor_requests to profiles
-- Run this in your Supabase SQL editor

-- Step 1: Add assessor-specific columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS contact_method TEXT,
ADD COLUMN IF NOT EXISTS assessor_status TEXT DEFAULT 'active' CHECK (assessor_status IN ('active', 'inactive', 'suspended'));

-- Step 2: Copy data from assessor_requests to profiles
UPDATE profiles 
SET 
  experience = ar.experience,
  contact_method = ar.contact_method,
  assessor_status = CASE 
    WHEN ar.status = 'approved' THEN 'active'
    WHEN ar.status = 'rejected' THEN 'inactive'
    ELSE 'active'
  END
FROM assessor_requests ar
WHERE profiles.id = ar.user_id 
AND profiles.role = 'assessor';

-- Step 3: Update phone numbers (use assessor_requests phone if profiles phone is null)
UPDATE profiles 
SET phone = COALESCE(profiles.phone, ar.phone_number)
FROM assessor_requests ar
WHERE profiles.id = ar.user_id 
AND profiles.role = 'assessor'
AND profiles.phone IS NULL;

-- Step 4: Populate missing address fields for assessors
-- This provides default address data for assessors who don't have address information
UPDATE profiles 
SET 
  address = COALESCE(profiles.address, 'Address to be provided'),
  city = COALESCE(profiles.city, 'City to be provided'),
  province = COALESCE(profiles.province, 'Province to be provided'),
  zip_code = COALESCE(profiles.zip_code, 'Postal code to be provided'),
  country = COALESCE(profiles.country, 'South Africa')
WHERE profiles.role = 'assessor'
AND (profiles.address IS NULL OR profiles.city IS NULL OR profiles.province IS NULL);

-- Step 5: Verify the data migration
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.role,
  p.phone,
  p.experience,
  p.contact_method,
  p.assessor_status,
  ar.status as old_status
FROM profiles p
LEFT JOIN assessor_requests ar ON p.id = ar.user_id
WHERE p.role = 'assessor'
ORDER BY p.created_at;

-- Step 5: Drop the assessor_requests table (uncomment when ready)
-- DROP TABLE IF EXISTS assessor_requests;

-- Step 6: Update RLS policies for profiles table to handle assessor data
-- (The existing policies should work fine since we're just adding columns)
