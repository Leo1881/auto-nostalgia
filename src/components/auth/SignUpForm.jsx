import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import CustomSelect from "../common/CustomSelect";

function SignUpForm({ onBack, onAuthenticated }) {
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");

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
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      onAuthenticated();
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col p-8 font-quicksand">
      <div className="w-full max-w-md mx-auto px-6 flex-1 flex flex-col justify-between">
        {/* Container 1: Logo */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/an_plain.png"
              alt="Auto Nostalgia"
              className="mx-auto max-w-[200px] md:max-w-[250px] lg:max-w-[300px]"
            />
          </div>
        </div>

        {/* Container 2: Text and Input Fields */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-white">Start your nostalgia journey</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  style={{
                    marginTop: "16px",
                    color: "#333333ff",
                  }}
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  style={{
                    color: "#333333ff",
                  }}
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Create a password"
                  required
                  disabled={loading}
                  style={{
                    color: "#333333ff",
                  }}
                />
              </div>

              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                  style={{
                    color: "#333333ff",
                  }}
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
                      label: "Assessor (Requires Approval)",
                    },
                  ]}
                  placeholder="Select Account Type"
                  disabled={loading}
                />
              </div>

              {/* Conditional Assessor Fields */}
              {formData.role === "assessor" && (
                <>
                  <div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Phone Number"
                      required
                      disabled={loading}
                      style={{ marginTop: "16px" }}
                    />
                  </div>

                  <div>
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
                      placeholder="Location / Region of Operation"
                      disabled={loading}
                    />
                  </div>

                  <div>
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

              {/* Submit button inside form */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="auth-button auth-button-primary mb-4"
                  style={{ marginBottom: "18px" }}
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Container 3: Back Button */}
        <div className="flex-1 flex flex-col justify-end items-center">
          <button
            onClick={onBack}
            className="auth-button auth-button-secondary"
            style={{ marginBottom: "32px" }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
