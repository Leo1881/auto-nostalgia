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
        return "bg-red-200 text-red-700";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-red-700">
                {request.profiles?.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#333333ff]">
                {request.profiles?.full_name || "Unknown User"}
              </h3>
              <p className="text-xs text-[#333333ff]">
                {request.profiles?.email || "No email"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                request.status
              )}`}
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${
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
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-[#333333ff] mb-1">
              Location
            </p>
            <p className="text-xs text-[#333333ff]">
              {request.location || "Not specified"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-[#333333ff] mb-1">
              Experience
            </p>
            <p className="text-xs text-[#333333ff]">
              {request.experience || "Not specified"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-[#333333ff] mb-1">
              Contact Method
            </p>
            <p className="text-xs text-[#333333ff]">
              {request.contact_method || "Not specified"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-[#333333ff] mb-1">
              Submitted
            </p>
            <p className="text-xs text-[#333333ff]">
              {formatDate(request.created_at)}
            </p>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs font-medium text-[#333333ff] mb-1">
                  Phone Number
                </p>
                <p className="text-xs text-[#333333ff]">
                  {request.phone_number || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#333333ff] mb-1">
                  User ID
                </p>
                <p className="text-xs text-[#333333ff] font-mono">
                  {request.user_id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {request.status === "pending" && (
          <div className="flex items-center justify-end space-x-3 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleStatusUpdate("rejected")}
              disabled={loading}
              className={
                loading
                  ? BUTTON_STATES.ACTION.LOADING
                  : "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold text-xs"
              }
            >
              {loading ? LOADING_TEXT.PROCESSING : "Reject"}
            </button>
            <button
              onClick={() => handleStatusUpdate("approved")}
              disabled={loading}
              className={
                loading
                  ? "px-4 py-2 bg-green-600 text-white rounded-lg opacity-75 cursor-not-allowed transition-all duration-200 shadow-sm font-semibold text-xs"
                  : "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold text-xs"
              }
            >
              {loading ? LOADING_TEXT.PROCESSING : "Approve"}
            </button>
          </div>
        )}

        {/* Status Update Info */}
        {request.status !== "pending" && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-[#333333ff]">
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
