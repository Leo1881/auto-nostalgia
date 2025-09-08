import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

function AllAssessmentsView() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllAssessments();
  }, []);

  const fetchAllAssessments = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all assessment requests first
      const { data: assessmentRequests, error: requestsError } = await supabase
        .from("assessment_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching assessments:", requestsError);
        setError("Failed to fetch assessments");
        return;
      }

      if (!assessmentRequests || assessmentRequests.length === 0) {
        setAssessments([]);
        return;
      }

      // Get unique IDs for related data
      const vehicleIds = [
        ...new Set(
          assessmentRequests.map((req) => req.vehicle_id).filter(Boolean)
        ),
      ];
      const customerIds = [
        ...new Set(
          assessmentRequests.map((req) => req.user_id).filter(Boolean)
        ),
      ];
      const assessorIds = [
        ...new Set(
          assessmentRequests
            .map((req) => req.assigned_assessor_id)
            .filter(Boolean)
        ),
      ];

      // Fetch related data in parallel
      const [vehiclesResult, customersResult, assessorsResult] =
        await Promise.all([
          vehicleIds.length > 0
            ? supabase.from("vehicles").select("*").in("id", vehicleIds)
            : { data: [] },
          customerIds.length > 0
            ? supabase.from("profiles").select("*").in("id", customerIds)
            : { data: [] },
          assessorIds.length > 0
            ? supabase.from("profiles").select("*").in("id", assessorIds)
            : { data: [] },
        ]);

      // Create lookup maps
      const vehiclesMap = {};
      vehiclesResult.data?.forEach((vehicle) => {
        vehiclesMap[vehicle.id] = vehicle;
      });

      const customersMap = {};
      customersResult.data?.forEach((customer) => {
        customersMap[customer.id] = customer;
      });

      const assessorsMap = {};
      assessorsResult.data?.forEach((assessor) => {
        assessorsMap[assessor.id] = assessor;
      });

      // Combine the data
      const assessmentsWithDetails = assessmentRequests.map((request) => ({
        ...request,
        vehicles: vehiclesMap[request.vehicle_id] || null,
        profiles: customersMap[request.user_id] || null,
        assessor: assessorsMap[request.assigned_assessor_id] || null,
      }));

      console.log("Fetched assessments:", assessmentsWithDetails);
      setAssessments(assessmentsWithDetails);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (assessmentId, newStatus) => {
    try {
      const { error } = await supabase
        .from("assessment_requests")
        .update({ status: newStatus })
        .eq("id", assessmentId);

      if (error) {
        console.error("Error updating status:", error);
        alert("Failed to update assessment status");
        return;
      }

      // Update local state
      setAssessments((prev) =>
        prev.map((assessment) =>
          assessment.id === assessmentId
            ? { ...assessment, status: newStatus }
            : assessment
        )
      );

      alert("Assessment status updated successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to update assessment status");
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (
      !confirm(
        "Are you sure you want to delete this assessment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("assessment_requests")
        .delete()
        .eq("id", assessmentId);

      if (error) {
        console.error("Error deleting assessment:", error);
        alert("Failed to delete assessment");
        return;
      }

      // Update local state
      setAssessments((prev) =>
        prev.filter((assessment) => assessment.id !== assessmentId)
      );
      alert("Assessment deleted successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to delete assessment");
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesStatus =
      filterStatus === "all" || assessment.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      assessment.vehicles?.registration_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.vehicles?.make
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.vehicles?.model
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.profiles?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.profiles?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#333333ff]">
              All Assessments
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage all assessment requests in the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Total: {assessments.length} | Showing:{" "}
              {filteredAssessments.length}
            </span>
            <button
              onClick={fetchAllAssessments}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vehicle, customer name, or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => setError("")}
            className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Clear Error
          </button>
        </div>
      )}

      {/* Assessments List */}
      {filteredAssessments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Assessment Info */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Vehicle Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Vehicle
                      </h4>
                      <p className="text-sm text-gray-600">
                        {assessment.vehicles?.year} {assessment.vehicles?.make}{" "}
                        {assessment.vehicles?.model}
                      </p>
                      <p className="text-xs text-gray-500">
                        {assessment.vehicles?.registration_number}
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Customer
                      </h4>
                      <p className="text-sm text-gray-600">
                        {assessment.profiles?.full_name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {assessment.profiles?.email}
                      </p>
                    </div>

                    {/* Assessor Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Assessor
                      </h4>
                      <p className="text-sm text-gray-600">
                        {assessment.assessor?.full_name || "Not assigned"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {assessment.assessor?.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Assessment Details */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        <strong>Created:</strong>{" "}
                        {formatDate(assessment.created_at)}
                      </span>
                      <span>
                        <strong>Scheduled:</strong>{" "}
                        {formatDate(assessment.scheduled_date)}
                      </span>
                      <span>
                        <strong>Type:</strong>{" "}
                        {assessment.assessment_type
                          ?.replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      {assessment.vehicle_value && (
                        <span>
                          <strong>Value:</strong> R{" "}
                          {assessment.vehicle_value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:ml-4">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        assessment.status
                      )}`}
                    >
                      {assessment.status
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Status Change Dropdown */}
                  <div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusChange(assessment.id, e.target.value);
                          e.target.value = ""; // Reset to placeholder
                        }
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Change Status</option>
                      <option value="pending">Pending</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assessments found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No assessment requests have been submitted yet."}
          </p>
        </div>
      )}
    </div>
  );
}

export default AllAssessmentsView;
