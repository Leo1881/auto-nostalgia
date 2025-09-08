import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

function ReportsView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchMode, setSearchMode] = useState("vehicle"); // "vehicle" or "client"
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    fetchVehicles();
    fetchClients();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("registration_number", { ascending: true });

      if (error) {
        console.error("Error fetching vehicles:", error);
        return;
      }

      console.log("Fetched vehicles:", data);
      console.log("Number of vehicles:", data?.length || 0);
      setVehicles(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "customer")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching clients:", error);
        return;
      }

      setClients(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  const searchReports = async () => {
    try {
      setLoading(true);
      setError("");

      let query = supabase
        .from("assessment_requests")
        .select("*")
        .not("report_url", "is", null);

      if (searchMode === "vehicle" && selectedVehicle) {
        console.log("Searching for vehicle ID:", selectedVehicle);
        query = query.eq("vehicle_id", selectedVehicle);
      } else if (searchMode === "client" && selectedClient) {
        console.log("Searching for client ID:", selectedClient);
        query = query.eq("user_id", selectedClient);
      } else {
        setError("Please select a vehicle or client to search");
        setLoading(false);
        return;
      }

      const { data: assessmentRequests, error: requestsError } =
        await query.order("report_generated_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching assessment requests:", requestsError);
        setError("Failed to fetch reports");
        return;
      }

      console.log("Found assessment requests:", assessmentRequests);
      console.log("Number of requests found:", assessmentRequests?.length || 0);

      if (!assessmentRequests || assessmentRequests.length === 0) {
        setReports([]);
        setLoading(false);
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
      const reportsWithDetails = assessmentRequests.map((request) => ({
        ...request,
        vehicle: vehiclesMap[request.vehicle_id] || null,
        customer: customersMap[request.user_id] || null,
        assessor: assessorsMap[request.assigned_assessor_id] || null,
      }));

      setReports(reportsWithDetails);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportUrl, vehicleInfo) => {
    try {
      const response = await fetch(reportUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assessment_report_${
        vehicleInfo?.registration_number || "unknown"
      }_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report");
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

  // Remove the early returns - we want to always show the search interface

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#333333ff] mb-4">
          Search Reports
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search By
            </label>
            <select
              value={searchMode}
              onChange={(e) => {
                setSearchMode(e.target.value);
                setSelectedVehicle("");
                setSelectedClient("");
                setReports([]);
              }}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="vehicle">Vehicle</option>
              <option value="client">Client</option>
            </select>
          </div>

          {/* Vehicle Dropdown */}
          {searchMode === "vehicle" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vehicle
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                disabled={loadingVehicles}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
              >
                <option value="">Choose a vehicle...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} -{" "}
                    {vehicle.registration_number}
                  </option>
                ))}
              </select>
              {loadingVehicles && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading vehicles...
                </p>
              )}
            </div>
          )}

          {/* Client Dropdown */}
          {searchMode === "client" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                disabled={loadingClients}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
              >
                <option value="">Choose a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} ({client.email})
                  </option>
                ))}
              </select>
              {loadingClients && (
                <p className="text-xs text-gray-500 mt-1">Loading clients...</p>
              )}
            </div>
          )}

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={searchReports}
              disabled={loading || (!selectedVehicle && !selectedClient)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Searching..." : "Search Reports"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => {
                setError("");
                setReports([]);
              }}
              className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Clear Error
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-600 text-sm">Searching for reports...</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {reports.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#333333ff]">
              Search Results ({reports.length} report
              {reports.length !== 1 ? "s" : ""})
            </h3>
            <button
              onClick={() => {
                setReports([]);
                setSelectedVehicle("");
                setSelectedClient("");
                setError("");
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Results
            </button>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                  {/* Report Info */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Vehicle Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Vehicle
                        </h4>
                        <p className="text-sm text-gray-600">
                          {report.vehicle?.year} {report.vehicle?.make}{" "}
                          {report.vehicle?.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.vehicle?.registration_number}
                        </p>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Customer
                        </h4>
                        <p className="text-sm text-gray-600">
                          {report.customer?.full_name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.customer?.email}
                        </p>
                      </div>

                      {/* Assessor Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Assessor
                        </h4>
                        <p className="text-sm text-gray-600">
                          {report.assessor?.full_name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.assessor?.email}
                        </p>
                      </div>
                    </div>

                    {/* Report Details */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Generated:</strong>{" "}
                          {formatDate(report.report_generated_at)}
                        </span>
                        <span>
                          <strong>Status:</strong>
                          <span
                            className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              report.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {report.status}
                          </span>
                        </span>
                        {report.vehicle_value && (
                          <span>
                            <strong>Value:</strong> R{" "}
                            {report.vehicle_value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                    <button
                      onClick={() =>
                        handleDownloadReport(report.report_url, report.vehicle)
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Download Report
                    </button>
                    <a
                      href={report.report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center"
                    >
                      View Online
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {reports.length === 0 && !loading && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Search for Reports
          </h3>
          <p className="text-gray-600 mb-4">
            Use the search interface above to find reports by vehicle or client.
          </p>
          <p className="text-sm text-gray-500">
            Select a vehicle or client from the dropdown and click "Search
            Reports" to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default ReportsView;
