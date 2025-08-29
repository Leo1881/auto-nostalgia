import React from "react";

function AssessmentHistory() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-xl font-bold text-[#333333ff] mb-2">
          Assessment History
        </h1>
        <p className="text-sm text-[#333333ff]">
          View your completed assessments and submitted reports.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Completed Assessments
          </h3>
          <p className="text-gray-600">
            This section will show your completed assessments and allow you to
            view submitted reports.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AssessmentHistory;
