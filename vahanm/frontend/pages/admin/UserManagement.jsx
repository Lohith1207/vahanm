import { useState, useEffect, useRef } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { adminAPI } from "../../services/api";
import {
  Users,
  Search,
  Edit,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const filterRole = "customer"; // Only show customers; drivers have their own page
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state for adding new user
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "customer",
    password: "",
  });
  const [formError, setFormError] = useState("");

  // API state
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Use ref to track if initial load has happened
  const isInitialMount = useRef(true);
  const searchDebounceRef = useRef(null);

  const itemsPerPage = 10;

  // Fetch users from API
  const fetchUsers = async (page, role, search) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        skip: (page - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      // Always filter to customers only (drivers managed in DriverManagement)
      params.role = "customer";

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await adminAPI.getUsers(params);
      const data = response.data;

      // Transform API response to match component's expected format
      const transformedUsers = data.users.map((user) => ({
        id: user.id,
        name: user.name || "Unknown",
        phone: user.phone || "",
        role: user.role,
        status: user.is_active ? "active" : "inactive",
        isVerified: user.is_verified,
        joinDate: user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "N/A",
        totalRides: user.total_rides || 0,
        rating: user.rating,
        profilePicture: user.profile_picture,
      }));

      setUsers(transformedUsers);
      setTotalUsers(data.total);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to fetch users. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers(currentPage, filterRole, searchTerm);
  }, []);

  // Handle page change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchUsers(currentPage, filterRole, searchTerm);
  }, [currentPage]);

  // Debounce search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      if (!isInitialMount.current) {
        setCurrentPage(1);
        fetchUsers(1, filterRole, searchTerm);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (userId) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this user? This action cannot be undone.",
      )
    ) {
      setUpdating(true);
      try {
        await adminAPI.deleteUser(userId);
        fetchUsers(currentPage, filterRole, searchTerm); // Refresh the list
      } catch (err) {
        console.error("Error deleting user:", err);
        alert(
          err.response?.data?.detail ||
            "Failed to delete user. Please try again.",
        );
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleCreateUser = async () => {
    setFormError("");

    // Validation
    if (!newUserForm.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!newUserForm.phone.trim() || newUserForm.phone.length < 10) {
      setFormError("Valid phone number is required (min 10 digits)");
      return;
    }

    setUpdating(true);
    try {
      await adminAPI.createUser({
        name: newUserForm.name.trim(),
        phone: newUserForm.phone.trim(),
        email: newUserForm.email.trim() || null,
        role: newUserForm.role,
        password: newUserForm.password || null,
      });

      // Reset form and close modal
      setNewUserForm({
        name: "",
        phone: "",
        email: "",
        role: "customer",
        password: "",
      });
      setShowAddModal(false);

      // Refresh the list
      fetchUsers(currentPage, filterRole, searchTerm);
    } catch (err) {
      console.error("Error creating user:", err);
      setFormError(
        err.response?.data?.detail ||
          "Failed to create user. Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setUpdating(true);
    try {
      const isActive = newStatus === "active";
      await adminAPI.updateUserStatus(userId, isActive);
      fetchUsers(currentPage, filterRole, searchTerm); // Refresh the list
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      customer: "bg-blue-100 text-blue-700",
      driver: "bg-purple-100 text-purple-700",
      admin: "bg-yellow-100 text-yellow-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" size={32} />
            Customer Management
          </h1>
          <p className="text-gray-600 mt-1">Manage registered customers</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          Add User
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchUsers(currentPage, filterRole, searchTerm)}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
            <p className="text-sm text-gray-600">
              {totalUsers > 0
                ? `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalUsers)} of ${totalUsers}`
                : "No users found"}
            </p>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <div>
              <p className="font-semibold">Error loading users</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(currentPage, filterRole, searchTerm)}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Join Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Rides
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500">
                      No users found. Try adjusting your search or filters.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{user.phone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {user.joinDate}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {user.totalRides}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
              Previous
            </Button>
            <div className="flex gap-2">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-semibold ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={18} />
            </Button>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormError("");
          setNewUserForm({
            name: "",
            phone: "",
            email: "",
            role: "customer",
            password: "",
          });
        }}
        title="Add New User"
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}
          <Input
            label="Full Name *"
            placeholder="John Doe"
            value={newUserForm.name}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, name: e.target.value })
            }
          />
          <Input
            label="Phone *"
            type="tel"
            placeholder="+91 98765 43210"
            value={newUserForm.phone}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, phone: e.target.value })
            }
          />
          <Input
            label="Email (optional)"
            type="email"
            placeholder="john@example.com"
            value={newUserForm.email}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, email: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={newUserForm.role}
              onChange={(e) =>
                setNewUserForm({ ...newUserForm, role: e.target.value })
              }
            >
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Input
            label="Password (optional, defaults to last 6 digits of phone)"
            type="password"
            placeholder="••••••"
            value={newUserForm.password}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, password: e.target.value })
            }
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowAddModal(false);
                setFormError("");
                setNewUserForm({
                  name: "",
                  phone: "",
                  email: "",
                  role: "customer",
                  password: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreateUser}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <Input
              label="Full Name"
              defaultValue={selectedUser.name}
              disabled
            />
            <Input
              label="Phone"
              type="tel"
              defaultValue={selectedUser.phone}
              disabled
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <Input
                value={
                  selectedUser.role.charAt(0).toUpperCase() +
                  selectedUser.role.slice(1)
                }
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="userStatus"
                defaultValue={selectedUser.status}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={updating}
                onClick={() => {
                  const newStatus = document.getElementById("userStatus").value;
                  handleStatusChange(selectedUser.id, newStatus);
                }}
              >
                {updating ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
