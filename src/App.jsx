import { useState, useEffect } from "react";

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary-grey dark:to-primary-grey-dark flex items-center justify-center font-poppins">
      <div className="text-center">
        {/* Logo Placeholder */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-red to-primary-red-dark rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* App Name */}
        <h1 className="text-4xl md:text-6xl font-bold text-primary-grey dark:text-white mb-8 animate-fade-in">
          Auto Nostalgia
        </h1>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-red rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-primary-red rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-primary-red rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Auth Choice Page Component
function AuthChoicePage({ onLogin, onSignUp }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8 font-poppins">
      <div className="w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-700 to-red-800 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Auto Nostalgia
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Valuing the Classics, One Detail at a Time.
          </p>
        </div>

        {/* Choice Buttons */}
        <div
          className="flex flex-col items-center"
          style={{ marginTop: "64px" }}
        >
          <button
            onClick={onLogin}
            className="auth-button auth-button-primary"
            style={{ marginBottom: "16px" }}
          >
            Login
          </button>

          <button
            onClick={onSignUp}
            className="auth-button auth-button-secondary"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

// Login Form Component
function LoginForm({ onBack, onAuthenticated }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    console.log("Login attempt:", formData);
    onAuthenticated();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8 font-poppins">
      <div className="w-full max-w-md px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-red-700 dark:hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-700 to-red-800 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-red-700 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-red-700 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="form-button form-button-primary">
              Sign In
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-red-700 dark:text-blue-400 hover:text-red-800 dark:hover:text-blue-300"
            >
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sign Up Form Component
function SignUpForm({ onBack, onAuthenticated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual signup logic
    console.log("Signup attempt:", formData);
    onAuthenticated();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8 font-poppins">
      <div className="w-full max-w-md px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-red-700 dark:hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-700 to-red-800 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Start your nostalgia journey
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-red-700 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-red-700 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-red-700 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-red-700 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button type="submit" className="form-button form-button-primary">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function MainApp() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary-grey dark:to-primary-grey-dark font-poppins">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-grey dark:text-white mb-4">
            Auto Nostalgia
          </h1>
          <p className="text-lg text-primary-grey dark:text-gray-300 max-w-2xl mx-auto">
            Your journey through time and memories
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-primary-grey rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-grey dark:text-white mb-2">
                Create Memories
              </h3>
              <p className="text-primary-grey dark:text-gray-300">
                Build and organize your personal nostalgia collection
              </p>
            </div>

            <div className="bg-white dark:bg-primary-grey rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-grey dark:text-white mb-2">
                Share Stories
              </h3>
              <p className="text-primary-grey dark:text-gray-300">
                Connect with others through shared experiences
              </p>
            </div>

            <div className="bg-white dark:bg-primary-grey rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-grey dark:text-white mb-2">
                Track Progress
              </h3>
              <p className="text-primary-grey dark:text-gray-300">
                Monitor your nostalgia journey over time
              </p>
            </div>
          </div>

          {/* Interactive Section */}
          <div className="bg-white dark:bg-primary-grey rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-primary-grey dark:text-white mb-6">
              Start Your Journey
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setCount((count) => count + 1)}
                className="px-8 py-3 bg-primary-red hover:bg-primary-red-dark text-white font-semibold rounded-full transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Count: {count}
              </button>
              <button className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-primary-grey-dark dark:hover:bg-primary-grey text-primary-grey dark:text-white font-semibold rounded-full transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-primary-grey dark:text-gray-400">
          <p>Built with React + Vite + Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

// Main App Component with Loading and Auth States
function App() {
  const [appState, setAppState] = useState("loading"); // "loading" | "auth-choice" | "login" | "signup" | "main"

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setAppState("auth-choice");
    }, 3000); // Show loading screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleAuthenticated = () => {
    setAppState("main");
  };

  const handleBackToChoice = () => {
    setAppState("auth-choice");
  };

  if (appState === "loading") {
    return <LoadingScreen />;
  }

  if (appState === "auth-choice") {
    return (
      <AuthChoicePage
        onLogin={() => setAppState("login")}
        onSignUp={() => setAppState("signup")}
      />
    );
  }

  if (appState === "login") {
    return (
      <LoginForm
        onBack={handleBackToChoice}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  if (appState === "signup") {
    return (
      <SignUpForm
        onBack={handleBackToChoice}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return <MainApp />;
}

export default App;
