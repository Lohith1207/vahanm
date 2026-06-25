import { useState, useEffect, useRef } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { adminAPI, ocrAPI } from "../../services/api";
import {
  Car,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Plus,
  Trash2,
  X,
  ScanText,
} from "lucide-react";

// Modal for adding a new driver
const AddDriverModal = ({ isOpen, onClose, onAdd, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Driver</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <Input
              required
              placeholder="+919999999999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              required
              type="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4 font-bold text-purple-600">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Add Driver"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export const DriverManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // OCR API function reference
  // ocrAPI is imported at the top


  // API state
  const [drivers, setDrivers] = useState([]);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isInitialMount = useRef(true);
  const searchDebounceRef = useRef(null);

  // ---------- Fetch drivers ----------
  const fetchDrivers = async (status, search) => {
    setLoading(true);
    setError(null);
    try {
      const statusParam =
        status === "all" ? undefined : status === "active" ? undefined : status;
      const { data } = await adminAPI.getDriversForVerification(statusParam);

      let list = data.drivers || [];

      // If filter is "active" show only verified drivers
      if (status === "active") {
        list = list.filter((d) => d.is_verified);
      }

      // Client-side search by name / phone / vehicle registration
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter((d) => {
          const nameMatch = (d.name || "").toLowerCase().includes(q);
          const phoneMatch = (d.phone || "").toLowerCase().includes(q);
          const vehicleMatch = (d.vehicles || []).some((v) =>
            (v.registration_number || "").toLowerCase().includes(q),
          );
          return nameMatch || phoneMatch || vehicleMatch;
        });
      }

      setDrivers(list);

      // Fetch aggregate counts for stat cards
      const [allRes, verifiedRes, pendingRes] = await Promise.all([
        adminAPI.getDriversForVerification(),
        adminAPI.getDriversForVerification("verified"),
        adminAPI.getDriversForVerification("pending"),
      ]);

      setTotalDrivers((allRes.data.drivers || []).length);
      setVerifiedCount((verifiedRes.data.drivers || []).length);
      setPendingCount((pendingRes.data.drivers || []).length);
      setActiveCount(
        (allRes.data.drivers || []).filter((d) => d.is_verified).length,
      );
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to fetch drivers. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDrivers(filterStatus, searchTerm);
  }, []);

  // Filter change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
    fetchDrivers(filterStatus, searchTerm);
  }, [filterStatus]);

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      if (!isInitialMount.current) {
        setCurrentPage(1);
        fetchDrivers(filterStatus, searchTerm);
      }
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm]);

  // ---------- Actions ----------
  const handleVerify = async (driverId) => {
    setActionLoading(driverId);
    try {
      await adminAPI.verifyDriver(driverId, true);
      await fetchDrivers(filterStatus, searchTerm);
    } catch (err) {
      console.error("Error verifying driver:", err);
      alert("Failed to verify driver.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (driverId) => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    setActionLoading(driverId);
    try {
      await adminAPI.verifyDriver(driverId, false, reason.trim() || "Rejected by administrator");
      await fetchDrivers(filterStatus, searchTerm);
    } catch (err) {
      console.error("Error rejecting driver:", err);
      alert("Failed to reject driver.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (driverId) => {
    if (!window.confirm("Are you sure you want to delete this driver? This action cannot be undone.")) return;
    setActionLoading(driverId);
    try {
      await adminAPI.deleteUser(driverId);
      await fetchDrivers(filterStatus, searchTerm);
    } catch (err) {
      console.error("Error deleting driver:", err);
      alert("Failed to delete driver.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (driverId) => {
    if (!window.confirm("Are you sure you want to revoke this driver's verification? They will return to Pending status.")) return;
    setActionLoading(driverId);
    try {
      // Revoke sets driver back to pending (is_verified=false, no rejection_reason)
      // Pass null (not empty string) to ensure backend treats it as pending
      await adminAPI.verifyDriver(driverId, false, null);
      await fetchDrivers(filterStatus, searchTerm);
    } catch (err) {
      console.error("Error revoking driver:", err);
      alert("Failed to revoke driver verification.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddDriver = async (formData) => {
    setIsAdding(true);
    try {
      await adminAPI.createUser({ ...formData, role: "driver" });
      setIsAddModalOpen(false);
      await fetchDrivers(filterStatus, searchTerm);
    } catch (err) {
      console.error("Error adding driver:", err);
      alert(err.response?.data?.detail || "Failed to add driver.");
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleSyncOCR = async (driverId) => {
    setActionLoading(driverId);
    try {
      await ocrAPI.syncOCRStatus(driverId);
      await fetchDrivers(filterStatus, searchTerm);
      alert("OCR status synced successfully!");
    } catch (err) {
      console.error("Error syncing OCR:", err);
      alert(err.message || "Failed to sync OCR status.");
    } finally {
      setActionLoading(null);
    }
  };

  // ---------- Pagination ----------
  const totalPages = Math.max(1, Math.ceil(drivers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDrivers = drivers.slice(startIndex, startIndex + itemsPerPage);

  // ---------- Helpers ----------
  const getVerificationLabel = (driver) => {
    // Check if rejection_reason exists AND is not empty/null
    if (driver.rejection_reason && driver.rejection_reason.trim()) return "rejected";
    if (driver.is_verified) return "verified";
    return "pending";
  };

  const getVerificationColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="text-green-600" size={20} />;
      case "pending":
        return <Clock className="text-yellow-600" size={20} />;
      case "rejected":
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  const vehicleLabel = (driver) => {
    if (!driver.vehicles || driver.vehicles.length === 0) return "No vehicle";
    const v = driver.vehicles[0];
    return `${v.type || "Vehicle"} - ${v.registration_number || "N/A"}`;
  };

  const docIssueCount = (driver) => {
    if (!driver.vehicles || driver.vehicles.length === 0) return 0;
    const docs = driver.vehicles[0]?.documents || {};
    return Object.values(docs).filter(
      (d) => !(d?.status === "verified" || d?.status === "approved"),
    ).length;
  };

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Car className="text-blue-600" size={32} />
            Driver Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage drivers and verification status
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Driver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchDrivers(filterStatus, searchTerm)}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{totalDrivers}</p>
            <p className="text-sm text-gray-600 mt-1">Total Drivers</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
            <p className="text-sm text-gray-600 mt-1">Verified</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-600">{activeCount}</p>
            <p className="text-sm text-gray-600 mt-1">Active</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Search by name, phone, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <div>
              <p className="font-semibold">Error loading drivers</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDrivers(filterStatus, searchTerm)}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Drivers Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <span className="ml-3 text-gray-600">Loading drivers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Driver
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Rating
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Rides
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Verification
                  </th>
                   <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    OCR Status
                  </th>
                   <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>

                </tr>
              </thead>
              <tbody>
                {paginatedDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500">
                      No drivers found.
                    </td>
                  </tr>
                ) : (
                  paginatedDrivers.map((driver) => {
                    const vLabel = getVerificationLabel(driver);
                    const issues = docIssueCount(driver);

                    return (
                      <tr
                        key={driver.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {(driver.name || "?")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {driver.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {driver.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900">
                            {vehicleLabel(driver)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold text-gray-900">
                              {driver.rating ? driver.rating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {driver.total_rides || 0}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getVerificationIcon(vLabel)}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVerificationColor(vLabel)}`}
                            >
                              {vLabel.charAt(0).toUpperCase() + vLabel.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                           <div className="flex flex-col gap-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded w-fit ${
                              driver.ocr_status === 'verified' ? 'bg-green-100 text-green-700' :
                              driver.ocr_status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {driver.ocr_status ? driver.ocr_status.toUpperCase() : "PENDING"}
                            </span>
                            {driver.ocr_confidence && (
                              <span className="text-xs text-gray-500">
                                Conf: {(driver.ocr_confidence * 100).toFixed(0)}%
                              </span>
                            )}
                           </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-purple-600">
                          <div className="flex items-center justify-end gap-2">
                            {actionLoading === driver.id ? (
                              <Loader2
                                className="animate-spin text-blue-600"
                                size={20}
                              />
                            ) : (
                              <>
                                {!driver.is_verified && vLabel !== "rejected" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVerify(driver.id)}
                                    title="Approve driver"
                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                  >
                                    <ShieldCheck size={16} className="mr-1" /> Approve
                                  </Button>
                                )}
                                {vLabel === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(driver.id)}
                                    title="Reject driver"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    <ShieldX size={16} className="mr-1" /> Reject
                                  </Button>
                                )}
                                {driver.is_verified && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(driver.id)}
                                    title="Revoke verification"
                                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                  >
                                    <ShieldX size={16} className="mr-1" /> Revoke
                                  </Button>
                                )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(driver.id)}
                                    title="Delete driver"
                                    className="text-gray-600 border-gray-300 hover:bg-gray-100"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSyncOCR(driver.id)}
                                    title="Sync OCR Status"
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    <ScanText size={16} />
                                  </Button>
                                </>
                              )}
                          </div>
                        </td>


                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
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
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
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

      <AddDriverModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDriver}
        loading={isAdding}
      />
    </div>
  );
};
