import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { LOADING_TEXT } from "../../constants/loadingStates";
import AssessorSidebar from "./AssessorSidebar";
import AssessorHome from "./AssessorHome";
import AssessmentRequests from "./AssessmentRequests";
import MySchedule from "./MySchedule";
import AssessmentHistory from "./AssessmentHistory";
import ProfileSettings from "./ProfileSettings";
import ChatButton from "../chat/ChatButton";

function AssessorDashboard() {
  const { signOut, loading, profile } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AssessorHome />;
      case "assessment-requests":
        return <AssessmentRequests />;
      case "my-schedule":
        return <MySchedule />;
      case "assessment-history":
        return <AssessmentHistory />;
      case "profile-settings":
        return <ProfileSettings />;
      default:
        return <AssessorHome />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-quicksand assessor-dashboard">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-[16px] font-medium text-white">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Assessor"}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-xs"
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
        <AssessorSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="w-full">{renderContent()}</div>
        </main>
      </div>

      {/* Chat Button */}
      <ChatButton />
    </div>
  );
}

export default AssessorDashboard;
