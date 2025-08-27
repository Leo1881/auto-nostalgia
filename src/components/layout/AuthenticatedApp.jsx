import { useAuth } from "../../hooks/useAuth";
import MainApp from "./MainApp";
import AdminPanel from "../admin/AdminPanel";
import { LOADING_TEXT, LOADING_SPINNER_CLASSES } from "../../constants/loadingStates";

function AuthenticatedApp() {
  const { profile, loading } = useAuth();

  console.log("AuthenticatedApp render:", { profile, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
        <div className="text-center">
          <div className={LOADING_SPINNER_CLASSES.LARGE}></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{LOADING_TEXT.LOADING}</p>
        </div>
      </div>
    );
  }

  console.log("Profile role:", profile?.role);

  // Route admins to admin panel
  if (profile?.role === "admin") {
    console.log("Routing to AdminPanel");
    return <AdminPanel />;
  }

  // Route everyone else to main app
  console.log("Routing to MainApp");
  return <MainApp />;
}

export default AuthenticatedApp;
