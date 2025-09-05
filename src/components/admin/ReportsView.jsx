import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

function ReportsView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // First, fetch all assessment requests that have reports
      const { data: assessmentRequests, error: requestsError } = await supabase
        .from("assessment_requests")
        .select("*")
        .not("report_url", "is", null)
        .order("report_generated_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching assessment requests:", requestsError);
        setError("Failed to fetch reports");
        return;
      }

      if (!assessmentRequests || assessmentRequests.length === 0) {
        setReports([]);
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
          assessmentRequests.map((req) => req.customer_id).filter(Boolean)
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
        customer: customersMap[request.customer_id] || null,
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
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
        <p className="text-red-600 mb-2">Error loading reports</p>
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={fetchReports}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
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
        <p className="text-gray-600 mb-2">No reports generated yet</p>
        <p className="text-sm text-gray-500">
          Reports will appear here once assessors complete assessments and
          generate them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[#333333ff]">
          All Generated Reports ({reports.length})
        </h3>
        <button
          onClick={fetchReports}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
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
                    <h4 className="font-medium text-gray-900 mb-1">Vehicle</h4>
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
                    <h4 className="font-medium text-gray-900 mb-1">Customer</h4>
                    <p className="text-sm text-gray-600">
                      {report.customer?.full_name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.customer?.email}
                    </p>
                  </div>

                  {/* Assessor Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Assessor</h4>
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
  );
}

export default ReportsView;
