import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { reportService } from "../../lib/reportService";
import CompleteAssessmentModal from "./CompleteAssessmentModal";

function MySchedule() {
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledAssessments, setScheduledAssessments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadScheduledAssessments();
    }
  }, [user]);

  const loadScheduledAssessments = async () => {
    setIsLoading(true);
    try {
      // Get all scheduled assessments assigned to this assessor (approved and scheduled status)
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessment_requests")
        .select("*")
        .eq("assigned_assessor_id", user.id)
        .in("status", ["approved", "scheduled"])
        .order("scheduled_date", { ascending: true });

      if (assessmentsError) {
        console.error("Error loading scheduled assessments:", assessmentsError);
        return;
      }

      // Get vehicle data for each assessment
      const vehicleIds = [
        ...new Set(
          assessmentsData?.map((assessment) => assessment.vehicle_id) || []
        ),
      ];

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, year, make, model, registration_number, vin, mileage")
        .in("id", vehicleIds);

      if (vehiclesError) {
        console.error("Error loading vehicles:", vehiclesError);
        return;
      }

      // Get customer profile data
      const userIds = [
        ...new Set(
          assessmentsData?.map((assessment) => assessment.user_id) || []
        ),
      ];

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email, province, city")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        return;
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
        assessmentsData?.map((assessment) => ({
          ...assessment,
          profiles: profilesMap[assessment.user_id],
          vehicles: vehiclesMap[assessment.vehicle_id],
        })) || [];

      console.log("Loaded scheduled assessments:", combinedData);
      setScheduledAssessments(combinedData);
    } catch (error) {
      console.error("Error loading scheduled assessments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not specified";
    return timeString;
  };

  const formatAssessmentType = (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "scheduled":
        return "bg-red-200 text-red-700";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleCompleteAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setIsCompletionModalOpen(true);
  };

  const handleCompletionSuccess = async () => {
    // Refresh the schedule after successful completion
    await loadScheduledAssessments();
    setSelectedAssessment(null);
  };

  const handleGenerateReport = async (assessment) => {
    try {
      // Get complete assessment data including vehicle, customer, and assessor
      const assessmentData = {
        assessment: assessment,
        vehicle: assessment.vehicles,
        customer: assessment.profiles,
        assessor: {
          full_name: user.user_metadata?.full_name || user.email,
          email: user.email,
          phone: user.user_metadata?.phone || "Not provided",
        },
      };

      await reportService.downloadReport(assessmentData);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  const filteredAssessments = scheduledAssessments.filter((assessment) => {
    if (!selectedDate) return true;
    return assessment.scheduled_date === selectedDate;
  });

  const upcomingAssessments = scheduledAssessments.filter((assessment) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDate = new Date(assessment.scheduled_date);
    return scheduledDate >= today;
  });

  const pastAssessments = scheduledAssessments.filter((assessment) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDate = new Date(assessment.scheduled_date);
    return scheduledDate < today;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h1 className="text-xl font-bold text-[#333333ff] mb-2">
            My Schedule
          </h1>
          <p className="text-sm text-[#333333ff]">
            View your scheduled assessments and manage your calendar.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-xl font-bold text-[#333333ff] mb-2">My Schedule</h1>
        <p className="text-sm text-[#333333ff]">
          View your scheduled assessments and manage your calendar.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-200 rounded-lg">
              <svg
                className="w-6 h-6 text-red-700"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Scheduled
              </p>
              <p className="text-2xl font-bold text-[#333333ff]">
                {scheduledAssessments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-200 rounded-lg">
              <svg
                className="w-6 h-6 text-red-700"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-[#333333ff]">
                {upcomingAssessments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
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
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-[#333333ff]">
                {pastAssessments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#333333ff]">
            Filter by Date
          </h2>
          <button
            onClick={() => setSelectedDate("")}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Show All
          </button>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
        />
      </div>

      {/* Scheduled Assessments */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[#333333ff] mb-4">
          Scheduled Assessments{" "}
          {selectedDate && `- ${formatDate(selectedDate)}`}
        </h2>

        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedDate
                ? "No assessments scheduled for this date"
                : "No scheduled assessments"}
            </h3>
            <p className="text-gray-600">
              {selectedDate
                ? "You have no assessments scheduled for the selected date."
                : "You don't have any scheduled assessments yet. Approved requests will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          assessment.status
                        )}`}
                      >
                        {assessment.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatAssessmentType(assessment.assessment_type)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-[#333333ff]">
                        {assessment.vehicles?.year} {assessment.vehicles?.make}{" "}
                        {assessment.vehicles?.model}
                      </h3>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {assessment.vehicles?.registration_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {assessment.vehicles?.mileage}km
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Customer
                      </p>
                      <p className="text-sm text-gray-900">
                        {assessment.profiles?.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {assessment.profiles?.phone}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Scheduled Date
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatDate(assessment.scheduled_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Scheduled Time
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatTime(assessment.scheduled_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Location
                        </p>
                        <p className="text-sm text-gray-900">
                          {assessment.assessment_location || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {assessment.assessment_notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">
                          Notes
                        </p>
                        <p className="text-sm text-gray-900">
                          {assessment.assessment_notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      {(assessment.status === "approved" ||
                        assessment.status === "scheduled") && (
                        <button
                          onClick={() => handleCompleteAssessment(assessment)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Complete Assessment
                        </button>
                      )}
                      {assessment.status === "completed" &&
                        assessment.vehicle_value && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-green-800">
                              Assessment Completed
                            </p>
                            <p className="text-sm text-green-700">
                              Vehicle Value: R
                              {assessment.vehicle_value.toLocaleString()}
                            </p>
                            {assessment.completion_date && (
                              <p className="text-sm text-green-700">
                                Completed:{" "}
                                {new Date(
                                  assessment.completion_date
                                ).toLocaleDateString()}
                              </p>
                            )}
                            <div className="mt-3">
                              <button
                                onClick={() => handleGenerateReport(assessment)}
                                className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Generate Report
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Assessment Modal */}
      <CompleteAssessmentModal
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
        onCompletionSuccess={handleCompletionSuccess}
      />
    </div>
  );
}

export default MySchedule;
