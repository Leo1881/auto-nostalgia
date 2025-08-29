function AuthChoicePage({ onLogin, onSignUp }) {
  return (
    <div className="min-h-screen bg-white flex flex-col p-4 sm:p-8 font-quicksand">
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

          <p className="text-[#333333ff] font-bold text-sm px-2">
            Valuing the Classics, One Detail at a Time.
          </p>
        </div>
      </div>

      {/* Choice Buttons - Flexible container */}
      <div className="flex items-center justify-center pb-12 sm:pb-16">
        <div className="w-full max-w-md px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={onLogin}
              className="w-40 px-6 py-2 bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium hover:bg-red-700 mb-4"
            >
              Login
            </button>

            <button
              onClick={onSignUp}
              className="w-40 px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
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
