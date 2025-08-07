import { useState, useEffect } from "react";
import { APP_STATES } from "../constants/appStates.jsx";

export function useAppState() {
  const [appState, setAppState] = useState(APP_STATES.LOADING);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setAppState(APP_STATES.AUTH_CHOICE);
    }, 3000); // Show loading screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleAuthenticated = () => {
    setAppState(APP_STATES.MAIN);
  };

  const handleBackToChoice = () => {
    setAppState(APP_STATES.AUTH_CHOICE);
  };

  const goToLogin = () => {
    setAppState(APP_STATES.LOGIN);
  };

  const goToSignUp = () => {
    setAppState(APP_STATES.SIGNUP);
  };

  return {
    appState,
    handleAuthenticated,
    handleBackToChoice,
    goToLogin,
    goToSignUp,
  };
}
