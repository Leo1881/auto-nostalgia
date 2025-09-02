import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import CustomSelect from "../common/CustomSelect";
import RequestDetailModal from "./RequestDetailModal";
import ScheduleAssessmentModal from "./ScheduleAssessmentModal";

function AssessmentRequests() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [pendingAcceptRequest, setPendingAcceptRequest] = useState(null);
  const { user, profile } = useAuth();

  const statusOptions = [
    { value: "all", label: "All Pending Requests" },
    { value: "pending", label: "Pending" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "pre_purchase", label: "Pre-Purchase Inspection" },
    { value: "condition_report", label: "Condition Report" },
    { value: "valuation", label: "Valuation Assessment" },
    { value: "safety_check", label: "Safety Check" },
    { value: "comprehensive", label: "Comprehensive Assessment" },
  ];

  const urgencyOptions = [
    { value: "all", label: "All Priorities" },
    { value: "low", label: "Low Priority" },
    { value: "normal", label: "Normal Priority" },
    { value: "high", label: "High Priority" },
    { value: "urgent", label: "Urgent Priority" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Date Created" },
    { value: "preferred_date", label: "Preferred Date" },
    { value: "urgency", label: "Urgency" },
    { value: "status", label: "Status" },
  ];

  useEffect(() => {
    if (user) {
      loadAssessmentRequests();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortRequests();
  }, [
    requests,
    selectedStatus,
    selectedType,
    selectedUrgency,
    sortBy,
    sortOrder,
  ]);

  const loadAssessmentRequests = async () => {
    setIsLoading(true);
    try {
      // Get all assessment requests in the assessor's province/location
      const { data: requestsData, error: requestsError } = await supabase
        .from("assessment_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error loading assessment requests:", requestsError);
        return;
      }

      // Get vehicle data for each request
      const vehicleIds = [
        ...new Set(requestsData?.map((req) => req.vehicle_id) || []),
      ];

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, year, make, model, registration_number, vin, mileage")
        .in("id", vehicleIds);

      if (vehiclesError) {
        console.error("Error loading vehicles:", vehiclesError);
        return;
      }

      // Then get profile data for each user
      const userIds = [
        ...new Set(requestsData?.map((req) => req.user_id) || []),
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
        requestsData?.map((request) => ({
          ...request,
          profiles: profilesMap[request.user_id],
          vehicles: vehiclesMap[request.vehicle_id],
        })) || [];

      // Filter by assessor's province and only show pending requests
      const assessorProvince = profile?.province || profile?.state;
      const requestsInProvince =
        combinedData?.filter((request) => {
          const customerProvince =
            request.profiles?.province || request.profiles?.state;
          // Only show pending requests that match the assessor's province
          return (
            request.status === "pending" &&
            (!assessorProvince || customerProvince === assessorProvince)
          );
        }) || [];

      setRequests(requestsInProvince);
    } catch (error) {
      console.error("Error loading assessment requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (request) => request.status === selectedStatus
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (request) => request.assessment_type === selectedType
      );
    }

    // Filter by urgency
    if (selectedUrgency !== "all") {
      filtered = filtered.filter(
        (request) => request.urgency === selectedUrgency
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      let urgencyOrder, statusOrder;

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
          urgencyOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
          aValue = urgencyOrder[a.urgency] || 0;
          bValue = urgencyOrder[b.urgency] || 0;
          break;
        case "status":
          statusOrder = { pending: 1, approved: 2, rejected: 3 };
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

    setFilteredRequests(filtered);
  };

  const handleAcceptRequest = async (request) => {
    if (!confirm("Are you sure you want to accept this assessment request?")) {
      return;
    }

    // Set the pending request and open scheduling modal
    setPendingAcceptRequest(request);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSuccess = async () => {
    // Refresh the requests list after successful scheduling
    await loadAssessmentRequests();
    setPendingAcceptRequest(null);
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt(
      "Please provide a reason for rejecting this request:"
    );
    if (!reason) {
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("assessment_requests")
        .update({
          status: "rejected",
          rejection_reason: reason,
          assigned_assessor_id: user.id,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) {
        console.error("Error rejecting request:", error);
        alert("Failed to reject request. Please try again.");
      } else {
        // Refresh the requests list
        await loadAssessmentRequests();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
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

  const formatAssessmentType = (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-red-200 text-red-700";
      case "approved":
        return "bg-red-200 text-red-700";
      case "rejected":
        return "bg-red-200 text-red-700";
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
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          Assessment Requests
        </h1>
        <p className="text-sm text-[#333333ff]">
          View and manage assessment requests in your province.
        </p>
        {profile?.province && (
          <p className="text-sm text-gray-600 mt-2">
            Operating in:{" "}
            <span className="font-medium">{profile.province}</span>
          </p>
        )}
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <CustomSelect
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Filter by status"
              className="w-full"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Type
            </label>
            <CustomSelect
              options={typeOptions}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Filter by type"
              className="w-full"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <CustomSelect
              options={urgencyOptions}
              value={selectedUrgency}
              onChange={setSelectedUrgency}
              placeholder="Filter by priority"
              className="w-full"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <CustomSelect
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
              className="w-full"
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

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {filteredRequests.length === 0 ? (
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
              {requests.length === 0
                ? "No Assessment Requests Found"
                : "No Requests Match Filters"}
            </h3>
            <p className="text-gray-600">
              {requests.length === 0
                ? "There are no assessment requests in your province yet."
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  {/* Vehicle and Customer Info */}
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
                          {request.vehicles?.year} {request.vehicles?.make}{" "}
                          {request.vehicles?.model}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Registration: {request.vehicles?.registration_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          Customer: {request.profiles?.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Location: {request.profiles?.city},{" "}
                          {request.profiles?.province}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatAssessmentType(request.assessment_type)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(
                              request.urgency
                            )}`}
                          >
                            {request.urgency.charAt(0).toUpperCase() +
                              request.urgency.slice(1)}{" "}
                            Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates and Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Requested: {formatDateTime(request.created_at)}
                      </p>
                      {request.preferred_date && (
                        <p className="text-sm text-gray-600">
                          Preferred: {formatDate(request.preferred_date)}
                          {request.preferred_time &&
                            ` at ${request.preferred_time}`}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </button>
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(request)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? "Processing..." : "Accept"}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? "Processing..." : "Reject"}
                          </button>
                        </>
                      )}
                    </div>

                    {request.status === "approved" && (
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Accepted
                      </div>
                    )}

                    {request.status === "rejected" && (
                      <div className="text-sm text-red-600 font-medium">
                        ✗ Rejected
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                {request.additional_notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span>{" "}
                      {request.additional_notes}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.rejection_reason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-red-600">
                      <span className="font-medium">Rejection Reason:</span>{" "}
                      {request.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      {/* Schedule Assessment Modal */}
      <ScheduleAssessmentModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setPendingAcceptRequest(null);
        }}
        request={pendingAcceptRequest}
        onScheduleSuccess={handleScheduleSuccess}
      />
    </div>
  );
}

export default AssessmentRequests;
