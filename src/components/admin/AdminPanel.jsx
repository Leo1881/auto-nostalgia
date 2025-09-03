import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import AssessorRequestCard from "./AssessorRequestCard";
import UserManagement from "./UserManagement";
import {
  LOADING_TEXT,
  LOADING_SPINNER_CLASSES,
} from "../../constants/loadingStates";

function AdminPanel() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };
  const [assessorRequests, setAssessorRequests] = useState([]);
  const [activeAssessors, setActiveAssessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

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
      <header className="bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-[16px] font-medium text-white">
                Welcome back, {profile?.full_name?.split(" ")[0] || "Admin"}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-[#333333ff]">
                Welcome, {profile?.full_name?.split(" ")[0] || "Admin"}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-red-600 shadow-sm lg:min-h-screen flex-shrink-0">
          <nav className="p-0 h-full">
            <ul className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-0 overflow-x-auto lg:overflow-x-visible h-full">
              <li className="flex-shrink-0 lg:flex-shrink">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center space-x-3 lg:space-x-4 px-4 py-3 h-12 transition-all duration-200 text-left whitespace-nowrap no-underline ${
                    activeTab === "dashboard"
                      ? "bg-red-700 text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                    />
                  </svg>
                  <span className="font-medium text-sm lg:text-base">
                    Dashboard
                  </span>
                </button>
              </li>
              <li className="flex-shrink-0 lg:flex-shrink">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`w-full flex items-center space-x-3 lg:space-x-4 px-4 py-3 h-12 transition-all duration-200 text-left whitespace-nowrap no-underline ${
                    activeTab === "pending"
                      ? "bg-red-700 text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <svg
                    className="w-5 h-5"
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
                  <span className="font-medium text-sm lg:text-base">
                    Pending Requests ({stats.pending})
                  </span>
                </button>
              </li>
              <li className="flex-shrink-0 lg:flex-shrink">
                <button
                  onClick={() => setActiveTab("assessors")}
                  className={`w-full flex items-center space-x-3 lg:space-x-4 px-4 py-3 h-12 transition-all duration-200 text-left whitespace-nowrap no-underline ${
                    activeTab === "assessors"
                      ? "bg-red-700 text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <svg
                    className="w-5 h-5"
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
                  <span className="font-medium text-sm lg:text-base">
                    Active Assessors ({activeAssessors.length})
                  </span>
                </button>
              </li>
              <li className="flex-shrink-0 lg:flex-shrink">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center space-x-3 lg:space-x-4 px-4 py-3 h-12 transition-all duration-200 text-left whitespace-nowrap no-underline ${
                    activeTab === "users"
                      ? "bg-red-700 text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <span className="font-medium text-sm lg:text-base">
                    Users
                  </span>
                </button>
              </li>
              <li className="flex-shrink-0 lg:flex-shrink">
                <button
                  onClick={() => setActiveTab("clients")}
                  className={`w-full flex items-center space-x-3 lg:space-x-4 px-4 py-3 h-12 transition-all duration-200 text-left whitespace-nowrap no-underline ${
                    activeTab === "clients"
                      ? "bg-red-700 text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <svg
                    className="w-5 h-5"
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
                  <span className="font-medium text-sm lg:text-base">
                    Clients
                  </span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-auto bg-white">
          <div className="w-full space-y-6">
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
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <p className="text-[#333333ff] mb-4">
                    Here's what's happening with assessor requests and system
                    management.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-red-200 rounded-lg">
                        <svg
                          className="w-4 h-4 text-red-700"
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
                      <div className="ml-3 flex items-center space-x-2">
                        <p className="text-xs font-medium text-[#333333ff] mr-2">
                          Total Requests
                        </p>
                        <p className="text-xs font-bold text-[#333333ff]">
                          {stats.total}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-red-200 rounded-lg">
                        <svg
                          className="w-4 h-4 text-red-700"
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
                      <div className="ml-3 flex items-center space-x-2">
                        <p className="text-xs font-medium text-[#333333ff] mr-2">
                          Pending
                        </p>
                        <p className="text-xs font-bold text-[#333333ff]">
                          {stats.pending}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <svg
                          className="w-4 h-4 text-green-600"
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
                      <div className="ml-3 flex items-center space-x-2">
                        <p className="text-xs font-medium text-[#333333ff] mr-2">
                          Approved
                        </p>
                        <p className="text-xs font-bold text-[#333333ff]">
                          {stats.approved}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <svg
                          className="w-4 h-4 text-gray-600"
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
                      <div className="ml-3 flex items-center space-x-2">
                        <p className="text-xs font-medium text-[#333333ff] mr-2">
                          Rejected
                        </p>
                        <p className="text-xs font-bold text-[#333333ff]">
                          {stats.rejected}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacer */}
                <div className="mb-6"></div>

                {/* Top spacer for quick actions */}
                <div className="mt-6"></div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className="bg-red-600 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-200 text-left w-full h-24 flex items-center"
                  >
                    <div className="flex items-center pl-2 sm:pl-4 w-full h-full">
                      <div className="rounded-lg text-white bg-red-600">
                        <svg
                          className="w-8 h-8"
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
                      <div className="ml-3 sm:ml-4 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                          Review Pending Requests
                        </h3>
                        <p className="text-xs sm:text-sm text-white">
                          Approve or reject assessor applications
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("users")}
                    className="bg-red-600 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-200 text-left w-full h-24 flex items-center"
                  >
                    <div className="flex items-center pl-2 sm:pl-4 w-full h-full">
                      <div className="rounded-lg text-white bg-red-600">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                          Manage Users
                        </h3>
                        <p className="text-xs sm:text-sm text-white">
                          View and manage user accounts
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-sm font-bold text-[#333333ff] mb-4">
                    Recent Activity
                  </h2>
                  {assessorRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="text-gray-600">No recent activity.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        New assessor requests will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {assessorRequests.slice(0, 5).map((request) => (
                        <div
                          key={request.id}
                          className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-[#333333ff] text-sm">
                              {request.profiles?.full_name || "Unknown User"}
                            </h3>
                            <p className="text-sm text-[#333333ff]">
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {request.profiles?.email || "No email provided"}
                            </p>
                          </div>
                          <div className="flex flex-col sm:text-right space-y-1 sm:space-y-0">
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-full text-sm font-medium w-fit ${
                                request.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : request.status === "pending"
                                  ? "bg-red-200 text-red-700"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pending Requests Tab */}
            {activeTab === "pending" && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <p className="text-[#333333ff] mb-4">
                    Review and approve or reject assessor applications.
                  </p>
                </div>

                {/* Stats Summary */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#333333ff] mb-2">
                        Pending Requests
                      </h2>
                      <p className="text-xs text-[#333333ff]">
                        {stats.pending} requests requiring review
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-[#333333ff]">
                        {stats.pending} pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requests List */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className={LOADING_SPINNER_CLASSES.LARGE}></div>
                      <p className="mt-4 text-sm text-[#333333ff]">
                        {LOADING_TEXT.LOADING_REQUESTS}
                      </p>
                    </div>
                  ) : assessorRequests.filter((req) => req.status === "pending")
                      .length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
                      <p className="text-sm text-[#333333ff]">
                        No pending requests.
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        All assessor requests have been reviewed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
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
            )}

            {/* Active Assessors Tab */}
            {activeTab === "assessors" && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <p className="text-[#333333ff] mb-4">
                    View all active assessors in the system.
                  </p>
                </div>

                {/* Stats Summary */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#333333ff] mb-2">
                        Active Assessors
                      </h2>
                      <p className="text-xs text-[#333333ff]">
                        {activeAssessors.length} approved assessors
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-[#333333ff]">
                        {activeAssessors.length} active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assessors List */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className={LOADING_SPINNER_CLASSES.LARGE}></div>
                      <p className="mt-4 text-sm text-[#333333ff]">
                        {LOADING_TEXT.LOADING_ASSESSORS}
                      </p>
                    </div>
                  ) : activeAssessors.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
                      <p className="text-sm text-[#333333ff]">
                        No active assessors.
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        No assessors have been approved yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeAssessors.map((assessor) => (
                        <div
                          key={assessor.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">
                                {assessor.full_name?.charAt(0) || "A"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-[#333333ff]">
                                {assessor.full_name || "Unknown"}
                              </h3>
                              <p className="text-xs text-[#333333ff]">
                                {assessor.email}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Joined:{" "}
                                {new Date(
                                  assessor.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && <UserManagement />}

            {/* Clients Tab */}
            {activeTab === "clients" && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <p className="text-[#333333ff] mb-4">
                    Manage client accounts and information.
                  </p>
                </div>

                {/* Coming Soon Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
                    <h3 className="text-sm font-bold text-[#333333ff] mb-2">
                      Client Management Coming Soon
                    </h3>
                    <p className="text-xs text-gray-600">
                      Client management features will be available here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
