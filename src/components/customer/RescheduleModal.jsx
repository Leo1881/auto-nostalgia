import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import CustomSelect from "../common/CustomSelect";

function RescheduleModal({ isOpen, onClose, assessment, onRescheduleSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
  });

  const timeSlots = [
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
  ];

  // Initialize form data when assessment changes
  React.useEffect(() => {
    if (assessment) {
      setFormData({
        preferredDate: assessment.preferred_date || "",
        preferredTime: assessment.preferred_time || "",
      });
    }
  }, [assessment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.preferredDate) {
      alert("Please select a preferred date");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("assessment_requests")
        .update({
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessment.id);

      if (error) {
        console.error("Error rescheduling assessment request:", error);
        alert("Failed to reschedule assessment request. Please try again.");
      } else {
        console.log("Assessment request rescheduled successfully");
        onRescheduleSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error rescheduling assessment request:", error);
      alert("Failed to reschedule assessment request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Reschedule Assessment
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
        <div className="p-6">
          {/* Vehicle Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vehicle
            </h3>
            <p className="text-gray-600">
              {assessment.vehicles?.year} {assessment.vehicles?.make}{" "}
              {assessment.vehicles?.model}
            </p>
            <p className="text-sm text-gray-500">
              Registration: {assessment.vehicles?.registration_number}
            </p>
          </div>

          {/* Current Schedule */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Current Schedule
            </h3>
            <p className="text-gray-600">
              {assessment.preferred_date
                ? new Date(assessment.preferred_date).toLocaleDateString()
                : "Not set"}
              {assessment.preferred_time && ` at ${assessment.preferred_time}`}
            </p>
          </div>

          {/* Reschedule Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Preferred Date *
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                min={today}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Preferred Time
              </label>
              <CustomSelect
                options={timeSlots}
                value={formData.preferredTime}
                onChange={(value) => handleSelectChange("preferredTime", value)}
                placeholder="Select time (optional)"
              />
            </div>

            {/* Note */}
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> Rescheduling your assessment request will
                update your preferred date and time. Our team will review your
                new preferences and contact you to confirm the final schedule.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.preferredDate}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Rescheduling..." : "Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RescheduleModal;
