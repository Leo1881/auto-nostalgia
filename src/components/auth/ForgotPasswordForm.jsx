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
      <div className="text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div
              className="mb-1"
              style={{
                width: "400px",
                height: "200px",
                margin: "128px auto 16px auto",
              }}
            >
              <Lottie
                src="/checkmark-animation.json"
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Check Your Email
            </h2>
          </div>

          <p
            className="text-gray-600 dark:text-gray-400"
            style={{ marginBottom: "32px" }}
          >
            We've sent a password reset link to <strong>{email}</strong>
          </p>

          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Next steps:</strong>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>• Check your email inbox</li>
              <li>• Click the reset link in the email</li>
              <li>• Create a new password</li>
              <li>• Sign in with your new password</li>
            </ul>
          </div>

          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            style={{
              background: "none",
              border: "none",
              padding: "0",
              cursor: "pointer",
              textDecoration: "underline",
              marginTop: "16px",
            }}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Forgot Password
            </h2>
            <p
              className="text-gray-600 dark:text-gray-400"
              style={{
                marginBottom: "24px",
                paddingLeft: "24px",
                paddingRight: "24px",
              }}
            >
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>

          {error && (
            <div className="mb-8 text-center">
              <p
                className="text-red-600 text-sm"
                style={{
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email address"
                required
                disabled={loading}
                style={{ color: "#333333ff" }}
              />
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
                {loading ? LOADING_TEXT.PROCESSING : "Send Reset Link"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              style={{
                background: "none",
                border: "none",
                padding: "0",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
