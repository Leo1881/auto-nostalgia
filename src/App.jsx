import LoadingScreen from "./components/layout/LoadingScreen";
import AuthChoicePage from "./components/auth/AuthChoicePage";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import ResetPasswordForm from "./components/auth/ResetPasswordForm";
import AuthenticatedApp from "./components/layout/AuthenticatedApp";

import { useAppState } from "./hooks/useAppState";
import { APP_STATES } from "./constants/appStates.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { useEffect } from "react";

function App() {
  const {
    appState,
    handleAuthenticated,
    handleBackToChoice,
    goToLogin,
    goToSignUp,
    goToForgotPassword,
    goToResetPassword,
  } = useAppState();

  // Check for reset password URL parameters and errors
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const accessToken =
      urlParams.get("access_token") || hashParams.get("access_token");
    const refreshToken =
      urlParams.get("refresh_token") || hashParams.get("refresh_token");

    // Check for error parameters
    const error = hashParams.get("error");
    const errorCode = hashParams.get("error_code");
    const errorDescription = hashParams.get("error_description");

    console.log("🔍 Checking URL parameters:", {
      accessToken: accessToken ? "Present" : "Missing",
      refreshToken: refreshToken ? "Present" : "Missing",
      error: error || "None",
      errorCode: errorCode || "None",
      errorDescription: errorDescription || "None",
      currentAppState: appState,
      search: window.location.search,
      hash: window.location.hash,
    });

    // Handle error cases
    if (error) {
      console.log("❌ Reset password error detected:", {
        error,
        errorCode,
        errorDescription,
      });
      if (errorCode === "otp_expired") {
        // Link expired - redirect to forgot password with error
        goToForgotPassword();
        return;
      }
    }

    if (accessToken && refreshToken) {
      console.log("✅ Reset password tokens found, navigating to reset form");
      goToResetPassword();
    }
  }, [goToResetPassword, goToForgotPassword, appState]);

  if (appState === APP_STATES.LOADING) {
    return <LoadingScreen />;
  }

  if (appState === APP_STATES.AUTH_CHOICE) {
    return <AuthChoicePage onLogin={goToLogin} onSignUp={goToSignUp} />;
  }

  if (appState === APP_STATES.LOGIN) {
    return (
      <LoginForm
        onBack={handleBackToChoice}
        onAuthenticated={handleAuthenticated}
        onForgotPassword={goToForgotPassword}
      />
    );
  }

  if (appState === APP_STATES.SIGNUP) {
    return (
      <SignUpForm
        onBack={handleBackToChoice}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  if (appState === APP_STATES.FORGOT_PASSWORD) {
    return (
      <ForgotPasswordForm
        onBack={goToLogin}
        onSuccess={() => console.log("Password reset email sent")}
      />
    );
  }

  if (appState === APP_STATES.RESET_PASSWORD) {
    console.log("🎯 Rendering ResetPasswordForm");
    return (
      <ResetPasswordForm
        onSuccess={() => {
          console.log("✅ Password reset successful, redirecting to login");
          // Redirect to login instead of authenticating
          goToLogin();
        }}
      />
    );
  }

  console.log("🔍 Current app state:", appState);

  return <AuthenticatedApp />;
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;
