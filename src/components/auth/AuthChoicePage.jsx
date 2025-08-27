function AuthChoicePage({ onLogin, onSignUp }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col p-4 sm:p-8 font-quicksand">
      {/* Logo and Title - Flexible container */}
      <div className="flex-1 flex items-center justify-center py-4 sm:py-8">
        <div className="w-full max-w-md px-4 sm:px-6 text-center">
          <div className="mb-4 sm:mb-6">
            <img
              src="/an_plain.png"
              alt="Auto Nostalgia"
              className="mx-auto max-w-[200px] sm:max-w-[280px] md:max-w-[350px] lg:max-w-[428px]"
            />
          </div>

          <p className="text-gray-600 dark:text-gray-300 font-bold text-base sm:text-lg px-2">
            Valuing the Classics, One Detail at a Time.
          </p>
        </div>
      </div>

      {/* Choice Buttons - Flexible container */}
      <div
        className="flex items-center justify-center"
        style={{ paddingBottom: window.innerWidth < 640 ? "48px" : "64px" }}
      >
        <div className="w-full max-w-md px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={onLogin}
              className="auth-button auth-button-primary w-full sm:w-auto"
            >
              Login
            </button>

            <button
              onClick={onSignUp}
              className="auth-button auth-button-secondary w-full sm:w-auto"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthChoicePage;
