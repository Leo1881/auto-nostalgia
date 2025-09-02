import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import PermissionGuard from "../common/PermissionGuard";
import {
  ROLES,
  ACCOUNT_STATUS,
  hasPermission,
} from "../../constants/permissions";
import {
  LOADING_TEXT,
  LOADING_SPINNER_CLASSES,
} from "../../constants/loadingStates";

function UserManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      setUsers(profiles || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId, reason) => {
    try {
      setActionLoading(true);
      setError(null);

      console.log("🔒 Attempting to suspend user:", userId);
      console.log("📝 Reason:", reason);
      console.log("👤 Current admin:", profile.id);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          account_status: ACCOUNT_STATUS.SUSPENDED,
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          suspended_by: profile.id,
        })
        .eq("id", userId)
        .select();

      console.log("📊 Supabase response:", { data, error });

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                account_status: ACCOUNT_STATUS.SUSPENDED,
                suspension_reason: reason,
              }
            : user
        )
      );

      setShowSuspendModal(false);
      setSelectedUser(null);
      setSuspendReason("");
    } catch (err) {
      console.error("Error suspending user:", err);
      setError("Failed to suspend user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      setActionLoading(true);
      setError(null);

      console.log("✅ Attempting to activate user:", userId);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          account_status: ACCOUNT_STATUS.ACTIVE,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null,
        })
        .eq("id", userId)
        .select();

      console.log("📊 Activate response:", { data, error });

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                account_status: ACCOUNT_STATUS.ACTIVE,
                suspension_reason: null,
              }
            : user
        )
      );
    } catch (err) {
      console.error("Error activating user:", err);
      setError("Failed to activate user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const { error } = await supabase
        .from("profiles")
        .update({
          account_status: ACCOUNT_STATUS.DISABLED,
          deleted_at: new Date().toISOString(),
          deleted_by: profile.id,
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, account_status: ACCOUNT_STATUS.DISABLED }
            : user
        )
      );
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ACCOUNT_STATUS.ACTIVE:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case ACCOUNT_STATUS.SUSPENDED:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200";
      case ACCOUNT_STATUS.DISABLED:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200";
      case ACCOUNT_STATUS.PENDING_APPROVAL:
        return "bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return "bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200";
      case ROLES.ASSESSOR:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case ROLES.CUSTOMER:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PermissionGuard permission="canViewAllUsers" requiredRole={ROLES.ADMIN}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className={LOADING_SPINNER_CLASSES.XLARGE}></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
              {LOADING_TEXT.LOADING_REQUESTS}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-red to-red-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {user.full_name?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.full_name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            user.account_status || ACCOUNT_STATUS.ACTIVE
                          )}`}
                        >
                          {user.account_status || ACCOUNT_STATUS.ACTIVE}
                        </span>
                        {user.suspension_reason && (
                          <div className="text-xs text-gray-500 mt-1">
                            Reason: {user.suspension_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user.account_status === ACCOUNT_STATUS.SUSPENDED ? (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              disabled={actionLoading}
                              className="text-green-600 hover:text-green-900 dark:hover:text-green-400 disabled:opacity-50"
                            >
                              Activate
                            </button>
                          ) : user.account_status === ACCOUNT_STATUS.ACTIVE ||
                            !user.account_status ? (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowSuspendModal(true);
                              }}
                              disabled={
                                actionLoading || user.role === ROLES.ADMIN
                              }
                              className="text-red-600 hover:text-red-900 dark:hover:text-red-400 disabled:opacity-50"
                            >
                              Suspend
                            </button>
                          ) : null}

                          {user.account_status !== ACCOUNT_STATUS.DISABLED && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={
                                actionLoading || user.role === ROLES.ADMIN
                              }
                              className="text-red-600 hover:text-red-900 dark:hover:text-red-400 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suspend User Modal */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Suspend User
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to suspend {selectedUser.full_name}?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for suspension
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  rows="3"
                  placeholder="Enter reason for suspension..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSelectedUser(null);
                    setSuspendReason("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleSuspendUser(selectedUser.id, suspendReason)
                  }
                  disabled={actionLoading || !suspendReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Suspending..." : "Suspend"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}

export default UserManagement;
