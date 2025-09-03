import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";
import MainApp from "./MainApp";
import AdminPanel from "../admin/AdminPanel";
import CustomerDashboard from "../customer/CustomerDashboard";
import AssessorDashboard from "../assessor/AssessorDashboard";
import { VehicleProvider } from "../../contexts/VehicleContext";
import {
  LOADING_TEXT,
  LOADING_SPINNER_CLASSES,
} from "../../constants/loadingStates";

function AuthenticatedApp() {
  const { profile, loading } = useAuth();

  console.log("AuthenticatedApp render:", { profile, loading });

  // Handle logout routing - if no profile after loading, redirect to auth choice
  useEffect(() => {
    if (!loading && !profile) {
      console.log(
        "🔐 No profile found, user logged out - redirecting to auth choice"
      );
      // Force a page reload to reset the app state to AUTH_CHOICE
      window.location.reload();
    }
  }, [profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
        <div className="text-center">
          <div className={LOADING_SPINNER_CLASSES.LARGE}></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {LOADING_TEXT.LOADING}
          </p>
        </div>
      </div>
    );
  }

  // If no profile after loading, show a brief message before redirect
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
        <div className="text-center">
          <div className={LOADING_SPINNER_CLASSES.LARGE}></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Redirecting to login...
          </p>
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

  // Route customers to customer dashboard
  if (profile?.role === "customer") {
    console.log("Routing to CustomerDashboard");
    return <CustomerDashboard />;
  }

  // Route assessors to assessor dashboard
  if (profile?.role === "assessor") {
    console.log("Routing to AssessorDashboard");
    return <AssessorDashboard />;
  }

  // Default fallback to main app
  console.log("Routing to MainApp (default)");
  return <MainApp />;
}

export default AuthenticatedApp;
