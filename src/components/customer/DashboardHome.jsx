import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import AddVehicleModal from "./AddVehicleModal";

function DashboardHome({ onSectionChange }) {
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    pendingRequests: 0,
    completedAssessments: 0,
    totalVehicles: 0,
  });
  const [recentAssessments, setRecentAssessments] = useState([]);
  const { profile, user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load stats and recent assessments in parallel
      const [statsData, recentAssessmentsData] = await Promise.all([
        loadStats(),
        loadRecentAssessments(),
      ]);

      setStats(statsData);
      setRecentAssessments(recentAssessmentsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total vehicles
      const { count: totalVehicles } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get assessment requests
      const { data: assessments } = await supabase
        .from("assessment_requests")
        .select("*")
        .eq("user_id", user.id);

      const totalAssessments = assessments?.length || 0;
      const pendingRequests =
        assessments?.filter((a) => a.status === "pending").length || 0;
      const completedAssessments =
        assessments?.filter((a) => a.status === "completed").length || 0;

      return {
        totalAssessments,
        pendingRequests,
        completedAssessments,
        totalVehicles: totalVehicles || 0,
      };
    } catch (error) {
      console.error("Error loading stats:", error);
      return {
        totalAssessments: 0,
        pendingRequests: 0,
        completedAssessments: 0,
        totalVehicles: 0,
      };
    }
  };

  const loadRecentAssessments = async () => {
    try {
      // First get assessment requests
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessment_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (assessmentsError) {
        console.error("Error loading recent assessments:", assessmentsError);
        return [];
      }

      // Get vehicle data for each assessment
      const vehicleIds = [
        ...new Set(assessmentsData?.map((assessment) => assessment.vehicle_id) || []),
      ];

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, year, make, model, registration_number")
        .in("id", vehicleIds);

      if (vehiclesError) {
        console.error("Error loading vehicles:", vehiclesError);
        return [];
      }

      // Get assessor profile data for approved assessments
      const assessorIds = [
        ...new Set(
          assessmentsData
            ?.filter((assessment) => assessment.assigned_assessor_id)
            .map((assessment) => assessment.assigned_assessor_id) || []
        ),
      ];

      let assessorsData = [];
      if (assessorIds.length > 0) {
        const { data: assessors, error: assessorsError } = await supabase
          .from("profiles")
          .select("id, full_name, phone, email")
          .in("id", assessorIds);

        if (assessorsError) {
          console.error("Error loading assessors:", assessorsError);
        } else {
          assessorsData = assessors || [];
        }
      }

      // Combine the data
      const vehiclesMap = {};
      vehiclesData?.forEach((vehicle) => {
        vehiclesMap[vehicle.id] = vehicle;
      });

      const assessorsMap = {};
      assessorsData?.forEach((assessor) => {
        assessorsMap[assessor.id] = assessor;
      });

      const combinedData = assessmentsData?.map((assessment) => ({
        ...assessment,
        vehicles: vehiclesMap[assessment.vehicle_id],
        assessor: assessorsMap[assessment.assigned_assessor_id],
      })) || [];

      // Transform the data for display
      return combinedData?.map((assessment) => ({
        id: assessment.id,
        vehicle: `${assessment.vehicles?.year} ${assessment.vehicles?.make} ${assessment.vehicles?.model} (${assessment.vehicles?.registration_number})`,
        status:
          assessment.status.charAt(0).toUpperCase() +
          assessment.status.slice(1),
        date: assessment.created_at,
        assessmentType: assessment.assessment_type
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        urgency: assessment.urgency,
        assessor: assessment.assessor, // Include assessor data
      })) || [];
    } catch (error) {
      console.error("Error loading recent assessments:", error);
      return [];
    }
  };

  const handleAddVehicle = (vehicleData) => {
    console.log("Vehicle added successfully:", vehicleData);
    // Refresh dashboard data after adding vehicle
    loadDashboardData();
  };

  const handleCloseModal = () => {
    setIsAddVehicleModalOpen(false);
  };

  const navigateToSection = (section) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const quickActions = [
    {
      title: "Request an assessment",
      description: "Get your vehicle appraised by our experts",
      icon: (
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
      action: () => navigateToSection("request-assessment"),
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      title: "Add new vehicle",
      description: "Add a new vehicle to your profile",
      icon: (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      action: () => setIsAddVehicleModalOpen(true),
      color: "bg-red-600 hover:bg-red-700",
    },
  ];

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

        {/* Quick Actions Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6 h-24"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
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
        <p className="text-[#333333ff] mb-4">
          Here's what's happening with your vehicle assessments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <svg
                className="w-4 h-4 text-red-600"
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
                Total Assessments
              </p>
              <p className="text-xs font-bold text-[#333333ff]">
                {stats.totalAssessments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <svg
                className="w-4 h-4 text-orange-600"
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
                Pending Requests
              </p>
              <p className="text-xs font-bold text-[#333333ff]">
                {stats.pendingRequests}
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-3 flex items-center space-x-2">
              <p className="text-xs font-medium text-[#333333ff] mr-2">
                Total Vehicles
              </p>
              <p className="text-xs font-bold text-[#333333ff]">
                {stats.totalVehicles}
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
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="bg-red-600 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-200 text-left w-full h-24 flex items-center"
          >
            <div className="flex items-center pl-2 sm:pl-4 w-full h-full">
              <div
                className={`p-2 sm:p-3 rounded-lg text-white ${action.color}`}
              >
                {action.icon}
              </div>
              <div className="ml-3 sm:ml-4 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-white">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Assessments */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-bold text-[#333333ff] mb-4">
          Recent Assessments
        </h2>
        {recentAssessments.length === 0 ? (
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
            <p className="text-gray-600">No assessment requests yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              Start by requesting your first assessment.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recentAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-[#333333ff] text-sm">
                    {assessment.vehicle}
                  </h3>
                  <p className="text-sm text-[#333333ff]">
                    {new Date(assessment.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {assessment.assessmentType}
                  </p>
                  
                  {/* Assessor Information for Approved Assessments */}
                  {assessment.status === "Approved" && assessment.assessor && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center space-x-1 mb-1">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs font-medium text-green-800">Assigned Assessor</span>
                      </div>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Name:</span> {assessment.assessor.full_name}
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Phone:</span> {assessment.assessor.phone || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:text-right space-y-1 sm:space-y-0">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-sm font-medium w-fit ${
                      assessment.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : assessment.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : assessment.status === "Approved"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {assessment.status}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Priority:{" "}
                    {assessment.urgency.charAt(0).toUpperCase() +
                      assessment.urgency.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
}

export default DashboardHome;
