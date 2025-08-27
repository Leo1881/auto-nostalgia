// Standardized loading states for consistent UX across the application

export const LOADING_TEXT = {
  // Authentication
  SIGNING_IN: "Signing In...",
  SIGNING_OUT: "Signing Out...",
  CREATING_ACCOUNT: "Creating Account...",
  PROCESSING: "Processing...",
  
  // Admin Actions
  LOADING_REQUESTS: "Loading requests...",
  LOADING_ASSESSORS: "Loading assessors...",
  LOADING_CLIENTS: "Loading clients...",
  
  // General
  LOADING: "Loading...",
  SAVING: "Saving...",
  UPDATING: "Updating...",
  DELETING: "Deleting...",
  SUBMITTING: "Submitting...",
};

export const LOADING_SPINNER_CLASSES = {
  // Small spinner (for buttons)
  SMALL: "inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent",
  
  // Medium spinner (for forms)
  MEDIUM: "inline-block animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent",
  
  // Large spinner (for page loads)
  LARGE: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white",
  
  // Extra large spinner (for admin panels)
  XLARGE: "inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-red",
};

export const BUTTON_STATES = {
  // Primary button states
  PRIMARY: {
    LOADING: "auth-button auth-button-primary mb-4 opacity-75 cursor-not-allowed",
    NORMAL: "auth-button auth-button-primary mb-4",
  },
  
  // Secondary button states
  SECONDARY: {
    LOADING: "auth-button auth-button-secondary opacity-75 cursor-not-allowed",
    NORMAL: "auth-button auth-button-secondary",
  },
  
  // Action button states
  ACTION: {
    LOADING: "px-6 py-3 bg-red-600 text-white rounded-lg opacity-75 cursor-not-allowed transition-all duration-200 shadow-md font-semibold",
    NORMAL: "px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold",
  },
};
