function RequestAssessment() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
        <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
          Request Assessment
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit a request to have your vehicle professionally assessed.
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Assessment Request Form
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This form will be implemented to collect vehicle details and
            assessment requirements.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RequestAssessment;
