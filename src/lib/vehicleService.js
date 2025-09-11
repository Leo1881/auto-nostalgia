import { supabase } from "./supabase";
import { imageService } from "./imageService.js";

export const vehicleService = {
  // Get all vehicles for the current user
  async getUserVehicles() {
    try {
      console.log("🔍 Getting user vehicles...");

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

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      console.log("✅ User vehicles fetched:", {
        count: data?.length || 0,
        vehicles:
          data?.map((v) => ({
            id: v.id,
            registration: v.registration_number,
            make: v.make,
            model: v.model,
          })) || [],
      });
      return data || [];
    } catch (error) {
      console.error("Error in getUserVehicles:", error);
      throw error;
    }
  },

  // Add a new vehicle
  async addVehicle(vehicleData, imageFiles = []) {
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

      // Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        console.log(
          "🚀 Starting image upload for",
          imageFiles.length,
          "images"
        );
        try {
          const imageResults = await imageService.uploadMultipleVehicleImages(
            imageFiles,
            user.id,
            data.id
          );

          console.log("✅ Image upload results:", imageResults);

          // Prepare image URL updates
          const imageUpdates = {};
          imageResults.forEach((result, index) => {
            const imageNumber = index + 1;
            imageUpdates[`image_${imageNumber}_url`] = result.mainImageUrl;
            imageUpdates[`thumbnail_${imageNumber}_url`] = result.thumbnailUrl;
          });

          console.log("📝 Image updates to apply:", imageUpdates);

          // Update vehicle with image URLs
          const { error: updateError } = await supabase
            .from("vehicles")
            .update(imageUpdates)
            .eq("id", data.id);

          if (updateError) {
            console.error(
              "Error updating vehicle with image URLs:",
              updateError
            );
            // Don't throw error here, vehicle was created successfully
          } else {
            console.log("✅ Vehicle updated with image URLs successfully");
            // Add image URLs to returned data
            Object.assign(data, imageUpdates);
          }
        } catch (imageError) {
          console.error("❌ Error uploading images:", imageError);
          // Don't throw error here, vehicle was created successfully
        }
      } else {
        console.log("ℹ️ No images provided for upload");
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
  async updateVehicle(
    vehicleId,
    vehicleData,
    imageFiles = [],
    deletedImageIndices = []
  ) {
    try {
      console.log("🔄 Updating vehicle:", {
        vehicleId,
        vehicleData: { ...vehicleData, registration: vehicleData.registration },
        imageFilesCount: imageFiles.length,
        deletedImageIndices,
      });

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

      console.log("🔍 About to update vehicle in database:", {
        vehicleId,
        userId: user.id,
        vehicleToUpdate: {
          ...vehicleToUpdate,
          registration_number: vehicleToUpdate.registration_number,
        },
      });

      const { data, error } = await supabase
        .from("vehicles")
        .update(vehicleToUpdate)
        .eq("id", vehicleId)
        .eq("user_id", user.id) // Ensure user can only update their own vehicles
        .select()
        .single();

      console.log("🔍 Database update result:", {
        data: data
          ? { id: data.id, registration: data.registration_number }
          : null,
        error: error ? error.message : null,
      });

      if (error) {
        console.error("Error updating vehicle:", error);
        throw error;
      }

      // Delete images if specified
      if (deletedImageIndices && deletedImageIndices.length > 0) {
        try {
          // Delete images from storage
          for (const imageIndex of deletedImageIndices) {
            await imageService.deleteImage(user.id, vehicleId, imageIndex + 1);
          }

          // Clear image URLs in database for deleted images
          const imageUpdates = {};
          deletedImageIndices.forEach((index) => {
            const imageNumber = index + 1;
            imageUpdates[`image_${imageNumber}_url`] = null;
            imageUpdates[`thumbnail_${imageNumber}_url`] = null;
          });

          // Update vehicle to clear deleted image URLs
          const { error: deleteUpdateError } = await supabase
            .from("vehicles")
            .update(imageUpdates)
            .eq("id", vehicleId);

          if (deleteUpdateError) {
            console.error(
              "Error clearing deleted image URLs:",
              deleteUpdateError
            );
          } else {
            // Update returned data to reflect deletions
            Object.assign(data, imageUpdates);
          }
        } catch (deleteError) {
          console.error("Error deleting images:", deleteError);
        }
      }

      // Upload new images if provided
      if (imageFiles && imageFiles.length > 0) {
        try {
          console.log("🖼️ Starting image upload process:", {
            imageFilesCount: imageFiles.length,
            imageFiles: imageFiles.map(({ file, slot }) => ({
              fileName: file?.name,
              slot,
              fileSize: file?.size,
            })),
          });

          // Prepare image URL updates
          const imageUpdates = {};

          // Process each file with its slot information
          for (const { file, slot } of imageFiles) {
            if (file) {
              console.log(`🖼️ Uploading image to slot ${slot + 1}:`, {
                fileName: file.name,
                fileSize: file.size,
                slot,
              });

              // Upload the image to the specific slot
              const result = await imageService.uploadVehicleImage(
                file,
                user.id,
                vehicleId,
                slot + 1 // Convert 0-based slot to 1-based image number
              );

              console.log(
                `🖼️ Image uploaded successfully to slot ${slot + 1}:`,
                {
                  mainImageUrl: result.mainImageUrl,
                  thumbnailUrl: result.thumbnailUrl,
                }
              );

              // Set the URLs for this specific slot
              imageUpdates[`image_${slot + 1}_url`] = result.mainImageUrl;
              imageUpdates[`thumbnail_${slot + 1}_url`] = result.thumbnailUrl;
            }
          }

          console.log("🖼️ Updating vehicle with image URLs:", {
            vehicleId,
            imageUpdates,
          });

          // Update vehicle with image URLs
          const { data: updateData, error: updateError } = await supabase
            .from("vehicles")
            .update(imageUpdates)
            .eq("id", vehicleId)
            .select()
            .single();

          if (updateError) {
            console.error(
              "❌ Error updating vehicle with image URLs:",
              updateError
            );
          } else {
            console.log("✅ Vehicle updated with image URLs successfully");
            console.log("🖼️ Database verification - updated vehicle images:", {
              image_1_url: updateData.image_1_url,
              image_2_url: updateData.image_2_url,
              image_3_url: updateData.image_3_url,
              image_4_url: updateData.image_4_url,
              image_5_url: updateData.image_5_url,
              image_6_url: updateData.image_6_url,
            });
            // Add image URLs to returned data
            Object.assign(data, imageUpdates);
          }
        } catch (imageError) {
          console.error("Error uploading images:", imageError);
        }
      }

      console.log("✅ Vehicle updated successfully:", {
        vehicleId: data.id,
        registration: data.registration_number,
        make: data.make,
        model: data.model,
        year: data.year,
      });

      console.log("🖼️ Final returned vehicle data - all image URLs:", {
        image_1_url: data.image_1_url,
        image_2_url: data.image_2_url,
        image_3_url: data.image_3_url,
        image_4_url: data.image_4_url,
        image_5_url: data.image_5_url,
        image_6_url: data.image_6_url,
      });

      return data;
    } catch (error) {
      console.error("❌ Error in updateVehicle:", error);
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

      // Delete associated images first
      try {
        await imageService.deleteImage(user.id, vehicleId);
      } catch (imageError) {
        console.error("Error deleting vehicle images:", imageError);
        // Continue with vehicle deletion even if image deletion fails
      }

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
