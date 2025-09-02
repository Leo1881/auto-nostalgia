-- Add updated_at column to assessor_requests table if it doesn't exist
-- Run this in your Supabase SQL editor

-- Add updated_at column if it doesn't exist
ALTER TABLE assessor_requests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'assessor_requests' 
AND column_name = 'updated_at';
