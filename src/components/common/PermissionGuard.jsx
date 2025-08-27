import { useAuth } from "../../hooks/useAuth";
import {
  hasPermission,
  canAccess,
  isAccountActive,
  isAccountSuspended,
  isAccountDisabled,
} from "../../constants/permissions";

function PermissionGuard({
  children,
  permission,
  feature,
  requiredRole,
  requireActiveAccount = true,
  fallback = null,
  showAccessDenied = true,
}) {
  const { profile, loading } = useAuth();

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary-red"></div>
        <span className="ml-2 text-gray-600">Checking permissions...</span>
      </div>
    );
  }

  // Check if user is authenticated
  if (!profile) {
    return showAccessDenied ? (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Access Denied
          </div>
          <p className="text-gray-600">Please log in to access this feature.</p>
        </div>
      </div>
    ) : (
      fallback
    );
  }

  // Check account status if required
  if (requireActiveAccount) {
    if (isAccountSuspended(profile.account_status)) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-yellow-600 text-lg font-semibold mb-2">
              Account Suspended
            </div>
            <p className="text-gray-600 mb-4">
              Your account has been temporarily suspended. Please contact
              support for assistance.
            </p>
            <div className="text-sm text-gray-500">
              Reason: {profile.suspension_reason || "No reason provided"}
            </div>
          </div>
        </div>
      );
    }

    if (isAccountDisabled(profile.account_status)) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Account Disabled
            </div>
            <p className="text-gray-600">
              Your account has been permanently disabled. Please contact support
              for assistance.
            </p>
          </div>
        </div>
      );
    }
  }

  // Check specific permission
  if (permission && !hasPermission(profile.role, permission)) {
    return showAccessDenied ? (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Insufficient Permissions
          </div>
          <p className="text-gray-600">
            You don't have permission to access this feature.
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Required permission: {permission}
          </div>
        </div>
      </div>
    ) : (
      fallback
    );
  }

  // Check feature access
  if (feature && !canAccess(profile.role, feature)) {
    return showAccessDenied ? (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Access Restricted
          </div>
          <p className="text-gray-600">
            This feature is not available for your account type.
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Current role: {profile.role}
          </div>
        </div>
      </div>
    ) : (
      fallback
    );
  }

  // Check role requirement
  if (requiredRole && profile.role !== requiredRole) {
    return showAccessDenied ? (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Role Required
          </div>
          <p className="text-gray-600">
            This feature requires a specific role.
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Required role: {requiredRole} | Your role: {profile.role}
          </div>
        </div>
      </div>
    ) : (
      fallback
    );
  }

  // All checks passed, render children
  return children;
}

export default PermissionGuard;
