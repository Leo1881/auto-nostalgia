import { useState, useEffect } from "react";
import { vehicleService } from "../../lib/vehicleService";
import EditVehicleModal from "./EditVehicleModal";
import DeleteVehicleModal from "./DeleteVehicleModal";
import ImageGallery from "../common/ImageGallery";

function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      // TEMPORARY: Add delay so you can see the loading state
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second delay

      const userVehicles = await vehicleService.getUserVehicles();
      setVehicles(userVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  console.log("📊 MyVehicles render:", { vehicles, loading, error });

  // Debug image data for each vehicle
  console.log("🚗 All vehicles:", vehicles);
  vehicles.forEach((vehicle, index) => {
    console.log(`🚗 Vehicle ${index + 1} FULL DATA:`, {
      id: vehicle.id,
      registration: vehicle.registration_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      image_1_url: vehicle.image_1_url,
      image_2_url: vehicle.image_2_url,
      image_3_url: vehicle.image_3_url,
      image_4_url: vehicle.image_4_url,
      image_5_url: vehicle.image_5_url,
      image_6_url: vehicle.image_6_url,
      thumbnail_1_url: vehicle.thumbnail_1_url,
      thumbnail_2_url: vehicle.thumbnail_2_url,
      thumbnail_3_url: vehicle.thumbnail_3_url,
      thumbnail_4_url: vehicle.thumbnail_4_url,
      thumbnail_5_url: vehicle.thumbnail_5_url,
      thumbnail_6_url: vehicle.thumbnail_6_url,
    });
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingVehicle(null);
  };

  const handleVehicleUpdated = (updatedVehicle) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
      )
    );
  };

  const handleDeleteVehicle = (vehicle) => {
    setDeletingVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingVehicle(null);
  };

  const handleVehicleDeleted = (vehicleId) => {
    setVehicles((prevVehicles) =>
      prevVehicles.filter((vehicle) => vehicle.id !== vehicleId)
    );
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "excellent":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-300 border border-green-200 dark:border-green-700";
      case "good":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700";
      case "fair":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700";
      case "poor":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-300 border border-red-200 dark:border-red-700";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900 dark:to-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  const getConditionLabel = (condition) => {
    return condition
      ? condition.charAt(0).toUpperCase() + condition.slice(1)
      : "Not specified";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-600 rounded-xl">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#333333ff]">
                My Vehicles
              </h1>
              <p className="text-sm text-[#333333ff]">
                Manage your vehicle profiles and details
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-6"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-red-600"></div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#333333ff] mb-2">
              Loading Your Vehicles
            </h3>
            <p className="text-[#333333ff]">
              Fetching your vehicle collection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-600 rounded-xl">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#333333ff]">
                My Vehicles
              </h1>
              <p className="text-sm text-[#333333ff]">
                Manage your vehicle profiles and details
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#333333ff] mb-3">
              Error Loading Vehicles
            </h3>
            <p className="text-[#333333ff] mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchVehicles}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-xl font-bold text-[#333333ff] mb-2">
              My Vehicles
            </h1>
            <p className="text-sm text-[#333333ff]">
              Manage your vehicle profiles and details
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {vehicles.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#333333ff] mb-3">
              No Vehicles Yet
            </h3>
            <p className="text-[#333333ff] mb-4 max-w-md mx-auto">
              You haven't added any vehicles to your profile yet.
            </p>
            <p className="text-sm text-[#333333ff]">
              Go to the dashboard to add your first vehicle.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle, index) => {
            console.log(`🎨 Rendering vehicle ${index + 1}:`, {
              id: vehicle.id,
              make: vehicle.make,
              model: vehicle.model,
              registration: vehicle.registration_number,
              hasImage: !!vehicle.image_1_url,
            });
            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 w-full"
              >
                {/* Vehicle Details Card */}
                <div className="p-6 space-y-4">
                  {/* Vehicle Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1 text-[#333333ff]">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      {vehicle.variant && (
                        <p className="text-sm font-medium text-[#333333ff]">
                          {vehicle.variant}
                        </p>
                      )}
                    </div>
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      {vehicle.image_1_url ? (
                        <img
                          src={vehicle.image_1_url}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full ${
                          vehicle.image_1_url ? "hidden" : "flex"
                        } items-center justify-center bg-red-600`}
                      >
                        <svg
                          className="w-8 h-8 text-white"
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
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#333333ff] mb-3">
                    Vehicle Details
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-[#333333ff]">
                        Registration
                      </span>
                      <span className="text-xs font-bold text-[#333333ff]">
                        {vehicle.registration_number}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-[#333333ff]">
                        Color
                      </span>
                      <span className="text-xs font-bold text-[#333333ff]">
                        {vehicle.color}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-[#333333ff]">
                        Mileage
                      </span>
                      <span className="text-xs font-bold text-[#333333ff]">
                        {vehicle.mileage?.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-[#333333ff]">
                        Body Type
                      </span>
                      <span className="text-xs font-bold text-[#333333ff]">
                        {vehicle.body_type
                          ? vehicle.body_type.charAt(0).toUpperCase() +
                            vehicle.body_type.slice(1)
                          : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-[#333333ff]">
                        Added
                      </span>
                      <span className="text-xs font-bold text-[#333333ff]">
                        {formatDate(vehicle.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-[#333333ff]">
                        VIN
                      </span>
                      <span className="text-xs font-bold text-[#333333ff]">
                        {vehicle.vin}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Images */}
                  <div className="pt-4 mt-4">
                    {(() => {
                      const imageUrls = [
                        vehicle.image_1_url,
                        vehicle.image_2_url,
                        vehicle.image_3_url,
                        vehicle.image_4_url,
                        vehicle.image_5_url,
                        vehicle.image_6_url,
                      ];
                      const filteredImages = imageUrls.filter(
                        (url) => url && url.trim() !== ""
                      );
                      console.log(
                        `🔍 Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.registration_number}):`,
                        {
                          id: vehicle.id,
                          rawImageUrls: imageUrls,
                          filteredImages: filteredImages,
                          hasImage1: !!vehicle.image_1_url,
                          image1Url: vehicle.image_1_url,
                        }
                      );
                      return (
                        <ImageGallery
                          images={filteredImages}
                          vehicleId={vehicle.id}
                          userId={vehicle.user_id}
                        />
                      );
                    })()}
                  </div>

                  {/* Technical Details */}
                  {(vehicle.engine_size ||
                    vehicle.transmission ||
                    vehicle.fuel_type) && (
                    <div className="pt-4 mt-4">
                      <h4 className="text-sm font-bold text-[#333333ff] mb-3">
                        Technical Details
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {vehicle.engine_size && (
                          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <span className="text-xs font-medium text-[#333333ff]">
                              Engine
                            </span>
                            <span className="text-xs font-bold text-[#333333ff]">
                              {vehicle.engine_size}
                            </span>
                          </div>
                        )}
                        {vehicle.transmission && (
                          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <span className="text-xs font-medium text-[#333333ff]">
                              Transmission
                            </span>
                            <span className="text-xs font-bold text-[#333333ff]">
                              {vehicle.transmission.charAt(0).toUpperCase() +
                                vehicle.transmission.slice(1)}
                            </span>
                          </div>
                        )}
                        {vehicle.fuel_type && (
                          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <span className="text-xs font-medium text-[#333333ff]">
                              Fuel Type
                            </span>
                            <span className="text-xs font-bold text-[#333333ff]">
                              {vehicle.fuel_type.charAt(0).toUpperCase() +
                                vehicle.fuel_type.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {(vehicle.modifications ||
                    vehicle.service_history ||
                    vehicle.description) && (
                    <div className="pt-4 pb-4 mb-4">
                      <h4 className="text-sm font-bold text-[#333333ff] mb-3">
                        Additional Information
                      </h4>
                      <div className="space-y-3">
                        {vehicle.modifications && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-[#333333ff] mb-1">
                              Modifications
                            </p>
                            <p className="text-xs text-[#333333ff] line-clamp-2">
                              {vehicle.modifications}
                            </p>
                          </div>
                        )}
                        {vehicle.service_history && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-[#333333ff] mb-1">
                              Service History
                            </p>
                            <p className="text-xs text-[#333333ff] line-clamp-2">
                              {vehicle.service_history}
                            </p>
                          </div>
                        )}
                        {vehicle.description && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-[#333333ff] mb-1">
                              Notes
                            </p>
                            <p className="text-xs text-[#333333ff] line-clamp-2">
                              {vehicle.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-3 flex space-x-3">
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle)}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleVehicleUpdated}
        vehicle={editingVehicle}
      />

      {/* Delete Vehicle Modal */}
      <DeleteVehicleModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleVehicleDeleted}
        vehicle={deletingVehicle}
      />
    </div>
  );
}

export default MyVehicles;
