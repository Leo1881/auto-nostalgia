import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import CustomSelect from "../common/CustomSelect";

function AssessorProfileSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    zipCode: "",
    country: "South Africa",
    // Assessor-specific fields
    experience: "",
    credentials: "",
    reason: "",
    location: "",
    contactMethod: "",
  });

  const experienceOptions = [
    { value: "Less than 1 year", label: "Less than 1 year" },
    { value: "1–2 years", label: "1–2 years" },
    { value: "3–5 years", label: "3–5 years" },
    { value: "6–10 years", label: "6–10 years" },
    { value: "11–15 years", label: "11–15 years" },
    { value: "16–20 years", label: "16–20 years" },
    { value: "Over 20 years", label: "Over 20 years" },
  ];

  const contactMethodOptions = [
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "both", label: "Both" },
  ];

  const provinceOptions = [
    { value: "Eastern Cape", label: "Eastern Cape" },
    { value: "Free State", label: "Free State" },
    { value: "Gauteng", label: "Gauteng" },
    { value: "KwaZulu-Natal", label: "KwaZulu-Natal" },
    { value: "Limpopo", label: "Limpopo" },
    { value: "Mpumalanga", label: "Mpumalanga" },
    { value: "Northern Cape", label: "Northern Cape" },
    { value: "North West", label: "North West" },
    { value: "Western Cape", label: "Western Cape" },
  ];

  const countryOptions = [
    { value: "South Africa", label: "South Africa" },
    { value: "Australia", label: "Australia" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "United States", label: "United States" },
    { value: "Canada", label: "Canada" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Other", label: "Other" },
  ];

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Clear message when component unmounts
  useEffect(() => {
    return () => {
      setMessage({ type: "", text: "" });
    };
  }, []);

  // Debug: Monitor formData changes
  useEffect(() => {
    console.log("🔄 Form data changed:", formData);
  }, [formData]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Load profile data (now includes all assessor information)
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        setMessage({ type: "error", text: "Failed to load profile" });
        return;
      }

      setProfile(profileData);

      // Set form data with consolidated profile information
      const newFormData = {
        fullName: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        city: profileData.city || "",
        province: profileData.province || "",
        zipCode: profileData.zip_code || "",
        country: profileData.country || "South Africa",
        // Assessor-specific fields (now in profiles table)
        experience: profileData.experience || "",
        contactMethod: profileData.contact_method || "",
        // Note: location field is now stored as city/province in profiles
        location: profileData.city || "",
      };

      setFormData(newFormData);

      console.log("📋 Loaded consolidated profile data:", profileData);
      console.log("📋 Form data being set:", newFormData);
    } catch (error) {
      console.error("Error loading data:", error);
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

    try {
      // Update profile with all data (consolidated structure)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          zip_code: formData.zipCode,
          country: formData.country,
          // Assessor-specific fields
          experience: formData.experience,
          contact_method: formData.contactMethod,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Reload data
      await loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-xl font-bold text-[#333333ff] mb-2">
          Assessor Profile Settings
        </h1>
        <p className="text-sm text-[#333333ff]">
          Manage your professional information and preferences.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {message.text && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                  required
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
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                  required
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
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Province
                  </label>
                  <CustomSelect
                    value={formData.province}
                    onChange={(value) =>
                      handleInputChange({ target: { name: "province", value } })
                    }
                    options={provinceOptions}
                    placeholder="Select Province"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <CustomSelect
                  value={formData.country}
                  onChange={(value) =>
                    handleInputChange({ target: { name: "country", value } })
                  }
                  options={countryOptions}
                  placeholder="Select Country"
                  required
                />
              </div>
            </div>
          </div>

          {/* Assessor-Specific Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Years of Experience
                </label>
                <CustomSelect
                  value={formData.experience}
                  onChange={(value) =>
                    handleInputChange({ target: { name: "experience", value } })
                  }
                  options={experienceOptions}
                  placeholder="Select Experience Level"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Contact Method
                </label>
                <CustomSelect
                  value={formData.contactMethod}
                  onChange={(value) =>
                    handleInputChange({
                      target: { name: "contactMethod", value },
                    })
                  }
                  options={contactMethodOptions}
                  placeholder="Select Contact Method"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Area/Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900"
                placeholder="e.g., Cape Town CBD, Northern Suburbs"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssessorProfileSettings;
