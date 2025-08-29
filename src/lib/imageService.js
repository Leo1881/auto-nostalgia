import { supabase } from "./supabase.js";
import imageCompression from "browser-image-compression";

class ImageService {
  constructor() {
    this.bucketName = "vehicle-images";
  }

  // Compress image before upload
  async compressImage(file) {
    const options = {
      maxSizeMB: 0.5, // 500KB max
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      throw new Error("Failed to compress image");
    }
  }

  // Create thumbnail from compressed image
  async createThumbnail(file) {
    const options = {
      maxSizeMB: 0.1, // 100KB max for thumbnail
      maxWidthOrHeight: 300,
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    try {
      const thumbnailFile = await imageCompression(file, options);
      return thumbnailFile;
    } catch (error) {
      console.error("Error creating thumbnail:", error);
      throw new Error("Failed to create thumbnail");
    }
  }

  // Upload image to Supabase Storage
  async uploadImage(file, userId, vehicleId, isThumbnail = false) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = isThumbnail ? "thumbnail" : "main";
      const filePath = `${userId}/${vehicleId}/${fileName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
        throw new Error("Failed to upload image");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }

  // Upload both main image and thumbnail
  async uploadVehicleImage(file, userId, vehicleId) {
    try {
      // Compress the original image
      const compressedFile = await this.compressImage(file);

      // Create thumbnail
      const thumbnailFile = await this.createThumbnail(compressedFile);

      // Upload both images
      const mainImageUrl = await this.uploadImage(
        compressedFile,
        userId,
        vehicleId,
        false
      );
      const thumbnailUrl = await this.uploadImage(
        thumbnailFile,
        userId,
        vehicleId,
        true
      );

      return {
        mainImageUrl,
        thumbnailUrl,
      };
    } catch (error) {
      console.error("Error uploading vehicle image:", error);
      throw error;
    }
  }

  // Delete image from storage
  async deleteImage(userId, vehicleId) {
    try {
      const mainPath = `${userId}/${vehicleId}/main.jpg`;
      const thumbnailPath = `${userId}/${vehicleId}/thumbnail.jpg`;

      const { error: mainError } = await supabase.storage
        .from(this.bucketName)
        .remove([mainPath]);

      const { error: thumbnailError } = await supabase.storage
        .from(this.bucketName)
        .remove([thumbnailPath]);

      if (mainError || thumbnailError) {
        console.error("Delete error:", mainError || thumbnailError);
        throw new Error("Failed to delete image");
      }

      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  // Get image URL (for display)
  getImageUrl(userId, vehicleId, isThumbnail = false) {
    const fileName = isThumbnail ? "thumbnail" : "main";
    const filePath = `${userId}/${vehicleId}/${fileName}.jpg`;

    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

export const imageService = new ImageService();
