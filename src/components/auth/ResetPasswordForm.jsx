import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { LOADING_TEXT, BUTTON_STATES } from "../../constants/loadingStates";

function ResetPasswordForm({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Password validation function
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

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    if (error) setError(null);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (!validatePassword(password)) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Updating password...");

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("❌ Password update error:", error);
        setError(error.message || "Failed to update password");
        return;
      }

      console.log("✅ Password updated successfully");

      // Sign out the user to force re-authentication
      console.log("🔐 Signing out user to force re-authentication");
      await supabase.auth.signOut();

      setSuccess(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Password Updated!
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your password has been successfully updated. For security
                reasons, you have been signed out. Please sign in with your new
                password.
              </p>

              <button
                onClick={() => (window.location.href = "/")}
                className={BUTTON_STATES.PRIMARY.NORMAL}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2
              className="text-3xl font-bold text-gray-900 dark:text-white"
              style={{ marginBottom: "24px" }}
            >
              Reset Password
            </h2>
          </div>

          {error && (
            <div
              className="text-red-600 text-sm font-bold mb-4"
              style={{
                color: "red",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center",
                fontWeight: "bold",
                position: "absolute",
                bottom: "15%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                paddingLeft: "8px",
                paddingRight: "8px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Enter your new password"
                required
                disabled={loading}
                style={{ color: "#333333ff" }}
              />
            </div>

            <div className="text-center">
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="form-input"
                placeholder="Confirm your new password"
                required
                disabled={loading}
                style={{ color: "#333333ff" }}
              />
            </div>

            {/* Password Requirements */}
            <div
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
              style={{ marginBottom: "24px" }}
            >
              <div className="space-y-2" style={{ marginLeft: "40px" }}>
                <div
                  className={`flex items-center text-sm ${
                    passwordRequirements.length
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      passwordRequirements.length
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {passwordRequirements.length ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  At least 8 characters
                </div>
                <div
                  className={`flex items-center text-sm ${
                    passwordRequirements.uppercase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      passwordRequirements.uppercase
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {passwordRequirements.uppercase ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  One uppercase letter
                </div>
                <div
                  className={`flex items-center text-sm ${
                    passwordRequirements.lowercase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      passwordRequirements.lowercase
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {passwordRequirements.lowercase ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  One lowercase letter
                </div>
                <div
                  className={`flex items-center text-sm ${
                    passwordRequirements.number
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      passwordRequirements.number
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {passwordRequirements.number ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  One number
                </div>
                <div
                  className={`flex items-center text-sm ${
                    passwordRequirements.special
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      passwordRequirements.special
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {passwordRequirements.special ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  One special character (!@#$%^&*)
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className={
                  loading
                    ? BUTTON_STATES.PRIMARY.LOADING
                    : BUTTON_STATES.PRIMARY.NORMAL
                }
                disabled={loading}
              >
                {loading ? LOADING_TEXT.PROCESSING : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordForm;
