import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { reportService } from "../../lib/reportService";
import CustomSelect from "../common/CustomSelect";

function AssessmentHistory() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("completion_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "pre_purchase", label: "Pre-Purchase Inspection" },
    { value: "condition_report", label: "Condition Report" },
    { value: "valuation", label: "Valuation Assessment" },
    { value: "safety_check", label: "Safety Check" },
    { value: "comprehensive", label: "Comprehensive Assessment" },
  ];

  const sortOptions = [
    { value: "completion_date", label: "Completion Date" },
    { value: "vehicle_value", label: "Vehicle Value" },
    { value: "assessment_type", label: "Assessment Type" },
  ];

  useEffect(() => {
    if (user) {
      loadCompletedAssessments();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortAssessments();
  }, [completedAssessments, selectedType, sortBy, sortOrder]);

  const loadCompletedAssessments = async () => {
    setIsLoading(true);
    try {
      // Get completed assessments assigned to this assessor
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessment_requests")
        .select("*")
        .eq("assigned_assessor_id", user.id)
        .eq("status", "completed")
        .order("completion_date", { ascending: false });

      if (assessmentsError) {
        console.error("Error loading completed assessments:", assessmentsError);
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
        .select(
          "id, year, make, model, registration_number, vin, mileage, color"
        )
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

      setCompletedAssessments(combinedData);
    } catch (error) {
      console.error("Error loading completed assessments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortAssessments = () => {
    let filtered = [...completedAssessments];

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
        case "completion_date":
          aValue = new Date(a.completion_date);
          bValue = new Date(b.completion_date);
          break;
        case "vehicle_value":
          aValue = a.vehicle_value || 0;
          bValue = b.vehicle_value || 0;
          break;
        case "assessment_type":
          aValue = a.assessment_type;
          bValue = b.assessment_type;
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

  const handleGenerateReport = async (assessment) => {
    try {
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

      const result = await reportService.downloadReport(assessmentData);
      if (result.success) {
        alert("Report generated and saved successfully!");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#333333ff] mb-2">
              Assessment History
            </h1>
            <p className="text-sm text-[#333333ff]">
              View your completed assessments and generate reports.
            </p>
          </div>
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {filteredAssessments.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Type
            </label>
            <CustomSelect
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              placeholder="Select type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              placeholder="Select sort"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessment List */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Completed Assessments
            </h3>
            <p className="text-gray-600">
              You haven't completed any assessments yet. Complete assessments
              will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#333333ff]">
                    {assessment.vehicles?.year} {assessment.vehicles?.make}{" "}
                    {assessment.vehicles?.model}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {assessment.vehicles?.registration_number} •{" "}
                    {assessment.profiles?.full_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Assessment Type
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatAssessmentType(assessment.assessment_type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Vehicle Value
                  </p>
                  <p className="text-sm text-gray-900">
                    R{assessment.vehicle_value?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Completed Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDate(assessment.completion_date)}
                  </p>
                </div>
              </div>

              {assessment.assessment_notes && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Assessment Notes
                  </p>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                    {assessment.assessment_notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => handleGenerateReport(assessment)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
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
          ))}
        </div>
      )}
    </div>
  );
}

export default AssessmentHistory;
