-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  variant VARCHAR(100),
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  registration_number VARCHAR(20) NOT NULL UNIQUE,
  vin VARCHAR(17) NOT NULL UNIQUE,
  color VARCHAR(50) NOT NULL,
  mileage INTEGER NOT NULL CHECK (mileage >= 0),
  
  -- Technical Details
  engine_size VARCHAR(50),
  transmission VARCHAR(20) CHECK (transmission IN ('manual', 'automatic', 'semi-automatic')),
  fuel_type VARCHAR(20) CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'lpg')),
  body_type VARCHAR(20) CHECK (body_type IN ('sedan', 'coupe', 'convertible', 'hatchback', 'wagon', 'suv', 'pickup', 'van', 'other')),
  number_of_doors INTEGER CHECK (number_of_doors IN (2, 3, 4, 5)),
  condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Additional Information
  modifications TEXT,
  service_history TEXT,
  description TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);

-- Enable Row Level Security (RLS)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own vehicles
CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own vehicles
CREATE POLICY "Users can insert own vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own vehicles
CREATE POLICY "Users can update own vehicles" ON vehicles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own vehicles
CREATE POLICY "Users can delete own vehicles" ON vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE vehicles IS 'Stores vehicle information for users';
COMMENT ON COLUMN vehicles.user_id IS 'Foreign key to auth.users table';
COMMENT ON COLUMN vehicles.registration_number IS 'Vehicle registration/license plate number';
COMMENT ON COLUMN vehicles.vin IS 'Vehicle Identification Number (17 characters)';
COMMENT ON COLUMN vehicles.mileage IS 'Vehicle mileage in kilometers/miles';
COMMENT ON COLUMN vehicles.engine_size IS 'Engine size and type (e.g., 5.0L V8)';
COMMENT ON COLUMN vehicles.transmission IS 'Type of transmission';
COMMENT ON COLUMN vehicles.fuel_type IS 'Type of fuel the vehicle uses';
COMMENT ON COLUMN vehicles.body_type IS 'Body style of the vehicle';
COMMENT ON COLUMN vehicles.condition IS 'Overall condition of the vehicle';
COMMENT ON COLUMN vehicles.modifications IS 'Any modifications made to the vehicle';
COMMENT ON COLUMN vehicles.service_history IS 'Service and maintenance history';
COMMENT ON COLUMN vehicles.description IS 'Additional notes or description';
