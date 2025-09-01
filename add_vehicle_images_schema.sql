-- Add image URL fields to vehicles table for 6 images
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS image_1_url TEXT,
ADD COLUMN IF NOT EXISTS image_2_url TEXT,
ADD COLUMN IF NOT EXISTS image_3_url TEXT,
ADD COLUMN IF NOT EXISTS image_4_url TEXT,
ADD COLUMN IF NOT EXISTS image_5_url TEXT,
ADD COLUMN IF NOT EXISTS image_6_url TEXT;

-- Add thumbnail URL fields for 6 images
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS thumbnail_1_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_2_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_3_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_4_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_5_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_6_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN vehicles.image_1_url IS 'Main vehicle image URL';
COMMENT ON COLUMN vehicles.image_2_url IS 'Additional vehicle image URL';
COMMENT ON COLUMN vehicles.image_3_url IS 'Additional vehicle image URL';
COMMENT ON COLUMN vehicles.image_4_url IS 'Additional vehicle image URL';
COMMENT ON COLUMN vehicles.image_5_url IS 'Additional vehicle image URL';
COMMENT ON COLUMN vehicles.image_6_url IS 'Additional vehicle image URL';

COMMENT ON COLUMN vehicles.thumbnail_1_url IS 'Main vehicle thumbnail URL';
COMMENT ON COLUMN vehicles.thumbnail_2_url IS 'Additional vehicle thumbnail URL';
COMMENT ON COLUMN vehicles.thumbnail_3_url IS 'Additional vehicle thumbnail URL';
COMMENT ON COLUMN vehicles.thumbnail_4_url IS 'Additional vehicle thumbnail URL';
COMMENT ON COLUMN vehicles.thumbnail_5_url IS 'Additional vehicle thumbnail URL';
COMMENT ON COLUMN vehicles.thumbnail_6_url IS 'Additional vehicle thumbnail URL';
