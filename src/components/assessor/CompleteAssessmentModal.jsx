import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

function CompleteAssessmentModal({
  isOpen,
  onClose,
  assessment,
  onCompletionSuccess,
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleValue: "",
    assessmentNotes: "",
    completionDate: new Date().toISOString().split("T")[0],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicleValue) {
      alert("Please enter the vehicle value.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Completing assessment:", {
        assessmentId: assessment.id,
        vehicleValue: formData.vehicleValue,
        notes: formData.assessmentNotes,
      });

      // Update the assessment request with completion information
      const { data, error } = await supabase
        .from("assessment_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          vehicle_value: parseFloat(formData.vehicleValue),
          assessment_notes: formData.assessmentNotes,
          completion_date: formData.completionDate,
        })
        .eq("id", assessment.id)
        .select();

      console.log("Completion result:", { data, error });

      if (error) {
        console.error("Error completing assessment:", error);
        alert("Failed to complete assessment. Please try again.");
        return;
      }

      console.log("Assessment completed successfully! Calling callback...");
      onCompletionSuccess();
      onClose();

      // Reset form
      setFormData({
        vehicleValue: "",
        assessmentNotes: "",
        completionDate: new Date().toISOString().split("T")[0],
      });

      // Show success message
      setTimeout(() => {
        alert("Assessment completed successfully!");
      }, 100);
    } catch (error) {
      console.error("Error completing assessment:", error);
      alert("Failed to complete assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-[#333333ff]">
              Complete Assessment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {assessment.vehicles?.year} {assessment.vehicles?.make}{" "}
              {assessment.vehicles?.model}
            </p>
            <p className="text-sm text-gray-600">
              Customer: {assessment.profiles?.full_name}
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
          {/* Assessment Information */}
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
                  {assessment.assessment_type
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Scheduled Date
                </p>
                <p className="text-sm text-gray-900">
                  {assessment.scheduled_date
                    ? new Date(assessment.scheduled_date).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Vehicle Registration
                </p>
                <p className="text-sm text-gray-900">
                  {assessment.vehicles?.registration_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Vehicle Mileage
                </p>
                <p className="text-sm text-gray-900">
                  {assessment.vehicles?.mileage}km
                </p>
              </div>
            </div>
          </div>

          {/* Completion Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333ff]">
              Assessment Results
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Value (R)
              </label>
              <input
                type="number"
                name="vehicleValue"
                value={formData.vehicleValue}
                onChange={handleInputChange}
                placeholder="Enter estimated vehicle value"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Date
              </label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Notes
              </label>
              <textarea
                name="assessmentNotes"
                value={formData.assessmentNotes}
                onChange={handleInputChange}
                placeholder="Enter detailed assessment findings, condition notes, recommendations, etc."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Completing..." : "Complete Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteAssessmentModal;
