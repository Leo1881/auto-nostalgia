import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

function AssessorHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    scheduledAssessments: 0,
    completedAssessments: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      loadAssessorData();
    }
  }, [user]);

  const loadAssessorData = async () => {
    setIsLoading(true);
    try {
      // Load stats and recent requests in parallel
      const [statsData, recentRequestsData] = await Promise.all([
        loadStats(),
        loadRecentRequests(),
      ]);

      setStats(statsData);
      setRecentRequests(recentRequestsData);
    } catch (error) {
      console.error("Error loading assessor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get all assessment requests in assessor's province
      const { data: allRequests } = await supabase
        .from("assessment_requests")
        .select("*")
        .eq("status", "pending");

      // Filter by province (assuming assessor's province is stored in profile)
      const assessorProvince = profile?.location || profile?.province;
      const requestsInProvince =
        allRequests?.filter((request) => {
          // This would need to be enhanced when we add province to assessment_requests
          return true; // For now, show all pending requests
        }) || [];

      const totalRequests = requestsInProvince.length;
      const pendingRequests = requestsInProvince.filter(
        (r) => r.status === "pending"
      ).length;
      const scheduledAssessments = requestsInProvince.filter(
        (r) => r.status === "approved"
      ).length;
      const completedAssessments = requestsInProvince.filter(
        (r) => r.status === "completed"
      ).length;

      return {
        totalRequests,
        pendingRequests,
        scheduledAssessments,
        completedAssessments,
      };
    } catch (error) {
      console.error("Error loading stats:", error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        scheduledAssessments: 0,
        completedAssessments: 0,
      };
    }
  };

  const loadRecentRequests = async () => {
    try {
      // First get assessment requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("assessment_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      if (requestsError) {
        console.error("Error loading recent requests:", requestsError);
        return [];
      }

      // Get vehicle data for each request
      const vehicleIds = [
        ...new Set(requestsData?.map((req) => req.vehicle_id) || []),
      ];
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, year, make, model, registration_number")
        .in("id", vehicleIds);

      if (vehiclesError) {
        console.error("Error loading vehicles:", vehiclesError);
        return [];
      }

      // Get profile data for each user
      const userIds = [
        ...new Set(requestsData?.map((req) => req.user_id) || []),
      ];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        return [];
      }

      // Combine the data
      const profilesMap = {};
      profilesData?.forEach((profile) => {
        profilesMap[profile.id] = profile;
      });

      const vehiclesMap = {};
      vehiclesData?.forEach((vehicle) => {
        vehiclesMap[vehicle.id] = vehicle;
      });

      const combinedData =
        requestsData?.map((request) => ({
          ...request,
          profiles: profilesMap[request.user_id],
          vehicles: vehiclesMap[request.vehicle_id],
        })) || [];

      return combinedData;
    } catch (error) {
      console.error("Error loading recent requests:", error);
      return [];
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAssessmentType = (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "low":
        return "bg-green-100 text-green-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>

        {/* Stats Grid Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-xl font-bold text-[#333333ff] mb-2">
          Assessor Dashboard
        </h1>
        <p className="text-sm text-[#333333ff]">
          Welcome back! Here's your assessment overview and recent requests.
        </p>
        {profile?.location && (
          <p className="text-sm text-gray-600 mt-2">
            Operating in:{" "}
            <span className="font-medium">{profile.location}</span>
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <svg
                className="w-4 h-4 text-blue-600"
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
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <p className="text-xs font-medium text-[#333333ff] mr-2">
                Total Requests
              </p>
              <p className="text-xs font-bold text-[#333333ff]">
                {stats.totalRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-yellow-100 rounded-lg">
              <svg
                className="w-4 h-4 text-yellow-600"
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
                {stats.pendingRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <p className="text-xs font-medium text-[#333333ff] mr-2">
                Scheduled
              </p>
              <p className="text-xs font-bold text-[#333333ff]">
                {stats.scheduledAssessments}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <p className="text-xs font-medium text-[#333333ff] mr-2">
                Completed
              </p>
              <p className="text-xs font-bold text-[#333333ff]">
                {stats.completedAssessments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessment Requests */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-bold text-[#333333ff] mb-4">
          Recent Assessment Requests
        </h2>
        {recentRequests.length === 0 ? (
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
            <p className="text-gray-600">No pending assessment requests.</p>
            <p className="text-sm text-gray-500 mt-1">
              New requests will appear here when customers submit them.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0"
              >
                <div>
                  <h3 className="font-medium text-[#333333ff] text-sm">
                    {request.vehicles?.year} {request.vehicles?.make}{" "}
                    {request.vehicles?.model}
                  </h3>
                  <p className="text-sm text-[#333333ff]">
                    {request.profiles?.full_name} •{" "}
                    {formatDate(request.created_at)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatAssessmentType(request.assessment_type)}
                  </p>
                </div>
                <div className="flex flex-col sm:text-right space-y-1 sm:space-y-0">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-sm font-medium w-fit ${getUrgencyColor(
                      request.urgency
                    )}`}
                  >
                    {request.urgency.charAt(0).toUpperCase() +
                      request.urgency.slice(1)}{" "}
                    Priority
                  </span>
                  <p className="text-sm font-medium text-[#333333ff]">
                    {request.vehicles?.registration_number}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssessorHome;
