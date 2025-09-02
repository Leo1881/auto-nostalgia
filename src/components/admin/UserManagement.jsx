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
        return "bg-green-100 text-green-800";
      case ACCOUNT_STATUS.SUSPENDED:
        return "bg-gray-100 text-gray-800";
      case ACCOUNT_STATUS.DISABLED:
        return "bg-gray-100 text-gray-800";
      case ACCOUNT_STATUS.PENDING_APPROVAL:
        return "bg-red-200 text-red-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return "bg-red-200 text-red-700";
      case ROLES.ASSESSOR:
        return "bg-green-100 text-green-800";
      case ROLES.CUSTOMER:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <p className="text-[#333333ff] mb-4">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className={LOADING_SPINNER_CLASSES.LARGE}></div>
              <p className="mt-4 text-sm text-[#333333ff]">
                {LOADING_TEXT.LOADING_REQUESTS}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-red-700">
                          {user.full_name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#333333ff]">
                          {user.full_name || "Unknown"}
                        </h3>
                        <p className="text-xs text-[#333333ff]">{user.email}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Joined: {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          user.account_status || ACCOUNT_STATUS.ACTIVE
                        )}`}
                      >
                        {user.account_status || ACCOUNT_STATUS.ACTIVE}
                      </span>

                      <div className="flex space-x-2">
                        {user.account_status === ACCOUNT_STATUS.SUSPENDED ? (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            disabled={actionLoading}
                            className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50 font-medium"
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
                            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 font-medium"
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
                            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {user.suspension_reason && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Suspension Reason:</span>{" "}
                        {user.suspension_reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suspend User Modal */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-[#333333ff] mb-4">
                Suspend User
              </h3>
              <p className="text-[#333333ff] mb-4">
                Are you sure you want to suspend {selectedUser.full_name}?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#333333ff] mb-2">
                  Reason for suspension
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
