function AuthChoicePage({ onLogin, onSignUp }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center p-8 font-quicksand">
      {/* Logo and Title - Centered */}
      <div className="w-full max-w-md mx-auto px-6 text-center mb-12">
        <div className="mb-6">
          <img
            src="/an_plain.png"
            alt="Auto Nostalgia"
            className="mx-auto max-w-[350px] md:max-w-[428px] lg:max-w-[506px]"
          />
        </div>

        <p
          className="text-gray-600 dark:text-gray-300 font-bold mt-4"
          style={{ fontSize: "18px" }}
        >
          Valuing the Classics, One Detail at a Time.
        </p>
      </div>

      {/* Choice Buttons */}
      <div className="w-full max-w-md mx-auto px-6">
        <div className="flex flex-col items-center">
          <button
            onClick={onLogin}
            className="auth-button auth-button-primary mb-4"
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
