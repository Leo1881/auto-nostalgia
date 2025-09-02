import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { reportService } from "../../lib/reportService";
import CustomSelect from "../common/CustomSelect";
import AssessmentDetailModal from "./AssessmentDetailModal";
import RescheduleModal from "./RescheduleModal";

function AssessmentHistory() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "pre_purchase", label: "Pre-Purchase Inspection" },
    { value: "condition_report", label: "Condition Report" },
    { value: "valuation", label: "Valuation Assessment" },
    { value: "safety_check", label: "Safety Check" },
    { value: "comprehensive", label: "Comprehensive Assessment" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Date Created" },
    { value: "preferred_date", label: "Preferred Date" },
    { value: "urgency", label: "Urgency" },
    { value: "status", label: "Status" },
  ];

  useEffect(() => {
    if (user) {
      loadAssessmentHistory();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortAssessments();
  }, [assessments, selectedStatus, selectedType, sortBy, sortOrder]);

  const loadAssessmentHistory = async () => {
    setIsLoading(true);
    try {
      // First get assessment requests
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessment_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (assessmentsError) {
        console.error("Error loading assessment history:", assessmentsError);
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
        .select("id, year, make, model, registration_number")
        .in("id", vehicleIds);

      if (vehiclesError) {
        console.error("Error loading vehicles:", vehiclesError);
        return;
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

      // Get customer profile data
      const { data: customerProfile, error: customerError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email, city, province")
        .eq("id", user.id)
        .single();

      if (customerError) {
        console.error("Error loading customer profile:", customerError);
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

      const combinedData =
        assessmentsData?.map((assessment) => ({
          ...assessment,
          vehicles: vehiclesMap[assessment.vehicle_id],
          assessor: assessorsMap[assessment.assigned_assessor_id],
          profiles: customerProfile, // Add customer profile data
        })) || [];

      setAssessments(combinedData);
    } catch (error) {
      console.error("Error loading assessment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortAssessments = () => {
    let filtered = [...assessments];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (assessment) => assessment.status === selectedStatus
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (assessment) => assessment.assessment_type === selectedType
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "preferred_date":
          aValue = new Date(a.preferred_date);
          bValue = new Date(b.preferred_date);
          break;
        case "urgency":
          const urgencyOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
          aValue = urgencyOrder[a.urgency] || 0;
          bValue = urgencyOrder[b.urgency] || 0;
          break;
        case "status":
          const statusOrder = {
            pending: 1,
            approved: 2,
            completed: 3,
            rejected: 4,
            cancelled: 5,
          };
          aValue = statusOrder[a.status] || 0;
          bValue = statusOrder[b.status] || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAssessments(filtered);
  };

  const handleViewDetails = (assessment) => {
    setSelectedAssessment(assessment);
    setIsDetailModalOpen(true);
  };

  const handleCancelRequest = async (assessmentId) => {
    if (!confirm("Are you sure you want to cancel this assessment request?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from("assessment_requests")
        .update({ status: "cancelled" })
        .eq("id", assessmentId);

      if (error) {
        console.error("Error cancelling assessment request:", error);
        alert("Failed to cancel assessment request. Please try again.");
      } else {
        // Refresh the assessment list
        await loadAssessmentHistory();
        setIsDetailModalOpen(false);
        setSelectedAssessment(null);
      }
    } catch (error) {
      console.error("Error cancelling assessment request:", error);
      alert("Failed to cancel assessment request. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRescheduleRequest = (assessment) => {
    setSelectedAssessment(assessment);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSuccess = async () => {
    // Refresh the assessment list
    await loadAssessmentHistory();
    setIsRescheduleModalOpen(false);
    setSelectedAssessment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-red-200 text-red-700";
      case "approved":
        return "bg-red-200 text-red-700";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-200 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "low":
        return "bg-gray-100 text-gray-600";
      case "normal":
        return "bg-red-200 text-red-700";
      case "high":
        return "bg-red-200 text-red-700";
      case "urgent":
        return "bg-red-200 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatAssessmentType = (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleGenerateReport = async (assessment) => {
    try {
      // Get complete assessment data including vehicle, customer, and assessor
      const assessmentData = {
        assessment: assessment,
        vehicle: assessment.vehicles,
        customer: assessment.profiles,
        assessor: assessment.assessor,
      };

      console.log("📄 Report data being passed:", assessmentData);

      await reportService.downloadReport(assessmentData);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-xl font-bold text-[#333333ff] mb-2">
          Assessment History
        </h1>
        <p className="text-sm text-[#333333ff]">
          View all your past vehicle assessments and their results.
        </p>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <CustomSelect
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Filter by status"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Type
            </label>
            <CustomSelect
              options={typeOptions}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Filter by type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <CustomSelect
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortOrder("desc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  sortOrder === "desc"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Newest First
              </button>
              <button
                onClick={() => setSortOrder("asc")}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  sortOrder === "asc"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Oldest First
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment List */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {assessments.length === 0
                ? "No Assessments Found"
                : "No Assessments Match Filters"}
            </h3>
            <p className="text-gray-600">
              {assessments.length === 0
                ? "You haven't submitted any assessment requests yet."
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                  {/* Vehicle and Assessment Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-red-600"
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
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assessment.vehicles?.year}{" "}
                          {assessment.vehicles?.make}{" "}
                          {assessment.vehicles?.model}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Registration:{" "}
                          {assessment.vehicles?.registration_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatAssessmentType(assessment.assessment_type)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              assessment.status
                            )}`}
                          >
                            {assessment.status.charAt(0).toUpperCase() +
                              assessment.status.slice(1)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(
                              assessment.urgency
                            )}`}
                          >
                            {assessment.urgency.charAt(0).toUpperCase() +
                              assessment.urgency.slice(1)}{" "}
                            Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates and Actions */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Requested: {formatDateTime(assessment.created_at)}
                      </p>
                      {assessment.preferred_date && (
                        <p className="text-sm text-gray-600">
                          Preferred: {formatDate(assessment.preferred_date)}
                          {assessment.preferred_time &&
                            ` at ${assessment.preferred_time}`}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(assessment)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </button>
                      {assessment.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleRescheduleRequest(assessment)}
                            className="px-3 py-1 text-sm bg-red-200 text-red-700 rounded hover:bg-red-300 transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelRequest(assessment.id)}
                            disabled={isCancelling}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isCancelling ? "Cancelling..." : "Cancel"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assessor Information for Approved Assessments */}
                {assessment.status === "approved" && assessment.assessor && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          Assigned Assessor
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Name:</span>{" "}
                            {assessment.assessor.full_name}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Phone:</span>{" "}
                            {assessment.assessor.phone || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Email:</span>{" "}
                            {assessment.assessor.email}
                          </p>
                          {assessment.scheduled_date && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Scheduled:</span>{" "}
                              {formatDate(assessment.scheduled_date)}
                              {assessment.scheduled_time &&
                                ` at ${assessment.scheduled_time}`}
                            </p>
                          )}
                        </div>
                      </div>
                      {assessment.assessment_location && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Location:</span>{" "}
                            {assessment.assessment_location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assessment Results for Completed Assessments */}
                {assessment.status === "completed" &&
                  assessment.vehicle_value && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
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
                          <span className="text-sm font-medium text-green-800">
                            Assessment Complete
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">
                                Vehicle Value:
                              </span>{" "}
                              R{assessment.vehicle_value.toLocaleString()}
                            </p>
                            {assessment.completion_date && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Completed:</span>{" "}
                                {new Date(
                                  assessment.completion_date
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div>
                            {assessment.assessor && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Assessor:</span>{" "}
                                {assessment.assessor.full_name}
                              </p>
                            )}
                          </div>
                        </div>
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
                    </div>
                  )}

                {/* Additional Notes */}
                {assessment.additional_notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span>{" "}
                      {assessment.additional_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment Detail Modal */}
      <AssessmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
        onCancelRequest={handleCancelRequest}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
        onRescheduleSuccess={handleRescheduleSuccess}
      />
    </div>
  );
}

export default AssessmentHistory;
