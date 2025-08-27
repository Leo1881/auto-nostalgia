import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import AssessorRequestCard from "./AssessorRequestCard";
import { LOADING_TEXT, LOADING_SPINNER_CLASSES } from "../../constants/loadingStates";

function AdminPanel() {
  const { user, profile, signOut } = useAuth();
  const [assessorRequests, setAssessorRequests] = useState([]);
  const [activeAssessors, setActiveAssessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assessorsDropdownOpen, setAssessorsDropdownOpen] = useState(false);

  // Debug logging
  console.log("AdminPanel render:", { user, profile, loading, error });

  useEffect(() => {
    console.log("AdminPanel useEffect triggered");
    fetchAssessorRequests();
    fetchActiveAssessors();
  }, []);

  const fetchAssessorRequests = async () => {
    try {
      console.log("Fetching assessor requests...");
      setLoading(true);

      // First fetch all assessor requests
      const { data: requests, error: requestsError } = await supabase
        .from("assessor_requests")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Assessor requests result:", { requests, requestsError });

      if (requestsError) {
        setError("Failed to fetch assessor requests");
        console.error("Error fetching assessor requests:", requestsError);
        return;
      }

      // Then fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at");

      console.log("Profiles result:", { profiles, profilesError });

      if (profilesError) {
        setError("Failed to fetch profiles");
        console.error("Error fetching profiles:", profilesError);
        return;
      }

      // Combine the data manually
      const combinedData = requests.map((request) => ({
        ...request,
        profiles: profiles.find((profile) => profile.id === request.user_id),
      }));

      console.log("Combined data:", combinedData);
      setAssessorRequests(combinedData || []);
    } catch (err) {
      setError("Failed to fetch assessor requests");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      // Update the assessor request status
      const { error: requestError } = await supabase
        .from("assessor_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (requestError) {
        setError("Failed to update request status");
        return;
      }

      // If approved, update the user's role to 'assessor'
      if (newStatus === "approved") {
        const request = assessorRequests.find((req) => req.id === requestId);
        if (request) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ role: "assessor" })
            .eq("id", request.user_id);

          if (profileError) {
            setError("Failed to update user role");
            return;
          }
        }
      }

      // Refresh the list
      await fetchAssessorRequests();
      setError("");
    } catch (err) {
      setError("Failed to update request");
      console.error("Error:", err);
    }
  };

  const fetchActiveAssessors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "assessor")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching active assessors:", error);
        return;
      }

      setActiveAssessors(data || []);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const getStats = () => {
    const pending = assessorRequests.filter(
      (req) => req.status === "pending"
    ).length;
    const approved = assessorRequests.filter(
      (req) => req.status === "approved"
    ).length;
    const rejected = assessorRequests.filter(
      (req) => req.status === "rejected"
    ).length;
    const total = assessorRequests.length;

    return { pending, approved, rejected, total };
  };

  const stats = getStats();

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-quicksand">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-quicksand">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b-4 border-primary-red">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Admin Panel
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={signOut}
                className="px-12 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold border-0"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 w-full">
        <nav className="px-8 sm:px-12 lg:px-16">
          <div className="flex justify-center space-x-16">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-6 px-8 font-medium text-sm transition-colors duration-200 ${
                activeTab === "dashboard"
                  ? "text-primary-red"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Dashboard
            </button>

            {/* Assessors Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAssessorsDropdownOpen(!assessorsDropdownOpen)}
                className={`py-6 px-8 font-medium text-sm transition-colors duration-200 flex items-center space-x-1 ${
                  activeTab === "pending" || activeTab === "assessors"
                    ? "text-primary-red"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>Assessors</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    assessorsDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {assessorsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 min-w-48 z-10">
                  <button
                    onClick={() => {
                      setActiveTab("pending");
                      setAssessorsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      activeTab === "pending"
                        ? "text-primary-red bg-red-50 dark:bg-red-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    Pending Requests ({stats.pending})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("assessors");
                      setAssessorsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      activeTab === "assessors"
                        ? "text-primary-red bg-red-50 dark:bg-red-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    Active Assessors ({activeAssessors.length})
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab("clients")}
              className={`py-6 px-8 font-medium text-sm transition-colors duration-200 ${
                activeTab === "clients"
                  ? "text-primary-red"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Clients
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-16 sm:px-20 lg:px-24 py-20">
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Dashboard Overview
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Total Requests
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-md">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Pending
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.pending}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-md">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Approved
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.approved}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-md">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Rejected
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.rejected}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === "pending" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Pending Requests
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Requests Requiring Action
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Review and approve or reject assessor applications
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.pending} pending review
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="text-center py-12">
                    <div className={LOADING_SPINNER_CLASSES.XLARGE}></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                      {LOADING_TEXT.LOADING_REQUESTS}
                    </p>
                  </div>
                ) : assessorRequests.filter((req) => req.status === "pending")
                    .length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No pending requests
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All assessor requests have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {assessorRequests
                      .filter((request) => request.status === "pending")
                      .map((request) => (
                        <AssessorRequestCard
                          key={request.id}
                          request={request}
                          onStatusUpdate={handleStatusUpdate}
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Assessors Tab */}
        {activeTab === "assessors" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Active Assessors
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Approved Assessors
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      View all active assessors in the system
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {activeAssessors.length} active assessors
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="text-center py-12">
                    <div className={LOADING_SPINNER_CLASSES.XLARGE}></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                      {LOADING_TEXT.LOADING_ASSESSORS}
                    </p>
                  </div>
                ) : activeAssessors.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No active assessors
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No assessors have been approved yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAssessors.map((assessor) => (
                      <div
                        key={assessor.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-sm font-bold text-white">
                              {assessor.full_name?.charAt(0) || "A"}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {assessor.full_name || "Unknown"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {assessor.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            Joined:{" "}
                            {new Date(assessor.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Clients
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Client Management
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Manage client accounts and information
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Client Management Coming Soon
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Client management features will be available here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
