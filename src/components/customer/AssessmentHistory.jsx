function AssessmentHistory() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
          Assessment History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all your past vehicle assessments and their results.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Assessment Records
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Browse through your complete assessment history and detailed
            reports.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AssessmentHistory;
