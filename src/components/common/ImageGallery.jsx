import React, { useState } from "react";

const ImageGallery = ({ images = [], vehicleId, userId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("🖼️ ImageGallery props:", { images, vehicleId, userId });

  // Create array of 6 image slots with actual images or placeholders
  const imageSlots = Array.from({ length: 6 }, (_, index) => {
    const imageUrl = images[index] || null;
    return {
      id: index + 1,
      url: imageUrl,
      isPlaceholder: !imageUrl,
    };
  });

  console.log("🖼️ ImageGallery slots:", imageSlots);
  console.log("🖼️ First slot details:", imageSlots[0]);
  console.log("🖼️ Images array:", images);

  // Debug: Check if first image exists
  if (images.length > 0) {
    console.log("🖼️ First image URL:", images[0]);
    console.log("🖼️ First slot URL:", imageSlots[0].url);
  }

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  };

  return (
    <>
      <div className="mb-6">
        <h4 className="text-sm font-bold text-[#333333ff] mb-3">
          Vehicle Images
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imageSlots.map((slot, index) => (
            <div key={slot.id} className="relative">
              {slot.url ? (
                <button
                  onClick={() => openModal(slot.url)}
                  className="w-full h-32 border-2 border-gray-300 rounded-lg overflow-hidden hover:border-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <img
                    src={slot.url}
                    alt={`Vehicle image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={() =>
                      console.log(
                        `✅ Image ${index + 1} loaded successfully:`,
                        slot.url
                      )
                    }
                    onError={(e) =>
                      console.log(
                        `❌ Image ${index + 1} failed to load:`,
                        slot.url,
                        e
                      )
                    }
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                    {index === 0 ? "Main" : `${index + 1}`}
                  </div>
                </button>
              ) : (
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <svg
                      className="w-6 h-6 text-gray-400 mx-auto mb-1"
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
                    <p className="text-xs text-gray-500">
                      {index === 0 ? "Main" : `${index + 1}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 focus:outline-none"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Vehicle full size"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
