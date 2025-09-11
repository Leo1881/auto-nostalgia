import { useState, useEffect } from "react";
import { vehicleService } from "../../lib/vehicleService";
import { supabase } from "../../lib/supabase";
import MultiImageUpload from "../common/MultiImageUpload";
import CustomSelect from "../common/CustomSelect";
import nhtsaService from "../../lib/nhtsaService";

function AddVehicleModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    variant: "",
    year: "",
    registration: "",
    vin: "",
    color: "",
    mileage: "",
    engineSize: "",
    transmission: "",
    fuelType: "",
    bodyType: "",
    numberOfDoors: "",
    condition: "",
    modifications: "",
    serviceHistory: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // NHTSA API data
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Load NHTSA data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadNHTSAData();
    }
  }, [isOpen]);

  const loadNHTSAData = async () => {
    setLoadingMakes(true);
    try {
      const [makesData, yearsData] = await Promise.all([
        nhtsaService.getAllMakes(),
        Promise.resolve(nhtsaService.getVehicleYears()),
      ]);
      setMakes(makesData);
      setYears(yearsData);
    } catch (error) {
      console.error("Error loading NHTSA data:", error);
    } finally {
      setLoadingMakes(false);
    }
  };

  const loadModelsForMake = async (make) => {
    if (!make) {
      setModels([]);
      return;
    }

    setLoadingModels(true);
    try {
      const modelsData = await nhtsaService.getModelsForMake(make);
      setModels(modelsData);
    } catch (error) {
      console.error("Error loading models:", error);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user makes selection
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // If make changes, load models for that make and reset model
    if (name === "make") {
      setFormData((prev) => ({
        ...prev,
        make: value,
        model: "", // Reset model when make changes
      }));
      loadModelsForMake(value);
    }
  };

  const handleImagesSelect = (filesWithSlots) => {
    // For add mode, we just need the files, not the slot information
    const files = filesWithSlots.map(({ file }) => file);
    setSelectedImages(files);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.make.trim()) newErrors.make = "Make is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.year.trim()) newErrors.year = "Year is required";
    if (!formData.registration.trim())
      newErrors.registration = "Registration is required";
    if (!formData.vin.trim()) newErrors.vin = "VIN is required";
    if (!formData.color.trim()) newErrors.color = "Color is required";
    if (!formData.mileage.trim()) newErrors.mileage = "Mileage is required";

    // Validate year range
    const year = parseInt(formData.year);
    if (year < 1900 || year > new Date().getFullYear() + 1) {
      newErrors.year = "Year must be between 1900 and next year";
    }

    // Validate mileage
    const mileage = parseInt(formData.mileage);
    if (mileage < 0) {
      newErrors.mileage = "Mileage must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("Session check:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionData: session,
      });

      if (!session || !session.user) {
        alert("Please log in again to add a vehicle.");
        setIsSubmitting(false);
        return;
      }

      // Check if registration number already exists
      const registrationExists = await vehicleService.checkRegistrationExists(
        formData.registration
      );
      if (registrationExists) {
        setErrors((prev) => ({
          ...prev,
          registration: "Registration number already exists",
        }));
        setIsSubmitting(false);
        return;
      }

      // Check if VIN already exists
      const vinExists = await vehicleService.checkVINExists(formData.vin);
      if (vinExists) {
        setErrors((prev) => ({ ...prev, vin: "VIN already exists" }));
        setIsSubmitting(false);
        return;
      }

      // Add the vehicle to the database
      const newVehicle = await vehicleService.addVehicle(
        formData,
        selectedImages
      );

      // Call the onSubmit callback with the new vehicle data
      if (onSubmit) {
        onSubmit(newVehicle);
      }

      // Close the modal
      onClose();

      // Reset form
      setFormData({
        make: "",
        model: "",
        variant: "",
        year: "",
        registration: "",
        vin: "",
        color: "",
        mileage: "",
        engineSize: "",
        transmission: "",
        fuelType: "",
        bodyType: "",
        numberOfDoors: "",
        condition: "",
        modifications: "",
        serviceHistory: "",
        description: "",
      });
      setSelectedImages([]);
      setModels([]); // Reset models when form is reset
    } catch (error) {
      console.error("Error adding vehicle:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Handle network connectivity issues
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_INTERNET_DISCONNECTED")
      ) {
        alert(
          "Network connection error. Please check your internet connection and try again."
        );
      }
      // Handle authentication errors
      else if (error.message.includes("User not authenticated")) {
        alert("Please log in again to add a vehicle.");
      }
      // Handle specific error types
      else if (error.message.includes("duplicate key")) {
        if (error.message.includes("registration_number")) {
          setErrors((prev) => ({
            ...prev,
            registration: "Registration number already exists",
          }));
        } else if (error.message.includes("vin")) {
          setErrors((prev) => ({ ...prev, vin: "VIN already exists" }));
        }
      } else {
        // Show a more specific error message
        const errorMessage =
          error.details || error.message || "Unknown error occurred";
        alert(`Error adding vehicle: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add New Vehicle
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Make *
                </label>
                <CustomSelect
                  options={makes}
                  value={formData.make}
                  onChange={(value) => handleSelectChange("make", value)}
                  placeholder={
                    loadingMakes ? "Loading makes..." : "Select vehicle make"
                  }
                  className="w-full"
                  disabled={loadingMakes}
                />
                {errors.make && (
                  <p className="text-red-500 text-sm mt-1">{errors.make}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model *
                </label>
                <CustomSelect
                  options={models}
                  value={formData.model}
                  onChange={(value) => handleSelectChange("model", value)}
                  placeholder={
                    loadingModels
                      ? "Loading models..."
                      : formData.make
                      ? "Select model"
                      : "Select make first"
                  }
                  className="w-full"
                  disabled={loadingModels || !formData.make}
                />
                {errors.model && (
                  <p className="text-red-500 text-sm mt-1">{errors.model}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Variant
                </label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., GT, Shelby"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <CustomSelect
                  options={years}
                  value={formData.year}
                  onChange={(value) => handleSelectChange("year", value)}
                  placeholder="Select vehicle year"
                  className="w-full"
                />
                {errors.year && (
                  <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="registration"
                  value={formData.registration}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                    errors.registration
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="e.g., ABC123"
                />
                {errors.registration && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.registration}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  VIN *
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                    errors.vin
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="17-character VIN"
                />
                {errors.vin && (
                  <p className="text-red-500 text-sm mt-1">{errors.vin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                    errors.color
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="e.g., Red, Blue"
                />
                {errors.color && (
                  <p className="text-red-500 text-sm mt-1">{errors.color}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mileage *
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                    errors.mileage
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="e.g., 50000"
                />
                {errors.mileage && (
                  <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vehicle Images
            </h3>
            <MultiImageUpload
              onImagesSelect={handleImagesSelect}
              label="Upload Vehicle Photos"
              className="max-w-full"
              maxImages={6}
            />
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Technical Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Engine Size/Type
                </label>
                <input
                  type="text"
                  name="engineSize"
                  value={formData.engineSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 5.0L V8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transmission
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="semi-automatic">Semi-Automatic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select fuel type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="lpg">LPG</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Body Type
                </label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select body type</option>
                  <option value="sedan">Sedan</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="wagon">Wagon</option>
                  <option value="suv">SUV</option>
                  <option value="pickup">Pickup</option>
                  <option value="van">Van</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Doors
                </label>
                <select
                  name="numberOfDoors"
                  value={formData.numberOfDoors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select number of doors</option>
                  <option value="2">2 doors</option>
                  <option value="3">3 doors</option>
                  <option value="4">4 doors</option>
                  <option value="5">5 doors</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select condition</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modifications
                </label>
                <textarea
                  name="modifications"
                  value={formData.modifications}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe any modifications made to the vehicle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service History
                </label>
                <textarea
                  name="serviceHistory"
                  value={formData.serviceHistory}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the service history and maintenance records..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description/Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Any additional notes or description about the vehicle..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-primary-red text-white rounded-lg transition-colors duration-200 font-medium ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-red-700"
              }`}
            >
              {isSubmitting ? "Adding Vehicle..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVehicleModal;
