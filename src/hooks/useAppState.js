import { useState, useEffect } from "react";
import { APP_STATES } from "../constants/appStates.jsx";

export function useAppState() {
  const [appState, setAppState] = useState(APP_STATES.LOADING);

  // Debug state changes
  useEffect(() => {
    console.log("🔄 App state changed to:", appState);
  }, [appState]);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      // Only set to AUTH_CHOICE if we're still in LOADING state
      // Don't override RESET_PASSWORD or FORGOT_PASSWORD states
      setAppState((currentState) => {
        console.log("⏰ Timer trying to change state from:", currentState);
        if (currentState === APP_STATES.LOADING) {
          console.log("✅ Setting state to AUTH_CHOICE");
          return APP_STATES.AUTH_CHOICE;
        }
        console.log("❌ Not changing state, keeping:", currentState);
        return currentState;
      });
    }, 3000); // Show loading screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleAuthenticated = () => {
    setAppState(APP_STATES.MAIN);
  };

  const goToAdmin = () => {
    setAppState(APP_STATES.ADMIN);
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

  const goToForgotPassword = () => {
    setAppState(APP_STATES.FORGOT_PASSWORD);
  };

  const goToResetPassword = () => {
    console.log("🔄 Setting app state to RESET_PASSWORD");
    setAppState(APP_STATES.RESET_PASSWORD);
  };

  return {
    appState,
    handleAuthenticated,
    handleBackToChoice,
    goToLogin,
    goToSignUp,
    goToForgotPassword,
    goToResetPassword,
    goToAdmin,
  };
}
