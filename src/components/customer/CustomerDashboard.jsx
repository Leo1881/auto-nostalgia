import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { LOADING_TEXT } from "../../constants/loadingStates";
import CustomerSidebar from "./CustomerSidebar";
import DashboardHome from "./DashboardHome";
import RequestAssessment from "./RequestAssessment";
import MyVehicles from "./MyVehicles";
import AssessmentHistory from "./AssessmentHistory";
import ProfileSettings from "./ProfileSettings";

function CustomerDashboard() {
  const { signOut, loading, profile } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome onSectionChange={setActiveSection} />;
      case "request-assessment":
        return <RequestAssessment />;
      case "my-vehicles":
        return <MyVehicles />;
      case "assessment-history":
        return <AssessmentHistory />;
      case "profile-settings":
        return <ProfileSettings />;
      default:
        return <DashboardHome onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-quicksand customer-dashboard">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-[16px] font-medium text-white">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Customer"}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-[#333333ff]">
                Welcome, {profile?.full_name?.split(" ")[0] || "Customer"}
              </span>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-xs"
              >
                {loading ? LOADING_TEXT.SIGNING_OUT : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <CustomerSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="w-full">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

export default CustomerDashboard;
