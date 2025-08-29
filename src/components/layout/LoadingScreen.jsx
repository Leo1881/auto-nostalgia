function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-quicksand">
      <div className="text-center flex flex-col items-center justify-center -mt-12">
        {/* App Logo */}
        <div className="animate-fade-in">
          <img
            src="/an_plain.png"
            alt="Auto Nostalgia"
            className="mx-auto w-24 h-auto block"
          />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
