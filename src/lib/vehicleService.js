import { supabase } from "./supabase";

export const vehicleService = {
  // Get all vehicles for the current user
  async getUserVehicles() {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserVehicles:", error);
      throw error;
    }
  },

  // Add a new vehicle
  async addVehicle(vehicleData) {
    try {
      console.log("Starting addVehicle with data:", vehicleData);

      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        console.error("Session error:", sessionError);
        console.log("Session data:", session);
        throw new Error("User not authenticated - please log in again");
      }

      const user = session.user;
      console.log("User authenticated:", user.id);

      // Prepare the vehicle data with user_id
      const vehicleToInsert = {
        ...vehicleData,
        user_id: user.id,
        // Convert string values to appropriate types
        year: parseInt(vehicleData.year),
        mileage: parseInt(vehicleData.mileage),
        number_of_doors: vehicleData.numberOfDoors
          ? parseInt(vehicleData.numberOfDoors)
          : null,
        // Map form field names to database column names
        registration_number: vehicleData.registration,
        engine_size: vehicleData.engineSize,
        service_history: vehicleData.serviceHistory,
        // Map other field names to database column names
        body_type: vehicleData.bodyType,
        fuel_type: vehicleData.fuelType,
      };

      // Remove the mapped fields to avoid duplication
      delete vehicleToInsert.registration;
      delete vehicleToInsert.engineSize;
      delete vehicleToInsert.serviceHistory;
      delete vehicleToInsert.numberOfDoors;
      delete vehicleToInsert.bodyType;
      delete vehicleToInsert.fuelType;

      console.log("Vehicle data to insert:", vehicleToInsert);

      const { data, error } = await supabase
        .from("vehicles")
        .insert([vehicleToInsert])
        .select()
        .single();

      if (error) {
        console.error("Supabase error adding vehicle:", error);
        throw error;
      }

      console.log("Vehicle added successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in addVehicle:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
  },

  // Update an existing vehicle
  async updateVehicle(vehicleId, vehicleData) {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        throw new Error("User not authenticated - please log in again");
      }

      const user = session.user;

      // Prepare the vehicle data
      const vehicleToUpdate = {
        ...vehicleData,
        year: parseInt(vehicleData.year),
        mileage: parseInt(vehicleData.mileage),
        number_of_doors: vehicleData.numberOfDoors
          ? parseInt(vehicleData.numberOfDoors)
          : null,
        registration_number: vehicleData.registration,
        engine_size: vehicleData.engineSize,
        service_history: vehicleData.serviceHistory,
        body_type: vehicleData.bodyType,
        fuel_type: vehicleData.fuelType,
      };

      // Remove the mapped fields
      delete vehicleToUpdate.registration;
      delete vehicleToUpdate.engineSize;
      delete vehicleToUpdate.serviceHistory;
      delete vehicleToUpdate.numberOfDoors;
      delete vehicleToUpdate.bodyType;
      delete vehicleToUpdate.fuelType;

      const { data, error } = await supabase
        .from("vehicles")
        .update(vehicleToUpdate)
        .eq("id", vehicleId)
        .eq("user_id", user.id) // Ensure user can only update their own vehicles
        .select()
        .single();

      if (error) {
        console.error("Error updating vehicle:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateVehicle:", error);
      throw error;
    }
  },

  // Delete a vehicle
  async deleteVehicle(vehicleId) {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        throw new Error("User not authenticated - please log in again");
      }

      const user = session.user;

      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleId)
        .eq("user_id", user.id); // Ensure user can only delete their own vehicles

      if (error) {
        console.error("Error deleting vehicle:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteVehicle:", error);
      throw error;
    }
  },

  // Get a single vehicle by ID
  async getVehicleById(vehicleId) {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        throw new Error("User not authenticated - please log in again");
      }

      const user = session.user;

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching vehicle:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getVehicleById:", error);
      throw error;
    }
  },

  // Check if registration number already exists
  async checkRegistrationExists(registrationNumber, excludeId = null) {
    try {
      let query = supabase
        .from("vehicles")
        .select("id")
        .eq("registration_number", registrationNumber);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error checking registration:", error);
        throw error;
      }

      return data.length > 0;
    } catch (error) {
      console.error("Error in checkRegistrationExists:", error);
      throw error;
    }
  },

  // Check if VIN already exists
  async checkVINExists(vin, excludeId = null) {
    try {
      let query = supabase.from("vehicles").select("id").eq("vin", vin);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error checking VIN:", error);
        throw error;
      }

      return data.length > 0;
    } catch (error) {
      console.error("Error in checkVINExists:", error);
      throw error;
    }
  },
};
