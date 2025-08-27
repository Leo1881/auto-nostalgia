import { useState } from "react";
import { LOADING_TEXT, BUTTON_STATES } from "../../constants/loadingStates";

function AssessorRequestCard({ request, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    await onStatusUpdate(request.id, newStatus);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-red to-red-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {request.profiles?.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {request.profiles?.full_name || "Unknown User"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {request.profiles?.email || "No email"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                request.status
              )}`}
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  showDetails ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Location
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {request.location || "Not specified"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Experience
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {request.experience || "Not specified"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Contact Method
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {request.contact_method || "Not specified"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Submitted
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(request.created_at)}
            </p>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Phone Number
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {request.phone_number || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  User ID
                </p>
                <p className="text-sm text-gray-900 dark:text-white font-mono">
                  {request.user_id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {request.status === "pending" && (
          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleStatusUpdate("rejected")}
              disabled={loading}
              className={loading ? BUTTON_STATES.ACTION.LOADING : "px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"}
            >
              {loading ? LOADING_TEXT.PROCESSING : "Reject"}
            </button>
            <button
              onClick={() => handleStatusUpdate("approved")}
              disabled={loading}
              className={loading ? "px-6 py-3 bg-green-600 text-white rounded-lg opacity-75 cursor-not-allowed transition-all duration-200 shadow-md font-semibold" : "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"}
            >
              {loading ? LOADING_TEXT.PROCESSING : "Approve"}
            </button>
          </div>
        )}

        {/* Status Update Info */}
        {request.status !== "pending" && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Status:</span> This request has been{" "}
              <span
                className={`font-medium ${
                  getStatusColor(request.status)
                    .replace("bg-", "text-")
                    .split(" ")[0]
                }`}
              >
                {request.status}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssessorRequestCard;
