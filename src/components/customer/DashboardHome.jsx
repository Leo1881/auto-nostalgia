import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import AddVehicleModal from "./AddVehicleModal";

function DashboardHome() {
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const { profile } = useAuth();

  const handleAddVehicle = (vehicleData) => {
    console.log("Vehicle added successfully:", vehicleData);
    alert(
      "Vehicle added successfully! You can view it in the 'My Vehicles' section."
    );
  };

  const handleCloseModal = () => {
    setIsAddVehicleModalOpen(false);
  };

  // Stats data - using mock data for now
  const stats = {
    totalAssessments: 5,
    pendingRequests: 2,
    completedAssessments: 3,
    totalVehicles: 4, // Will be updated when we implement proper state management
  };

  const recentAssessments = [
    {
      id: 1,
      vehicle: "1967 Ford Mustang",
      status: "Completed",
      date: "2024-01-15",
      value: "$45,000",
    },
    {
      id: 2,
      vehicle: "1972 Chevrolet Camaro",
      status: "Pending",
      date: "2024-01-20",
      value: "Pending",
    },
  ];

  const quickActions = [
    {
      title: "Request New Assessment",
      description: "Get your vehicle appraised by our experts",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
      action: () => console.log("Request assessment"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Add New Vehicle",
      description: "Add a new vehicle to your profile",
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      action: () => setIsAddVehicleModalOpen(true),
      color: "bg-green-500 hover:bg-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Here's what's happening with your vehicle assessments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">
                Total Assessments
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {stats.totalAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg
                className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">
                Pending Requests
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {stats.pendingRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">
                Completed
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {stats.completedAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg
                className="w-4 h-4 text-purple-600 dark:text-purple-400"
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
            <div className="ml-3 flex items-center space-x-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">
                Total Vehicles
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {stats.totalVehicles}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="mb-6"></div>

      {/* Top spacer for quick actions */}
      <div className="mt-6"></div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="bg-primary-red rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-200 text-left w-full mt-6"
          >
            <div className="flex items-center">
              <div
                className={`p-2 sm:p-3 rounded-lg text-white ${action.color}`}
              >
                {action.icon}
              </div>
              <div className="ml-3 sm:ml-4 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-white text-opacity-80">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Assessments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
          Recent Assessments
        </h2>
        <div className="space-y-3 sm:space-y-4">
          {recentAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2 sm:space-y-0"
            >
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {assessment.vehicle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(assessment.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col sm:text-right space-y-1 sm:space-y-0">
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-sm font-medium w-fit ${
                    assessment.status === "Completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {assessment.status}
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Assessment Value: {assessment.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
}

export default DashboardHome;
