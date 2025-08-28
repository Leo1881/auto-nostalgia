# Database Setup Instructions

## Setting up the Vehicles Table in Supabase

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor

### Step 2: Create the Vehicles Table
1. Copy the entire contents of `vehicles_table.sql`
2. Paste it into the SQL Editor in Supabase
3. Click "Run" to execute the SQL

### Step 3: Verify the Setup
After running the SQL, you should see:
- A new `vehicles` table created
- Row Level Security (RLS) enabled
- Policies created for user access control
- Indexes created for better performance
- Triggers for automatic timestamp updates

### Step 4: Test the Setup
1. Make sure you're logged into your app
2. Try adding a vehicle through the "Add New Vehicle" modal
3. Check the Supabase dashboard to see if the vehicle was saved

## Database Schema Overview

### Table: `vehicles`
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to auth.users)
- **make**: VARCHAR(100) - Vehicle make (required)
- **model**: VARCHAR(100) - Vehicle model (required)
- **variant**: VARCHAR(100) - Vehicle variant (optional)
- **year**: INTEGER - Manufacturing year (required, 1900-current+1)
- **registration_number**: VARCHAR(20) - License plate (required, unique)
- **vin**: VARCHAR(17) - Vehicle Identification Number (required, unique)
- **color**: VARCHAR(50) - Vehicle color (required)
- **mileage**: INTEGER - Current mileage (required, >= 0)
- **engine_size**: VARCHAR(50) - Engine size/type (optional)
- **transmission**: VARCHAR(20) - Transmission type (manual/automatic/semi-automatic)
- **fuel_type**: VARCHAR(20) - Fuel type (petrol/diesel/electric/hybrid/lpg)
- **body_type**: VARCHAR(20) - Body style (sedan/coupe/convertible/etc.)
- **number_of_doors**: INTEGER - Number of doors (2-5)
- **condition**: VARCHAR(20) - Vehicle condition (excellent/good/fair/poor)
- **modifications**: TEXT - Vehicle modifications (optional)
- **service_history**: TEXT - Service history (optional)
- **description**: TEXT - Additional notes (optional)
- **created_at**: TIMESTAMP - Record creation time
- **updated_at**: TIMESTAMP - Record last update time

## Security Features

### Row Level Security (RLS)
- Users can only see, create, update, and delete their own vehicles
- All operations are automatically filtered by `user_id`

### Data Validation
- Year must be between 1900 and next year
- Mileage must be non-negative
- Registration number and VIN must be unique
- Enum values are enforced for transmission, fuel_type, body_type, and condition

### Performance Optimizations
- Indexes on frequently queried columns
- Automatic timestamp updates via triggers

## API Functions

The `vehicleService.js` file provides the following functions:

- `getUserVehicles()` - Get all vehicles for the current user
- `addVehicle(vehicleData)` - Add a new vehicle
- `updateVehicle(vehicleId, vehicleData)` - Update an existing vehicle
- `deleteVehicle(vehicleId)` - Delete a vehicle
- `getVehicleById(vehicleId)` - Get a single vehicle by ID
- `checkRegistrationExists(registrationNumber)` - Check if registration exists
- `checkVINExists(vin)` - Check if VIN exists

## Troubleshooting

### Common Issues:

1. **"User not authenticated" error**
   - Make sure the user is logged in
   - Check that Supabase auth is properly configured

2. **"Registration number already exists" error**
   - The registration number must be unique across all users
   - Check if you've already added a vehicle with this registration

3. **"VIN already exists" error**
   - The VIN must be unique across all users
   - Check if you've already added a vehicle with this VIN

4. **Permission denied errors**
   - Make sure RLS policies are properly set up
   - Verify that the user is authenticated

### Testing the Setup:

1. **Add a test vehicle:**
   ```javascript
   const testVehicle = {
     make: "Ford",
     model: "Mustang",
     year: "1967",
     registration: "TEST123",
     vin: "1HGBH41JXMN109186",
     color: "Red",
     mileage: "50000"
   };
   ```

2. **Check the database:**
   - Go to Supabase Dashboard → Table Editor → vehicles
   - You should see your test vehicle listed

## Next Steps

After setting up the database:
1. Test adding vehicles through the modal
2. Implement vehicle listing functionality
3. Add vehicle editing capabilities
4. Add vehicle deletion with confirmation
5. Implement photo upload functionality
