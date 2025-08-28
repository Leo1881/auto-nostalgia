function MyVehicles() {
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
            Vehicle Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add, edit, and manage your vehicle profiles here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MyVehicles;
