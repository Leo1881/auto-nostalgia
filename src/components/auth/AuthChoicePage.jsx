function AuthChoicePage({ onLogin, onSignUp }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8 font-quicksand">
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

export default AuthChoicePage;
