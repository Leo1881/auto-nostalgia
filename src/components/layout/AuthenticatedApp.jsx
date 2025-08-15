import { useAuth } from "../../hooks/useAuth";
import MainApp from "./MainApp";
import AdminPanel from "../admin/AdminPanel";

function AuthenticatedApp() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Route admins to admin panel
  if (profile?.role === "admin") {
    return <AdminPanel />;
  }

  // Route everyone else to main app
  return <MainApp />;
}

export default AuthenticatedApp;
