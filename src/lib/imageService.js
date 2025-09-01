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
  async uploadImage(file, userId, vehicleId, imageNumber, isThumbnail = false) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = isThumbnail
        ? `thumbnail_${imageNumber}`
        : `image_${imageNumber}`;
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

  // Upload a single vehicle image (main + thumbnail)
  async uploadVehicleImage(file, userId, vehicleId, imageNumber) {
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
        imageNumber,
        false
      );
      const thumbnailUrl = await this.uploadImage(
        thumbnailFile,
        userId,
        vehicleId,
        imageNumber,
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

  // Upload multiple vehicle images
  async uploadMultipleVehicleImages(files, userId, vehicleId) {
    try {
      const results = [];

      for (let i = 0; i < Math.min(files.length, 6); i++) {
        if (files[i]) {
          const result = await this.uploadVehicleImage(
            files[i],
            userId,
            vehicleId,
            i + 1
          );
          results.push(result);
        }
      }

      return results;
    } catch (error) {
      console.error("Error uploading multiple vehicle images:", error);
      throw error;
    }
  }

  // Delete image from storage
  async deleteImage(userId, vehicleId, imageNumber) {
    try {
      const mainPath = `${userId}/${vehicleId}/image_${imageNumber}.jpg`;
      const thumbnailPath = `${userId}/${vehicleId}/thumbnail_${imageNumber}.jpg`;

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

  // Delete all images for a vehicle
  async deleteAllVehicleImages(userId, vehicleId) {
    try {
      const paths = [];

      // Generate paths for all 6 possible images
      for (let i = 1; i <= 6; i++) {
        paths.push(`${userId}/${vehicleId}/image_${i}.jpg`);
        paths.push(`${userId}/${vehicleId}/thumbnail_${i}.jpg`);
      }

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove(paths);

      if (error) {
        console.error("Delete error:", error);
        throw new Error("Failed to delete vehicle images");
      }

      return true;
    } catch (error) {
      console.error("Error deleting vehicle images:", error);
      throw error;
    }
  }

  // Get image URL (for display)
  getImageUrl(userId, vehicleId, imageNumber, isThumbnail = false) {
    const fileName = isThumbnail
      ? `thumbnail_${imageNumber}`
      : `image_${imageNumber}`;
    const filePath = `${userId}/${vehicleId}/${fileName}.jpg`;

    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

export const imageService = new ImageService();
