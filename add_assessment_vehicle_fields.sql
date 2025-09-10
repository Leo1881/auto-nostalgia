-- Add vehicle information fields to assessment_requests table
-- Run this in your Supabase SQL editor

ALTER TABLE assessment_requests 
ADD COLUMN IF NOT EXISTS chassis_number TEXT,
ADD COLUMN IF NOT EXISTS engine_number TEXT,
ADD COLUMN IF NOT EXISTS mean_mcgregor_code TEXT,
ADD COLUMN IF NOT EXISTS warranty TEXT,
ADD COLUMN IF NOT EXISTS warranty_expiration DATE,
ADD COLUMN IF NOT EXISTS current_odometer INTEGER,
ADD COLUMN IF NOT EXISTS full_service_history TEXT,
ADD COLUMN IF NOT EXISTS rebuilt_body_work TEXT,
ADD COLUMN IF NOT EXISTS rebuilt_engine_work TEXT,
ADD COLUMN IF NOT EXISTS accessories TEXT,
ADD COLUMN IF NOT EXISTS current_damages TEXT,
ADD COLUMN IF NOT EXISTS previous_body_work TEXT;

-- Add comments for documentation
COMMENT ON COLUMN assessment_requests.chassis_number IS 'Vehicle chassis number';
COMMENT ON COLUMN assessment_requests.engine_number IS 'Vehicle engine number';
COMMENT ON COLUMN assessment_requests.mean_mcgregor_code IS 'Mean and McGregor code';
COMMENT ON COLUMN assessment_requests.warranty IS 'Warranty information';
COMMENT ON COLUMN assessment_requests.warranty_expiration IS 'Warranty expiration date';
COMMENT ON COLUMN assessment_requests.current_odometer IS 'Current odometer reading';
COMMENT ON COLUMN assessment_requests.full_service_history IS 'Full service history details';
COMMENT ON COLUMN assessment_requests.rebuilt_body_work IS 'Details of rebuilt body work';
COMMENT ON COLUMN assessment_requests.rebuilt_engine_work IS 'Details of rebuilt engine work';
COMMENT ON COLUMN assessment_requests.accessories IS 'Vehicle accessories and modifications';
COMMENT ON COLUMN assessment_requests.current_damages IS 'Current damages and issues';
COMMENT ON COLUMN assessment_requests.previous_body_work IS 'Previous body work and repairs';
