import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

function ScheduleAssessmentModal({
  isOpen,
  onClose,
  request,
  onScheduleSuccess,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    location: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.scheduledDate || !formData.scheduledTime) {
      alert("Please select a date and time for the assessment.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Updating assessment request:", {
        requestId: request.id,
        userId: user.id,
        formData: formData,
      });

      // Update the assessment request with scheduling information
      const { data, error } = await supabase
        .from("assessment_requests")
        .update({
          status: "approved",
          assigned_assessor_id: user.id,
          assigned_at: new Date().toISOString(),
          scheduled_date: formData.scheduledDate,
          scheduled_time: formData.scheduledTime,
          assessment_location: formData.location,
          assessment_notes: formData.notes,
        })
        .eq("id", request.id)
        .select();

      console.log("Update result:", { data, error });

      if (error) {
        console.error("Error scheduling assessment:", error);
        alert("Failed to schedule assessment. Please try again.");
        return;
      }

            // Call success callback
      onScheduleSuccess();
      onClose();
      
      // Show success message after callback
      setTimeout(() => {
        alert("Assessment scheduled successfully!");
      }, 100);

      // Reset form
      setFormData({
        scheduledDate: "",
        scheduledTime: "",
        location: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error scheduling assessment:", error);
      alert("Failed to schedule assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-[#333333ff]">
              Schedule Assessment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {request.vehicles?.year} {request.vehicles?.make}{" "}
              {request.vehicles?.model}
            </p>
            <p className="text-sm text-gray-600">
              Customer: {request.profiles?.full_name}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Assessment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#333333ff] mb-4">
              Assessment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Assessment Type
                </p>
                <p className="text-sm text-gray-900">
                  {request.assessment_type
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Customer Preferred Date
                </p>
                <p className="text-sm text-gray-900">
                  {request.preferred_date
                    ? new Date(request.preferred_date).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Customer Preferred Time
                </p>
                <p className="text-sm text-gray-900">
                  {request.preferred_time || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Urgency</p>
                <p className="text-sm text-gray-900 capitalize">
                  {request.urgency}
                </p>
              </div>
            </div>
          </div>

          {/* Scheduling Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333ff]">
              Schedule Assessment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Time *
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter assessment location (e.g., customer's address, workshop, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes for the customer or about the assessment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleAssessmentModal;
