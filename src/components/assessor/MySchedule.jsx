import React from "react";

function MySchedule() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-xl font-bold text-[#333333ff] mb-2">My Schedule</h1>
        <p className="text-sm text-[#333333ff]">
          View your scheduled assessments and manage your calendar.
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Assessment Schedule
          </h3>
          <p className="text-gray-600">
            This section will show your scheduled assessments and allow you to
            manage your availability.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MySchedule;
