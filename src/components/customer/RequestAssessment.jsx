import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import CustomSelect from "../common/CustomSelect";

function RequestAssessment() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [vehicles, setVehicles] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    vehicleId: "",
    assessmentType: "",
    preferredDate: "",
    preferredTime: "",
    urgency: "normal",
    additionalNotes: "",
    contactPhone: "",
    contactEmail: "",
    // Vehicle Information Fields
    chassisNumber: "",
    engineNumber: "",
    meanMcgregorCode: "",
    warranty: "",
    warrantyExpiration: "",
    currentOdometer: "",
    fullServiceHistory: "",
    rebuiltBodyWork: "",
    rebuiltEngineWork: "",
    accessories: "",
    currentDamages: "",
    previousBodyWork: "",
  });

  const assessmentTypes = [
    { value: "pre_purchase", label: "Pre-Purchase Inspection" },
    { value: "condition_report", label: "Condition Report" },
    { value: "valuation", label: "Valuation Assessment" },
    { value: "safety_check", label: "Safety Check" },
    { value: "comprehensive", label: "Comprehensive Assessment" },
  ];

  const urgencyLevels = [
    { value: "low", label: "Low Priority" },
    { value: "normal", label: "Normal Priority" },
    { value: "high", label: "High Priority" },
    { value: "urgent", label: "Urgent" },
  ];

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

  useEffect(() => {
    if (user) {
      loadUserVehicles();
      loadUserProfile();
    }
  }, [user]);

  // Clear message when component unmounts
  useEffect(() => {
    return () => {
      setMessage({ type: "", text: "" });
    };
  }, []);

  const loadUserVehicles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading vehicles:", error);
        setMessage({ type: "error", text: "Failed to load vehicles" });
      } else {
        console.log("Loaded vehicles:", data);
        setVehicles(data || []);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
      setMessage({ type: "error", text: "Failed to load vehicles" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("phone, email")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
        setFormData((prev) => ({
          ...prev,
          contactPhone: data.phone || "",
          contactEmail: data.email || user.email || "",
        }));
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

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
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (!formData.vehicleId) {
      setMessage({ type: "error", text: "Please select a vehicle" });
      setIsSubmitting(false);
      return;
    }

    if (!formData.assessmentType) {
      setMessage({ type: "error", text: "Please select an assessment type" });
      setIsSubmitting(false);
      return;
    }

    if (!formData.preferredDate) {
      setMessage({ type: "error", text: "Please select a preferred date" });
      setIsSubmitting(false);
      return;
    }

    const assessmentData = {
      user_id: user.id,
      vehicle_id: formData.vehicleId,
      assessment_type: formData.assessmentType,
      preferred_date: formData.preferredDate,
      preferred_time: formData.preferredTime,
      urgency: formData.urgency,
      additional_notes: formData.additionalNotes,
      contact_phone: formData.contactPhone,
      contact_email: formData.contactEmail,
      // Vehicle Information Fields
      chassis_number: formData.chassisNumber,
      engine_number: formData.engineNumber,
      mean_mcgregor_code: formData.meanMcgregorCode,
      warranty: formData.warranty,
      warranty_expiration: formData.warrantyExpiration,
      current_odometer: formData.currentOdometer,
      full_service_history: formData.fullServiceHistory,
      rebuilt_body_work: formData.rebuiltBodyWork,
      rebuilt_engine_work: formData.rebuiltEngineWork,
      accessories: formData.accessories,
      current_damages: formData.currentDamages,
      previous_body_work: formData.previousBodyWork,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("assessment_requests")
        .insert(assessmentData)
        .select();

      if (error) {
        console.error("Error submitting assessment request:", error);
        setMessage({
          type: "error",
          text: "Failed to submit assessment request",
        });
      } else {
        console.log("Assessment request submitted successfully:", data);
        setMessage({
          type: "success",
          text: "Assessment request submitted successfully! We'll contact you soon.",
        });

        // Reset form
        setFormData({
          vehicleId: "",
          assessmentType: "",
          preferredDate: "",
          preferredTime: "",
          urgency: "normal",
          additionalNotes: "",
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          // Reset vehicle information fields
          chassisNumber: "",
          engineNumber: "",
          meanMcgregorCode: "",
          warranty: "",
          warrantyExpiration: "",
          currentOdometer: "",
          fullServiceHistory: "",
          rebuiltBodyWork: "",
          rebuiltEngineWork: "",
          accessories: "",
          currentDamages: "",
          previousBodyWork: "",
        });
      }
    } catch (error) {
      console.error("Error submitting assessment request:", error);
      setMessage({
        type: "error",
        text: "Failed to submit assessment request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-xl font-bold text-[#333333ff] mb-2">
          Request Assessment
        </h1>
        <p className="text-sm text-[#333333ff]">
          Submit a request to have your vehicle professionally assessed.
        </p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Assessment Form */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {vehicles.length === 0 ? (
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Vehicles Found
            </h3>
            <p className="text-gray-600 mb-4">
              You need to add a vehicle before requesting an assessment.
            </p>
            <button
              onClick={() => (window.location.href = "/my-vehicles")}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vehicle *
              </label>
              <CustomSelect
                options={vehicles
                  .filter((vehicle) => vehicle.id) // Only include vehicles with valid IDs
                  .map((vehicle) => ({
                    value: vehicle.id,
                    label: `${vehicle.year || "N/A"} ${vehicle.make || "N/A"} ${
                      vehicle.model || "N/A"
                    }${vehicle.variant ? ` ${vehicle.variant}` : ""} (${
                      vehicle.registration_number || "N/A"
                    })`,
                  }))}
                value={formData.vehicleId}
                onChange={(value) => handleSelectChange("vehicleId", value)}
                placeholder="Choose a vehicle"
                className="w-full"
              />
            </div>

            {/* Assessment Type */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Type *
              </label>
              <CustomSelect
                options={assessmentTypes}
                value={formData.assessmentType}
                onChange={(value) =>
                  handleSelectChange("assessmentType", value)
                }
                placeholder="Select assessment type"
                className="w-full"
              />
            </div>

            {/* Vehicle Information Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vehicle Information
              </h3>

              {/* Chassis Number and Engine Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleInputChange}
                    placeholder="Enter chassis number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine Number
                  </label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleInputChange}
                    placeholder="Enter engine number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Mean and McGregor Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mean and McGregor Code
                </label>
                <input
                  type="text"
                  name="meanMcgregorCode"
                  value={formData.meanMcgregorCode}
                  onChange={handleInputChange}
                  placeholder="Enter Mean and McGregor code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                />
              </div>

              {/* Warranty Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty
                  </label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    placeholder="Warranty details"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Expiration
                  </label>
                  <input
                    type="date"
                    name="warrantyExpiration"
                    value={formData.warrantyExpiration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Current Odometer Reading */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Odometer Reading
                </label>
                <input
                  type="number"
                  name="currentOdometer"
                  value={formData.currentOdometer}
                  onChange={handleInputChange}
                  placeholder="Enter current odometer reading"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                />
              </div>

              {/* Full Service History */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Service History
                </label>
                <textarea
                  name="fullServiceHistory"
                  value={formData.fullServiceHistory}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the vehicle's service history..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 resize-none"
                />
              </div>

              {/* Rebuilt Work */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rebuilt - Body Work
                  </label>
                  <textarea
                    name="rebuiltBodyWork"
                    value={formData.rebuiltBodyWork}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe any body work rebuilds..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rebuilt - Engine Work
                  </label>
                  <textarea
                    name="rebuiltEngineWork"
                    value={formData.rebuiltEngineWork}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe any engine rebuilds..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Accessories */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessories
                </label>
                <textarea
                  name="accessories"
                  value={formData.accessories}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="List any accessories or modifications..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 resize-none"
                />
              </div>

              {/* Current Damages */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Damages
                </label>
                <textarea
                  name="currentDamages"
                  value={formData.currentDamages}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe any current damages or issues..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 resize-none"
                />
              </div>

              {/* Previous Body Work */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Body Work
                </label>
                <textarea
                  name="previousBodyWork"
                  value={formData.previousBodyWork}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe any previous body work or repairs..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <CustomSelect
                  options={timeSlots}
                  value={formData.preferredTime}
                  onChange={(value) =>
                    handleSelectChange("preferredTime", value)
                  }
                  placeholder="Select time"
                  className="w-full"
                />
              </div>
            </div>

            {/* Urgency Level */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <CustomSelect
                options={urgencyLevels}
                value={formData.urgency}
                onChange={(value) => handleSelectChange("urgency", value)}
                placeholder="Select urgency"
                className="w-full"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any specific concerns or requirements for the assessment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 resize-none"
              />
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-40 px-6 py-2 bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RequestAssessment;
