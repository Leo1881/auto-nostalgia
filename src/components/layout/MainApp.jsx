import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import FeatureCard from "../features/FeatureCard";
import { FEATURES } from "../../constants/appStates.jsx";

function MainApp() {
  const [count, setCount] = useState(0);
  const { signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-primary-grey dark:to-primary-grey-dark font-quicksand">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm"
            >
              {loading ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
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
            {FEATURES.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
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

export default MainApp;
