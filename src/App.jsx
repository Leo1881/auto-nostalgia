import LoadingScreen from "./components/layout/LoadingScreen";
import AuthChoicePage from "./components/auth/AuthChoicePage";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import MainApp from "./components/layout/MainApp";

import { useAppState } from "./hooks/useAppState";
import { APP_STATES } from "./constants/appStates.jsx";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const {
    appState,
    handleAuthenticated,
    handleBackToChoice,
    goToLogin,
    goToSignUp,
  } = useAppState();

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

  return <MainApp />;
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;
