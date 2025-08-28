import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { LOADING_TEXT, BUTTON_STATES } from "../../constants/loadingStates";

function LoginForm({ onBack, onAuthenticated, onForgotPassword }) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn({
      email: formData.email,
      password: formData.password,
    });

    if (result.error) {
      // Provide user-friendly error messages
      let errorMessage = result.error.message;

      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage =
          "Please check your email and confirm your account before signing in.";
      } else if (errorMessage.includes("Too many requests")) {
        errorMessage =
          "Too many login attempts. Please wait a moment before trying again.";
      } else if (errorMessage.includes("User not found")) {
        errorMessage =
          "No account found with this email address. Please check your email or sign up.";
      }

      setError(errorMessage);
      setLoading(false);
    } else {
      onAuthenticated();
    }
  };

  const handleInputChange = (e) => {
    // Clear error when user starts typing
    if (error) {
      setError("");
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col px-8 pt-8 pb-6 sm:pb-8 font-quicksand">
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
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white">Sign in to your account</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${
                    error
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Enter your email"
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
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${
                    error
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  style={{
                    color: "#333333ff",
                  }}
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className={`${
                    loading
                      ? BUTTON_STATES.PRIMARY.LOADING
                      : BUTTON_STATES.PRIMARY.NORMAL
                  } w-full sm:w-auto`}
                  style={{ marginBottom: "0px" }}
                  disabled={loading}
                >
                  {loading ? LOADING_TEXT.SIGNING_IN : "Sign In"}
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

        {/* Container 3: Buttons and Link */}
        <div className="flex-1 flex flex-col justify-end items-center">
          <button
            onClick={onBack}
            className="auth-button auth-button-secondary w-full sm:w-auto"
            style={{ marginBottom: "8px" }}
          >
            Back
          </button>

          <div className="text-center" style={{ marginBottom: "64px" }}>
            <button
              onClick={onForgotPassword}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              style={{
                background: "none",
                border: "none",
                padding: "0",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
