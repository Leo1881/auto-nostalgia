// Role-Based Permissions System
// Defines what each user role can access and perform

export const ROLES = {
  ADMIN: "admin",
  ASSESSOR: "assessor",
  CUSTOMER: "customer",
};

export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DISABLED: "disabled",
  PENDING_APPROVAL: "pending_approval",
};

// Permission definitions for each role
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    // User Management
    canViewAllUsers: true,
    canEditUserRoles: true,
    canSuspendUsers: true,
    canDeleteUsers: true,
    canViewUserDetails: true,

    // Assessor Management
    canApproveAssessors: true,
    canRejectAssessors: true,
    canViewAssessorRequests: true,
    canManageAssessors: true,

    // System Management
    canAccessAdminPanel: true,
    canViewSystemStats: true,
    canManageSystemSettings: true,

    // Content Management
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canPublishContent: true,

    // Data Access
    canViewAllData: true,
    canExportData: true,
    canViewAnalytics: true,
  },

  [ROLES.ASSESSOR]: {
    // User Management
    canViewAllUsers: false,
    canEditUserRoles: false,
    canSuspendUsers: false,
    canDeleteUsers: false,
    canViewUserDetails: false,

    // Assessor Management
    canApproveAssessors: false,
    canRejectAssessors: false,
    canViewAssessorRequests: false,
    canManageAssessors: false,

    // System Management
    canAccessAdminPanel: false,
    canViewSystemStats: false,
    canManageSystemSettings: false,

    // Content Management
    canCreateContent: true,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
    canPublishContent: false,

    // Data Access
    canViewAllData: false,
    canExportData: false,
    canViewAnalytics: false,
    canViewAssignedData: true,
  },

  [ROLES.CUSTOMER]: {
    // User Management
    canViewAllUsers: false,
    canEditUserRoles: false,
    canSuspendUsers: false,
    canDeleteUsers: false,
    canViewUserDetails: false,

    // Assessor Management
    canApproveAssessors: false,
    canRejectAssessors: false,
    canViewAssessorRequests: false,
    canManageAssessors: false,

    // System Management
    canAccessAdminPanel: false,
    canViewSystemStats: false,
    canManageSystemSettings: false,

    // Content Management
    canCreateContent: false,
    canEditOwnContent: false,
    canDeleteOwnContent: false,
    canPublishContent: false,

    // Data Access
    canViewAllData: false,
    canExportData: false,
    canViewAnalytics: false,
    canViewOwnData: true,
  },
};

// Helper functions to check permissions
export const hasPermission = (userRole, permission) => {
  if (!userRole || !PERMISSIONS[userRole]) {
    return false;
  }
  return PERMISSIONS[userRole][permission] || false;
};

export const canAccess = (userRole, feature) => {
  const permissionMap = {
    "admin-panel": "canAccessAdminPanel",
    "user-management": "canViewAllUsers",
    "assessor-management": "canManageAssessors",
    "content-creation": "canCreateContent",
    "data-export": "canExportData",
    analytics: "canViewAnalytics",
  };

  const permission = permissionMap[feature];
  return permission ? hasPermission(userRole, permission) : false;
};

// Account status validation
export const isAccountActive = (accountStatus) => {
  return accountStatus === ACCOUNT_STATUS.ACTIVE;
};

export const isAccountSuspended = (accountStatus) => {
  return accountStatus === ACCOUNT_STATUS.SUSPENDED;
};

export const isAccountDisabled = (accountStatus) => {
  return accountStatus === ACCOUNT_STATUS.DISABLED;
};

export const isAccountPendingApproval = (accountStatus) => {
  return accountStatus === ACCOUNT_STATUS.PENDING_APPROVAL;
};

// Role hierarchy (for permission inheritance)
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3, // Highest level
  [ROLES.ASSESSOR]: 2, // Medium level
  [ROLES.CUSTOMER]: 1, // Basic level
};

export const hasRoleOrHigher = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};
