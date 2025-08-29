import { useState } from "react";
import { vehicleService } from "../../lib/vehicleService";

function DeleteVehicleModal({ isOpen, onClose, onConfirm, vehicle }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!vehicle) return;

    setIsDeleting(true);

    try {
      await vehicleService.deleteVehicle(vehicle.id);

      // Call the onConfirm callback to update the parent component
      if (onConfirm) {
        onConfirm(vehicle.id);
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#333333ff]">
                Delete Vehicle
              </h2>
              <p className="text-sm text-[#333333ff]">
                This action cannot be undone
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-[#333333ff] mb-4">
              Are you sure you want to delete this vehicle?
            </p>

            {/* Vehicle Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
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
                  <h3 className="font-semibold text-[#333333ff]">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.variant && (
                    <p className="text-sm text-[#333333ff]">
                      {vehicle.variant}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#333333ff]">
                <div>
                  <span className="font-medium">Registration:</span>{" "}
                  {vehicle.registration_number}
                </div>
                <div>
                  <span className="font-medium">Color:</span> {vehicle.color}
                </div>
                <div>
                  <span className="font-medium">Mileage:</span>{" "}
                  {vehicle.mileage?.toLocaleString()} km
                </div>
                <div>
                  <span className="font-medium">VIN:</span> {vehicle.vin}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-32 h-10 rounded-3xl font-quicksand font-bold text-xs outline-none cursor-pointer transition-all duration-300 shadow-md bg-white text-red-600 border-2 border-red-600 hover:scale-105 hover:bg-red-600 hover:text-white hover:shadow-lg active:scale-95 active:bg-red-700 active:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-32 h-10 rounded-3xl font-quicksand font-bold text-sm border-none outline-none cursor-pointer transition-all duration-300 shadow-md bg-red-600 text-white hover:scale-105 hover:bg-red-700 hover:shadow-lg active:scale-95 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                "Delete Vehicle"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteVehicleModal;
