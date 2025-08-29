function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
      <div className="text-center flex flex-col items-center justify-center -mt-12">
        {/* App Logo */}
        <div className="mb-8 animate-bounce">
          <img
            src="/an_plain.png"
            alt="Auto Nostalgia"
            className="mx-auto w-16 h-auto block"
          />
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-3">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
