import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import CustomSelect from "../common/CustomSelect";
import Lottie from "@lottielab/lottie-player/react";
import { LOADING_TEXT, BUTTON_STATES } from "../../constants/loadingStates";

function SignUpForm({ onBack }) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    credentials: "",
    experience: "",
    reason: "",
    phoneNumber: "",
    location: "",
    contactMethod: "",
    // Additional profile fields
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "South Africa",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password requirements
    if (!validatePassword(formData.password)) {
      setError("Password does not meet requirements");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");

    console.log("📝 Submitting signup with data:", {
      email: formData.email,
      role: formData.role,
      phoneNumber: formData.phoneNumber,
      location: formData.location,
      contactMethod: formData.contactMethod,
      experience: formData.experience,
    });

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.name,
      role: formData.role,
      credentials: formData.credentials,
      experience: formData.experience,
      reason: formData.reason,
      phoneNumber: formData.phoneNumber,
      location: formData.location,
      contactMethod: formData.contactMethod,
      // Additional profile fields
      address: formData.address,
      city: formData.city,
      state: formData.state,
      province: formData.state, // Also save to province field for matching
      zipCode: formData.zipCode,
      country: formData.country,
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate password when password field changes
    if (name === "password") {
      validatePassword(value);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 pt-6 pb-6 sm:pb-8 font-quicksand">
      <div className="w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col justify-between">
        {/* Container 1: Logo */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/an_plain.png"
              alt="Auto Nostalgia"
              className="mx-auto max-w-[160px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px]"
            />
          </div>
        </div>

        {/* Container 2: Content */}
        <div
          className="flex-1 flex flex-col justify-start pt-16"
          style={{ paddingTop: "30px" }}
        >
          {!success ? (
            <>
              {/* Form State */}
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold text-[#333333ff] mb-2">
                  Create Account
                </h1>
                <p className="text-sm text-[#333333ff]">
                  Start your nostalgia journey
                </p>
              </div>

              <div className="p-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col w-full max-w-[800px] mx-auto"
                >
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4"
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                      style={{
                        marginTop: "16px",
                      }}
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4"
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4"
                      placeholder="Create a password"
                      required
                      disabled={loading}
                    />
                    <div className="ml-6 space-y-1 mb-4">
                      <div
                        className={`flex items-center text-xs ${
                          passwordRequirements.length
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                        style={{ fontSize: "10px" }}
                      >
                        <div className="mr-2 w-3 h-3 flex items-center justify-center">
                          {passwordRequirements.length ? (
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            </svg>
                          )}
                        </div>
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center text-xs ${
                          passwordRequirements.uppercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                        style={{ fontSize: "10px" }}
                      >
                        <div className="mr-2 w-3 h-3 flex items-center justify-center">
                          {passwordRequirements.uppercase ? (
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            </svg>
                          )}
                        </div>
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center text-xs ${
                          passwordRequirements.lowercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                        style={{ fontSize: "10px" }}
                      >
                        <div className="mr-2 w-3 h-3 flex items-center justify-center">
                          {passwordRequirements.lowercase ? (
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            </svg>
                          )}
                        </div>
                        One lowercase letter
                      </div>
                      <div
                        className={`flex items-center text-xs ${
                          passwordRequirements.number
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                        style={{ fontSize: "10px" }}
                      >
                        <div className="mr-2 w-3 h-3 flex items-center justify-center">
                          {passwordRequirements.number ? (
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            </svg>
                          )}
                        </div>
                        One number
                      </div>
                      <div
                        className={`flex items-center text-xs ${
                          passwordRequirements.special
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                        style={{ fontSize: "10px" }}
                      >
                        <div className="mr-2 w-3 h-3 flex items-center justify-center">
                          {passwordRequirements.special ? (
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            </svg>
                          )}
                        </div>
                        One special character (!@#$%^&*)
                      </div>
                    </div>
                  </div>

                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4"
                      placeholder="Confirm password"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Role Selector */}
                  <div>
                    <CustomSelect
                      value={formData.role}
                      onChange={(value) =>
                        handleInputChange({ target: { name: "role", value } })
                      }
                      options={[
                        { value: "customer", label: "Customer" },
                        {
                          value: "assessor",
                          label: "Assessor",
                        },
                      ]}
                      placeholder="Select Account Type"
                      disabled={loading}
                    />
                  </div>

                  {/* Conditional Profile Fields - Customer */}
                  {formData.role === "customer" && (
                    <>
                      <div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4"
                          placeholder="Phone Number (Optional)"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4"
                          placeholder="Street Address (Optional)"
                          disabled={loading}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                            placeholder="City (Optional)"
                            disabled={loading}
                          />
                        </div>

                        <div className="relative">
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
                              {
                                value: "KwaZulu-Natal",
                                label: "KwaZulu-Natal",
                              },
                              { value: "Limpopo", label: "Limpopo" },
                              { value: "Mpumalanga", label: "Mpumalanga" },
                              {
                                value: "Northern Cape",
                                label: "Northern Cape",
                              },
                              { value: "North West", label: "North West" },
                              { value: "Western Cape", label: "Western Cape" },
                            ]}
                            placeholder="Province (Optional)"
                            disabled={loading}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                            placeholder="Postal Code (Optional)"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="mt-4 relative">
                        <CustomSelect
                          value={formData.country}
                          onChange={(value) =>
                            handleInputChange({
                              target: { name: "country", value },
                            })
                          }
                          options={[
                            { value: "South Africa", label: "South Africa" },
                            { value: "Australia", label: "Australia" },
                            { value: "New Zealand", label: "New Zealand" },
                            { value: "United States", label: "United States" },
                            { value: "Canada", label: "Canada" },
                            {
                              value: "United Kingdom",
                              label: "United Kingdom",
                            },
                            { value: "Other", label: "Other" },
                          ]}
                          placeholder="Country"
                          disabled={loading}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {/* Conditional Assessor Fields */}
                  {formData.role === "assessor" && (
                    <>
                      <div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4"
                          placeholder="Phone Number"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4"
                          placeholder="Street Address"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                            placeholder="City"
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="relative">
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
                              {
                                value: "KwaZulu-Natal",
                                label: "KwaZulu-Natal",
                              },
                              { value: "Limpopo", label: "Limpopo" },
                              { value: "Mpumalanga", label: "Mpumalanga" },
                              {
                                value: "Northern Cape",
                                label: "Northern Cape",
                              },
                              { value: "North West", label: "North West" },
                              { value: "Western Cape", label: "Western Cape" },
                            ]}
                            placeholder="Province"
                            required
                            disabled={loading}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200"
                            placeholder="Postal Code"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="mt-4 relative">
                        <CustomSelect
                          value={formData.country}
                          onChange={(value) =>
                            handleInputChange({
                              target: { name: "country", value },
                            })
                          }
                          options={[
                            { value: "South Africa", label: "South Africa" },
                            { value: "Australia", label: "Australia" },
                            { value: "New Zealand", label: "New Zealand" },
                            { value: "United States", label: "United States" },
                            { value: "Canada", label: "Canada" },
                            {
                              value: "United Kingdom",
                              label: "United Kingdom",
                            },
                            { value: "Other", label: "Other" },
                          ]}
                          placeholder="Country"
                          disabled={loading}
                          className="w-full"
                        />
                      </div>

                      <div className="relative">
                        <CustomSelect
                          value={formData.location}
                          onChange={(value) =>
                            handleInputChange({
                              target: { name: "location", value },
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
                          placeholder="Location"
                          disabled={loading}
                          className="w-full"
                        />
                      </div>

                      <div className="relative">
                        <CustomSelect
                          value={formData.contactMethod}
                          onChange={(value) =>
                            handleInputChange({
                              target: { name: "contactMethod", value },
                            })
                          }
                          options={[
                            { value: "email", label: "Email" },
                            { value: "phone", label: "Phone" },
                            { value: "whatsapp", label: "WhatsApp" },
                          ]}
                          placeholder="Preferred Contact Method"
                          disabled={loading}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <CustomSelect
                          value={formData.experience}
                          onChange={(value) =>
                            handleInputChange({
                              target: { name: "experience", value },
                            })
                          }
                          options={[
                            {
                              value: "Less than 1 year",
                              label: "Less than 1 year",
                            },
                            { value: "1–2 years", label: "1–2 years" },
                            { value: "3–5 years", label: "3–5 years" },
                            { value: "6–10 years", label: "6–10 years" },
                            { value: "11–15 years", label: "11–15 years" },
                            { value: "16–20 years", label: "16–20 years" },
                            { value: "Over 20 years", label: "Over 20 years" },
                          ]}
                          placeholder="Years of experience"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}

                  {/* Submit button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium hover:bg-red-700"
                      style={{ marginBottom: "18px" }}
                      disabled={loading || success}
                    >
                      {loading
                        ? LOADING_TEXT.CREATING_ACCOUNT
                        : success
                        ? "Account Created!"
                        : "Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Success State - Styled
            <div className="text-center">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
                <div className="mb-6">
                  <div
                    className="mb-1"
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      height: "150px",
                      margin: "0 auto 16px auto",
                    }}
                  >
                    <Lottie
                      src="/checkmark-animation.json"
                      autoplay
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Account Created Successfully!
                  </h1>
                  {formData.role === "assessor" && (
                    <p className="text-gray-600 text-lg mt-2">
                      Your account has been sent for approval
                    </p>
                  )}
                </div>
              </div>

              {/* Login Button - Inside success state */}
              <div className="mt-8 sm:mt-12">
                <button
                  onClick={onBack}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium hover:bg-red-700"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Container 3: Back Button - Only show when not in success state */}
        {!success && (
          <div className="flex-1 flex flex-col justify-end items-center">
            <button
              onClick={onBack}
              className="w-40 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium mb-2"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignUpForm;
