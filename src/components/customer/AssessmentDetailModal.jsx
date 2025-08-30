import React from "react";

function AssessmentDetailModal({
  isOpen,
  onClose,
  assessment,
  onCancelRequest,
}) {
  if (!isOpen || !assessment) return null;

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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Assessment Request Details
          </h2>
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
          {/* Vehicle Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Vehicle</p>
                <p className="text-gray-900">
                  {assessment.vehicles?.year} {assessment.vehicles?.make}{" "}
                  {assessment.vehicles?.model}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Registration Number
                </p>
                <p className="text-gray-900">
                  {assessment.vehicles?.registration_number}
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Assessment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Assessment Type
                </p>
                <p className="text-gray-900">
                  {formatAssessmentType(assessment.assessment_type)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Urgency Level
                </p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(
                    assessment.urgency
                  )}`}
                >
                  {assessment.urgency.charAt(0).toUpperCase() +
                    assessment.urgency.slice(1)}{" "}
                  Priority
                </span>
              </div>
            </div>
          </div>

          {/* Status and Dates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Status & Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Status
                </p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    assessment.status
                  )}`}
                >
                  {assessment.status.charAt(0).toUpperCase() +
                    assessment.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Request Date
                </p>
                <p className="text-gray-900">
                  {formatDateTime(assessment.created_at)}
                </p>
              </div>
              {assessment.preferred_date && (
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Preferred Date
                  </p>
                  <p className="text-gray-900">
                    {formatDate(assessment.preferred_date)}
                    {assessment.preferred_time &&
                      ` at ${assessment.preferred_time}`}
                  </p>
                </div>
              )}
              {assessment.scheduled_date && (
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Scheduled Date
                  </p>
                  <p className="text-gray-900">
                    {formatDate(assessment.scheduled_date)}
                    {assessment.scheduled_time &&
                      ` at ${assessment.scheduled_time}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Phone Number
                </p>
                <p className="text-gray-900">
                  {assessment.contact_phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Email Address
                </p>
                <p className="text-gray-900">{assessment.contact_email}</p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {assessment.additional_notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Additional Notes
              </h3>
              <p className="text-gray-900">{assessment.additional_notes}</p>
            </div>
          )}

          {/* Assessment Results (if completed) */}
          {assessment.status === "completed" && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Assessment Results
              </h3>
              <div className="space-y-3">
                {assessment.vehicle_value && (
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Estimated Vehicle Value
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      R{assessment.vehicle_value.toLocaleString()}
                    </p>
                  </div>
                )}
                {assessment.completion_date && (
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Assessment Completed
                    </p>
                    <p className="text-blue-900">
                      {new Date(assessment.completion_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {assessment.assessment_notes && (
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Assessment Notes
                    </p>
                    <p className="text-blue-900">{assessment.assessment_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assigned Assessor */}
          {assessment.status === "approved" && assessment.assessor && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Assigned Assessor</span>
                </div>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <p className="text-gray-900">{assessment.assessor.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{assessment.assessor.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{assessment.assessor.email}</p>
                </div>
                {assessment.assessment_location && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assessment Location</p>
                    <p className="text-gray-900">{assessment.assessment_location}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          {assessment.status === "pending" && (
            <button
              onClick={() => onCancelRequest(assessment.id)}
              className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentDetailModal;
