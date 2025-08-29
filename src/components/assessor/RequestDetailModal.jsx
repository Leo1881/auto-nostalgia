import React from "react";

function RequestDetailModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAssessmentType = (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "low":
        return "bg-green-100 text-green-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-[#333333ff]">
              Assessment Request Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {request.vehicles?.year} {request.vehicles?.make}{" "}
              {request.vehicles?.model}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                request.status
              )}`}
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(
                request.urgency
              )}`}
            >
              {request.urgency.charAt(0).toUpperCase() +
                request.urgency.slice(1)}{" "}
              Priority
            </span>
          </div>

          {/* Vehicle Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#333333ff] mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-red-600"
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
              Vehicle Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Year</p>
                <p className="text-sm text-gray-900">
                  {request.vehicles?.year}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Make</p>
                <p className="text-sm text-gray-900">
                  {request.vehicles?.make}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Model</p>
                <p className="text-sm text-gray-900">
                  {request.vehicles?.model}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Registration Number
                </p>
                <p className="text-sm text-gray-900">
                  {request.vehicles?.registration_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">VIN</p>
                <p className="text-sm text-gray-900">
                  {request.vehicles?.vin || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Mileage</p>
                <p className="text-sm text-gray-900">
                  {request.vehicles?.mileage
                    ? `${request.vehicles.mileage.toLocaleString()} km`
                    : "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#333333ff] mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-sm text-gray-900">
                  {request.profiles?.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">
                  {request.profiles?.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-sm text-gray-900">
                  {request.profiles?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-900">
                  {request.profiles?.city}, {request.profiles?.province}
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#333333ff] mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-green-600"
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
              Assessment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Assessment Type
                </p>
                <p className="text-sm text-gray-900">
                  {formatAssessmentType(request.assessment_type)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Request Date
                </p>
                <p className="text-sm text-gray-900">
                  {formatDateTime(request.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Preferred Date
                </p>
                <p className="text-sm text-gray-900">
                  {request.preferred_date
                    ? formatDate(request.preferred_date)
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Preferred Time
                </p>
                <p className="text-sm text-gray-900">
                  {request.preferred_time || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {request.additional_notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#333333ff] mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-600"
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
                Additional Notes
              </h3>
              <p className="text-sm text-gray-900">
                {request.additional_notes}
              </p>
            </div>
          )}

          {/* Rejection Reason (if rejected) */}
          {request.rejection_reason && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-600"
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
                Rejection Reason
              </h3>
              <p className="text-sm text-red-800">{request.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestDetailModal;
