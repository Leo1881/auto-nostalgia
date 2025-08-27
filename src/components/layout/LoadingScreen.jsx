function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary-grey dark:to-primary-grey-dark flex items-center justify-center font-quicksand">
      <div className="text-center">
        {/* App Logo */}
        <div className="mb-8 animate-fade-in">
          <img
            src="/auto-nostalgia/docs/an_plain.png"
            alt="Auto Nostalgia"
            className="mx-auto max-w-[144px] md:max-w-[180px] lg:max-w-[216px]"
          />
        </div>

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

export default LoadingScreen;
