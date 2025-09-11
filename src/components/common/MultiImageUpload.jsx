import React, { useState, useRef, useEffect } from "react";

const MultiImageUpload = ({
  onImagesSelect,
  onImageDelete,
  currentImages = [],
  label = "Vehicle Images",
  className = "",
  maxImages = 6,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState(() => {
    // Initialize with currentImages using lazy initializer
    const urls = Array(maxImages).fill(null);
    currentImages.forEach((url, index) => {
      if (index < maxImages && url) {
        urls[index] = url;
      }
    });
    return urls;
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const prevCurrentImagesRef = useRef([]);

  // Update previewUrls when currentImages changes (for edit mode)
  useEffect(() => {
    // Only update if currentImages has actually changed and we don't have selected files
    const hasChanged =
      currentImages.length !== prevCurrentImagesRef.current.length ||
      currentImages.some(
        (url, index) => url !== prevCurrentImagesRef.current[index]
      );

    if (hasChanged && selectedFiles.length === 0) {
      const urls = Array(maxImages).fill(null);
      currentImages.forEach((url, index) => {
        if (index < maxImages && url) {
          urls[index] = url;
        }
      });
      setPreviewUrls(urls);
      prevCurrentImagesRef.current = [...currentImages];
    }
  }, [currentImages, maxImages, selectedFiles.length]);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return false;
    }

    // Check if it's a JPG/JPEG
    if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
      setError("Please select a JPG/JPEG image");
      return false;
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError("Image must be smaller than 5MB");
      return false;
    }

    setError("");
    return true;
  };

  const handleFileSelect = (files) => {
    const validFiles = [];
    const newPreviewUrls = [...previewUrls];
    const newSelectedFiles = [...selectedFiles];

    for (
      let i = 0;
      i <
      Math.min(
        files.length,
        maxImages - previewUrls.filter((url) => url).length
      );
      i++
    ) {
      const file = files[i];
      if (validateFile(file)) {
        validFiles.push(file);
        const url = URL.createObjectURL(file);
        // Find the first empty slot
        const emptyIndex = newPreviewUrls.findIndex((url) => !url);
        if (emptyIndex !== -1) {
          newPreviewUrls[emptyIndex] = url;
          newSelectedFiles[emptyIndex] = file;
        }
      }
    }

    if (validFiles.length > 0) {
      setPreviewUrls(newPreviewUrls);
      setSelectedFiles(newSelectedFiles);

      // Pass both files and their slot positions
      const filesWithSlots = newSelectedFiles
        .map((file, index) => ({ file, slot: index }))
        .filter(({ file }) => file);

      onImagesSelect(filesWithSlots);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index) => {
    const newPreviewUrls = [...previewUrls];
    const newSelectedFiles = [...selectedFiles];

    // Check if this is an existing image (from currentImages) or a newly selected file
    const isExistingImage =
      index < currentImages.length && currentImages[index];

    // Revoke the object URL to free memory
    if (newPreviewUrls[index]) {
      URL.revokeObjectURL(newPreviewUrls[index]);
    }

    newPreviewUrls[index] = null;
    newSelectedFiles[index] = null;

    setPreviewUrls(newPreviewUrls);
    setSelectedFiles(newSelectedFiles);

    // If it's an existing image, notify parent to delete it from storage
    if (isExistingImage && onImageDelete) {
      onImageDelete(index);
    }

    // Notify parent of remaining files with slot information
    const filesWithSlots = newSelectedFiles
      .map((file, index) => ({ file, slot: index }))
      .filter(({ file }) => file);

    onImagesSelect(filesWithSlots);
  };

  const getEmptySlots = () => {
    return maxImages - previewUrls.filter((url) => url).length;
  };

  const canAddMore = getEmptySlots() > 0;

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-[#333333ff] mb-2">
        {label} ({previewUrls.filter((url) => url).length}/{maxImages})
      </label>

      <div className="grid grid-cols-3 gap-4">
        {/* Existing images */}
        {previewUrls.map((url, index) => (
          <div key={index} className="relative">
            {url ? (
              <div className="relative border-2 border-gray-300 rounded-lg">
                <img
                  src={url}
                  alt={`Vehicle image ${index + 1}`}
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-700 transition-colors shadow-md z-10"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  {index === 0 ? "Main Image" : `Image ${index + 1}`}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {index === 0 ? "Main Image" : `Image ${index + 1}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upload area */}
      {canAddMore && (
        <div
          className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
            isDragOver
              ? "border-red-600 bg-red-50"
              : "border-gray-300 bg-white hover:border-red-600 hover:bg-red-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#333333ff] font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG/JPEG up to 5MB • {getEmptySlots()} slot
                {getEmptySlots() !== 1 ? "s" : ""} remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default MultiImageUpload;
