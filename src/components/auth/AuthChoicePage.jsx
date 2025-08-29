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
              className="w-40 h-10 rounded-3xl font-quicksand font-bold text-xs border-none outline-none cursor-pointer transition-all duration-300 shadow-md bg-red-600 text-white mb-4 hover:scale-105 hover:bg-red-700 hover:shadow-lg active:scale-95 active:bg-red-800"
            >
              Login
            </button>

            <button
              onClick={onSignUp}
              className="w-40 h-10 rounded-3xl font-quicksand font-bold text-xs outline-none cursor-pointer transition-all duration-300 shadow-md bg-white text-red-600 border-2 border-red-600 hover:scale-105 hover:bg-red-600 hover:text-white hover:shadow-lg active:scale-95 active:bg-red-700 active:text-white"
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
