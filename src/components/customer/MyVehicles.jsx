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
        <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-primary-red to-red-600 rounded-xl">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                My Vehicles
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your vehicle profiles and details
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 mx-auto mb-6"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary-red"></div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Loading Your Vehicles
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
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
        <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-primary-red to-red-600 rounded-xl">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                My Vehicles
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your vehicle profiles and details
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl shadow-lg border border-red-200 dark:border-red-700 p-8 sm:p-12">
          <div className="text-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
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
            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-3">
              Error Loading Vehicles
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={fetchVehicles}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
      <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <p className="text-gray-600 dark:text-gray-400">
              Manage your vehicle profiles
              <br />
              and details
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
        <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
          <div className="text-center">
            <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-500"
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No Vehicles Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
              You haven't added any vehicles to your profile yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Go to the dashboard to add your first vehicle.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8">
          {vehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform w-full max-w-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Vehicle Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-red transition-colors duration-200">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.variant && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {vehicle.variant}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getConditionColor(
                    vehicle.condition
                  )}`}
                >
                  {getConditionLabel(vehicle.condition)}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Registration
                    </p>
                    <p className="font-bold text-blue-900 dark:text-blue-100">
                      {vehicle.registration_number}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 border border-green-200 dark:border-green-700">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                      Color
                    </p>
                    <p className="font-bold text-green-900 dark:text-green-100">
                      {vehicle.color}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 border border-purple-200 dark:border-purple-700">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                      Mileage
                    </p>
                    <p className="font-bold text-purple-900 dark:text-purple-100">
                      {vehicle.mileage?.toLocaleString()} km
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-3 border border-orange-200 dark:border-orange-700">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">
                      Body Type
                    </p>
                    <p className="font-bold text-orange-900 dark:text-orange-100">
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
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-red"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Technical Details
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {vehicle.engine_size && (
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Engine
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {vehicle.engine_size}
                          </span>
                        </div>
                      )}
                      {vehicle.transmission && (
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Transmission
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {vehicle.transmission.charAt(0).toUpperCase() +
                              vehicle.transmission.slice(1)}
                          </span>
                        </div>
                      )}
                      {vehicle.fuel_type && (
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Fuel Type
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
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
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-red"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Additional Information
                    </h4>
                    <div className="space-y-3">
                      {vehicle.modifications && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                            Modifications
                          </p>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 line-clamp-2">
                            {vehicle.modifications}
                          </p>
                        </div>
                      )}
                      {vehicle.service_history && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                            Service History
                          </p>
                          <p className="text-sm text-indigo-800 dark:text-indigo-200 line-clamp-2">
                            {vehicle.service_history}
                          </p>
                        </div>
                      )}
                      {vehicle.description && (
                        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200 dark:border-teal-700">
                          <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-teal-800 dark:text-teal-200 line-clamp-2">
                            {vehicle.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Added: {formatDate(vehicle.created_at)}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      VIN: {vehicle.vin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
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
                <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
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
          ))}
        </div>
      )}
    </div>
  );
}

export default MyVehicles;
