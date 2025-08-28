import { useState, useEffect } from "react";
import { vehicleService } from "../../lib/vehicleService";

function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "fair":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "poor":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getConditionLabel = (condition) => {
    return condition
      ? condition.charAt(0).toUpperCase() + condition.slice(1)
      : "Not specified";
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
            My Vehicles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your vehicle profiles and details.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your vehicles...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
            My Vehicles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your vehicle profiles and details.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-red-400 mx-auto mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Vehicles
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchVehicles}
              className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
              My Vehicles
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your vehicle profiles and details.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Vehicles Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't added any vehicles to your profile yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Go to the dashboard to add your first vehicle.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Vehicle Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.variant && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vehicle.variant}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                    vehicle.condition
                  )}`}
                >
                  {getConditionLabel(vehicle.condition)}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Registration
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.registration_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Color</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.color}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Mileage</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.mileage?.toLocaleString()} km
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Body Type
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {vehicle.body_type
                        ? vehicle.body_type.charAt(0).toUpperCase() +
                          vehicle.body_type.slice(1)
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Technical Details */}
                {(vehicle.engine_size ||
                  vehicle.transmission ||
                  vehicle.fuel_type) && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Technical Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {vehicle.engine_size && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Engine
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle.engine_size}
                          </p>
                        </div>
                      )}
                      {vehicle.transmission && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Transmission
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle.transmission.charAt(0).toUpperCase() +
                              vehicle.transmission.slice(1)}
                          </p>
                        </div>
                      )}
                      {vehicle.fuel_type && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Fuel Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle.fuel_type.charAt(0).toUpperCase() +
                              vehicle.fuel_type.slice(1)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {(vehicle.modifications ||
                  vehicle.service_history ||
                  vehicle.description) && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Additional Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      {vehicle.modifications && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Modifications
                          </p>
                          <p className="text-gray-900 dark:text-white line-clamp-2">
                            {vehicle.modifications}
                          </p>
                        </div>
                      )}
                      {vehicle.service_history && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Service History
                          </p>
                          <p className="text-gray-900 dark:text-white line-clamp-2">
                            {vehicle.service_history}
                          </p>
                        </div>
                      )}
                      {vehicle.description && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Notes
                          </p>
                          <p className="text-gray-900 dark:text-white line-clamp-2">
                            {vehicle.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Added: {formatDate(vehicle.created_at)}</span>
                    <span>VIN: {vehicle.vin}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyVehicles;
