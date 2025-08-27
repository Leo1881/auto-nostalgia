function AuthChoicePage({ onLogin, onSignUp }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col p-8 font-quicksand">
      {/* Logo and Title - 70% container */}
      <div
        className="h-[70%] flex items-center justify-center"
        style={{ marginTop: "64px" }}
      >
        <div className="w-full max-w-md px-6 text-center">
          <div className="mb-6">
            <img
              src="/auto-nostalgia/an_plain.png"
              alt="Auto Nostalgia"
              className="mx-auto max-w-[350px] md:max-w-[428px] lg:max-w-[506px]"
              style={{ marginTop: "32px" }}
            />
          </div>

          <p
            className="text-gray-600 dark:text-gray-300 font-bold mt-4"
            style={{ fontSize: "18px" }}
          >
            Valuing the Classics, One Detail at a Time.
          </p>
        </div>
      </div>

      {/* Choice Buttons - 30% container */}
      <div className="h-[30%] flex items-end justify-center mb-16">
        <div className="w-full max-w-md px-6">
          <div className="flex flex-col items-center">
            <button
              onClick={onLogin}
              className="auth-button auth-button-primary mb-4"
              style={{ marginBottom: "18px" }}
            >
              Login
            </button>

            <button
              onClick={onSignUp}
              className="auth-button auth-button-secondary"
              style={{ marginBottom: "32px" }}
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
