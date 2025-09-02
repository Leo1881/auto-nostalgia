import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { LOADING_TEXT, BUTTON_STATES } from "../../constants/loadingStates";
import Lottie from "@lottielab/lottie-player/react";

function ForgotPasswordForm({ onBack, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check for error parameters in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get("error_code");
    const errorDescription = hashParams.get("error_description");

    if (errorCode === "otp_expired") {
      setError(
        "The password reset link has expired. Please request a new one."
      );
      // Clear the URL hash to remove the error
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Requesting password reset for:", email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        console.error("❌ Password reset error:", error);
        setError(error.message || "Failed to send reset email");
        return;
      }

      console.log("✅ Password reset email sent successfully");
      setSuccess(true);

      if (onSuccess) {
        onSuccess(email);
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col px-4 pt-6 pb-6 sm:pb-8 font-quicksand">
        <div className="w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col justify-between">
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

          {/* Container 2: Success Message */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div
                className="mb-6"
                style={{
                  width: "300px",
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
              <h1 className="text-xl font-bold text-[#333333ff] mb-2">
                Check Your Email
              </h1>
              <p className="text-sm text-[#333333ff] mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-[#333333ff] mb-2">
                Next steps:
              </p>
              <ul className="text-sm text-[#333333ff] space-y-1">
                <li>• Check your email inbox</li>
                <li>• Click the reset link in the email</li>
                <li>• Create a new password</li>
                <li>• Sign in with your new password</li>
              </ul>
            </div>
          </div>

          {/* Container 3: Back Button */}
          <div className="flex-1 flex flex-col justify-end items-center">
            <button
              onClick={onBack}
              className="w-40 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 pt-6 pb-6 sm:pb-8 font-quicksand">
      <div className="w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col justify-between">
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
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold text-[#333333ff] mb-2">
              Forgot Password
            </h1>
            <p className="text-sm text-[#333333ff]">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>

          <div className="p-4">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col w-full max-w-[800px] mx-auto"
            >
              <div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-200 mb-4 ${
                    error
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-red-600 focus:ring-red-500"
                  }`}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  style={{
                    marginTop: "16px",
                  }}
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-40 px-6 py-2 bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? LOADING_TEXT.PROCESSING : "Reset Link"}
                </button>
              </div>
            </form>
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
                bottom: "28%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Container 3: Back Button */}
        <div className="flex-1 flex flex-col justify-end items-center">
          <button
            onClick={onBack}
            className="w-40 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium mb-2"
          >
            Back
          </button>

          <div className="text-center" style={{ marginBottom: "64px" }}>
            <button
              onClick={onBack}
              className="text-xs text-[#333333ff] hover:text-red-600 transition-colors duration-200"
              style={{
                background: "none",
                border: "none",
                padding: "0",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
