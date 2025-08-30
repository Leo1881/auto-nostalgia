import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import CustomSelect from "../common/CustomSelect";

function ProfileSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "South Africa",
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Clear message when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      setMessage({ type: "", text: "" });
    };
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    console.log("Loading profile for user:", user.id);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Profile data response:", { data, error });

      if (error) {
        console.error("Error loading profile:", error);
        if (error.code === "PGRST116") {
          // No profile found - this is normal for new users
          console.log(
            "No profile found for user, will create one when they save"
          );
          setFormData({
            firstName: "",
            lastName: "",
            email: user.email || "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "South Africa",
          });
        } else {
          setMessage({ type: "error", text: "Failed to load profile data" });
        }
      } else if (data) {
        console.log("Profile data loaded:", data);
        console.log("Phone from DB:", data.phone);
        console.log("Address from DB:", data.address);
        console.log("City from DB:", data.city);
        console.log("State from DB:", data.state);
        console.log("Zip code from DB:", data.zip_code);
        console.log("Country from DB:", data.country);

        // Split full_name into first and last name if it exists
        let firstName = "";
        let lastName = "";
        if (data.full_name) {
          const nameParts = data.full_name.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }

        setFormData({
          firstName: firstName,
          lastName: lastName,
          email: data.email || user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zip_code || "",
          country: data.country || "South Africa",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({ type: "error", text: "Failed to load profile data" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    // Combine first and last name into full_name
    const fullName = [formData.firstName, formData.lastName]
      .filter(Boolean)
      .join(" ");

    const profileData = {
      id: user.id,
      full_name: fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      province: formData.state, // Also save to province field for matching
      zip_code: formData.zipCode,
      country: formData.country,
      updated_at: new Date().toISOString(),
    };

    console.log("Saving profile data:", profileData);
    console.log("Phone being saved:", formData.phone);
    console.log("Address being saved:", formData.address);
    console.log("City being saved:", formData.city);
    console.log("State being saved:", formData.state);
    console.log("Zip code being saved:", formData.zipCode);
    console.log("Country being saved:", formData.country);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileData)
        .select();

      console.log("Save response:", { data, error });

      if (error) {
        console.error("Error updating profile:", error);
        setMessage({ type: "error", text: "Failed to update profile" });
      } else {
        console.log("Profile saved successfully:", data);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

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
          Profile Settings
        </h1>
        <p className="text-sm text-[#333333ff]">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-not-allowed"
                  placeholder="Your email address"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Address Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                  placeholder="Enter your street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                    placeholder="Enter your city"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Province
                  </label>
                  <CustomSelect
                    value={formData.state}
                    onChange={(value) =>
                      handleInputChange({
                        target: { name: "state", value },
                      })
                    }
                    options={[
                      { value: "Eastern Cape", label: "Eastern Cape" },
                      { value: "Free State", label: "Free State" },
                      { value: "Gauteng", label: "Gauteng" },
                      { value: "KwaZulu-Natal", label: "KwaZulu-Natal" },
                      { value: "Limpopo", label: "Limpopo" },
                      { value: "Mpumalanga", label: "Mpumalanga" },
                      { value: "Northern Cape", label: "Northern Cape" },
                      { value: "North West", label: "North West" },
                      { value: "Western Cape", label: "Western Cape" },
                    ]}
                    placeholder="Select your province"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                    placeholder="Enter your postal code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                >
                  <option value="South Africa">South Africa</option>
                  <option value="Australia">Australia</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;
