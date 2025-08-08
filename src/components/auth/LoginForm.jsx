import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

function LoginForm({ onBack, onAuthenticated }) {
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
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white">Sign in to your account</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

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
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  style={{
                    color: "#333333ff",
                  }}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Container 3: Buttons and Link */}
        <div className="flex-1 flex flex-col justify-end items-center">
          <button
            type="submit"
            className="auth-button auth-button-primary mb-4"
            style={{ marginBottom: "18px" }}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <button
            onClick={onBack}
            className="auth-button auth-button-secondary"
            style={{ marginBottom: "32px" }}
          >
            Back
          </button>

          <div className="text-center" style={{ marginBottom: "16px" }}>
            <a
              href="#"
              className="text-sm text-white hover:text-gray-200"
              style={{ color: "#333333ff" }}
            >
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
