import { useState, useEffect } from "react";
import { vehicleService } from "../../lib/vehicleService";
import { supabase } from "../../lib/supabase";

function EditVehicleModal({ isOpen, onClose, onSubmit, vehicle }) {
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

  // Populate form with vehicle data when modal opens
  useEffect(() => {
    if (vehicle && isOpen) {
      setFormData({
        make: vehicle.make || "",
        model: vehicle.model || "",
        variant: vehicle.variant || "",
        year: vehicle.year?.toString() || "",
        registration: vehicle.registration_number || "",
        vin: vehicle.vin || "",
        color: vehicle.color || "",
        mileage: vehicle.mileage?.toString() || "",
        engineSize: vehicle.engine_size || "",
        transmission: vehicle.transmission || "",
        fuelType: vehicle.fuel_type || "",
        bodyType: vehicle.body_type || "",
        numberOfDoors: vehicle.number_of_doors?.toString() || "",
        condition: vehicle.condition || "",
        modifications: vehicle.modifications || "",
        serviceHistory: vehicle.service_history || "",
        description: vehicle.description || "",
      });
      setErrors({});
    }
  }, [vehicle, isOpen]);

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

      if (!session || !session.user) {
        alert("Please log in again to edit the vehicle.");
        setIsSubmitting(false);
        return;
      }

      // Check if registration number already exists (excluding current vehicle)
      const registrationExists = await vehicleService.checkRegistrationExists(
        formData.registration,
        vehicle.id // Exclude current vehicle from check
      );
      if (registrationExists) {
        setErrors((prev) => ({
          ...prev,
          registration: "Registration number already exists",
        }));
        setIsSubmitting(false);
        return;
      }

      // Check if VIN already exists (excluding current vehicle)
      const vinExists = await vehicleService.checkVINExists(
        formData.vin,
        vehicle.id // Exclude current vehicle from check
      );
      if (vinExists) {
        setErrors((prev) => ({ ...prev, vin: "VIN already exists" }));
        setIsSubmitting(false);
        return;
      }

      // Update the vehicle in the database
      const updatedVehicle = await vehicleService.updateVehicle(
        vehicle.id,
        formData
      );

      // Call the onSubmit callback with the updated vehicle data
      if (onSubmit) {
        onSubmit(updatedVehicle);
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#333333ff]">Edit Vehicle</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 ${
                    errors.make
                      ? "border-red-500"
                      : "border-[#333333ff] focus:border-red-600"
                  }`}
                  placeholder="e.g., Ford"
                />
                {errors.make && (
                  <p className="text-red-500 text-xs mt-1">{errors.make}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 ${
                    errors.model
                      ? "border-red-500"
                      : "border-[#333333ff] focus:border-red-600"
                  }`}
                  placeholder="e.g., Mustang"
                />
                {errors.model && (
                  <p className="text-red-500 text-xs mt-1">{errors.model}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Variant
                </label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600"
                  placeholder="e.g., GT, SE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 ${
                    errors.year
                      ? "border-red-500"
                      : "border-[#333333ff] focus:border-red-600"
                  }`}
                  placeholder="e.g., 1967"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="registration"
                  value={formData.registration}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 ${
                    errors.registration
                      ? "border-red-500"
                      : "border-[#333333ff] focus:border-red-600"
                  }`}
                  placeholder="e.g., ABC123"
                />
                {errors.registration && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.registration}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  VIN *
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 ${
                    errors.vin
                      ? "border-red-500"
                      : "border-[#333333ff] focus:border-red-600"
                  }`}
                  placeholder="17-character VIN"
                  maxLength="17"
                />
                {errors.vin && (
                  <p className="text-red-500 text-xs mt-1">{errors.vin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 ${
                    errors.color
                      ? "border-red-500"
                      : "border-[#333333ff] focus:border-red-600"
                  }`}
                  placeholder="e.g., Red"
                />
                {errors.color && (
                  <p className="text-red-500 text-xs mt-1">{errors.color}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Mileage (km) *
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  className={`w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 ${
                    errors.mileage
                      ? "border-red-500"
                      : "border-[#333333ff] focus:border-red-600"
                  }`}
                  placeholder="e.g., 50000"
                  min="0"
                />
                {errors.mileage && (
                  <p className="text-red-500 text-xs mt-1">{errors.mileage}</p>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Engine Size
                </label>
                <input
                  type="text"
                  name="engineSize"
                  value={formData.engineSize}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600"
                  placeholder="e.g., 5.0L V8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Transmission
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600"
                >
                  <option value="">Select transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="semi-automatic">Semi-Automatic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600"
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
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Body Type
                </label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600"
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
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Number of Doors
                </label>
                <select
                  name="numberOfDoors"
                  value={formData.numberOfDoors}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600"
                >
                  <option value="">Select number of doors</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600"
                >
                  <option value="">Select condition</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Modifications
                </label>
                <textarea
                  name="modifications"
                  value={formData.modifications}
                  onChange={handleInputChange}
                  className="w-full h-20 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 py-3 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600 resize-none"
                  placeholder="Describe any modifications made to the vehicle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Service History
                </label>
                <textarea
                  name="serviceHistory"
                  value={formData.serviceHistory}
                  onChange={handleInputChange}
                  className="w-full h-20 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 py-3 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600 resize-none"
                  placeholder="Describe the service and maintenance history..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full h-20 rounded-3xl font-quicksand font-medium text-sm border-2 border-[#333333ff] outline-none px-6 py-3 bg-white text-[#333333ff] transition-all duration-200 focus:border-red-600 resize-none"
                  placeholder="Any additional notes or description..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-40 h-10 rounded-3xl font-quicksand font-bold text-xs outline-none cursor-pointer transition-all duration-300 shadow-md bg-white text-red-600 border-2 border-red-600 hover:scale-105 hover:bg-red-600 hover:text-white hover:shadow-lg active:scale-95 active:bg-red-700 active:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-40 h-10 rounded-3xl font-quicksand font-bold text-sm border-none outline-none cursor-pointer transition-all duration-300 shadow-md bg-red-600 text-white hover:scale-105 hover:bg-red-700 hover:shadow-lg active:scale-95 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Vehicle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditVehicleModal;
