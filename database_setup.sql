-- Add account status management columns to profiles table
-- Run this in your Supabase SQL editor

-- Add account_status column (defaults to 'active')
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Add suspension_reason column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Add suspended_at timestamp
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- Add suspended_by (references the admin who suspended)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES profiles(id);

-- Add deleted_at timestamp (for soft deletes)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_by (references the admin who deleted)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- Update existing users to have 'active' status if they don't have one
UPDATE profiles 
SET account_status = 'active' 
WHERE account_status IS NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('account_status', 'suspension_reason', 'suspended_at', 'suspended_by', 'deleted_at', 'deleted_by')
ORDER BY column_name;
