import { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { adminAPI } from "../../services/api";
import {
  Shield,
  Search,
  AlertTriangle,
  User,
  MapPin,
  Clock,
  Phone,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SafetyIncidents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [expandedIncident, setExpandedIncident] = useState(null);
  const [resolutionReply, setResolutionReply] = useState(""); // State for admin reply

  // API state
  const [incidents, setIncidents] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    critical: 0,
    investigating: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch incidents from API
  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const severityParam =
        filterSeverity === "all" ? undefined : filterSeverity;
      const { data } = await adminAPI.getSafetyIncidents(severityParam);
      setIncidents(data.incidents || []);
      setCounts(
        data.counts || { total: 0, critical: 0, investigating: 0, resolved: 0 },
      );
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Failed to fetch safety incidents");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filterSeverity]);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      (incident.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (incident.location || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle status change
  const handleStatusChange = async (incidentId, newStatus) => {
    setActionLoading(incidentId);
    try {
      // Include reply if resolving
      const reply = newStatus === 'resolved' ? resolutionReply : null;
      await adminAPI.updateIncidentStatus(incidentId, newStatus, reply);
      
      setResolutionReply(""); // Reset reply
      await fetchIncidents();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update incident status");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete
  const handleDelete = async (incidentId) => {
    if (!window.confirm("Are you sure you want to delete this incident?"))
      return;
    setActionLoading(incidentId);
    try {
      await adminAPI.deleteIncident(incidentId);
      await fetchIncidents();
    } catch (err) {
      console.error("Error deleting incident:", err);
      alert("Failed to delete incident");
    } finally {
      setActionLoading(null);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-400";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-400";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-400";
      default:
        return "bg-gray-100 text-gray-700 border-gray-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "investigating":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-red-600" size={32} />
            Safety Incidents Log
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage safety-related incidents
          </p>
        </div>
        <Button onClick={fetchIncidents} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{counts.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Incidents</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{counts.critical}</p>
            <p className="text-sm text-gray-600 mt-1">Critical</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {counts.investigating}
            </p>
            <p className="text-sm text-gray-600 mt-1">Investigating</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {counts.resolved}
            </p>
            <p className="text-sm text-gray-600 mt-1">Resolved</p>
          </div>
        </Card>
      </div>

      {/* Error message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} />
            {error}
          </p>
        </Card>
      )}

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
                placeholder="Search by ID, type, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <Card className="p-8 text-center">
          <RefreshCw size={32} className="animate-spin mx-auto text-red-600" />
          <p className="mt-4 text-gray-600">Loading incidents...</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && filteredIncidents.length === 0 && (
        <Card className="p-8 text-center">
          <Shield size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">
            No incidents found
          </h3>
          <p className="text-gray-500 mt-2">
            {searchTerm
              ? "Try a different search term"
              : "No safety incidents have been reported yet"}
          </p>
        </Card>
      )}

      {/* Incidents List */}
      {!loading && filteredIncidents.length > 0 && (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <Card
              key={incident.id}
              className={`p-6 border-l-4 ${
                incident.severity === "critical"
                  ? "border-red-500"
                  : incident.severity === "high"
                    ? "border-orange-500"
                    : incident.severity === "medium"
                      ? "border-yellow-500"
                      : "border-blue-500"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <AlertTriangle
                      className={
                        incident.severity === "critical"
                          ? "text-red-600"
                          : incident.severity === "high"
                            ? "text-orange-600"
                            : "text-yellow-600"
                      }
                      size={24}
                    />
                    <span className="font-mono text-sm font-bold text-gray-700">
                      #{incident.id.slice(-8)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getSeverityColor(incident.severity)}`}
                    >
                      {(incident.severity || "medium").toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}
                    >
                      {(incident.status || "reported").charAt(0).toUpperCase() +
                        (incident.status || "reported").slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {incident.type}
                  </h3>
                  <p className="text-gray-700 mb-3">{incident.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">
                          {incident.location || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <div>
                        <p className="text-xs text-gray-500">Reported</p>
                        <p className="font-semibold text-gray-900">
                          {incident.created || "Unknown"}
                        </p>
                      </div>
                    </div>
                    {incident.ride_id && (
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <div>
                          <p className="text-xs text-gray-500">Ride ID</p>
                          <p className="font-semibold text-gray-900">
                            {incident.ride_id}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(incident.id)}
                    disabled={actionLoading === incident.id}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedIncident(
                        expandedIncident === incident.id ? null : incident.id,
                      )
                    }
                  >
                    {expandedIncident === incident.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {expandedIncident === incident.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t pt-4 space-y-4">
                      {incident.action_taken && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Action Taken:
                          </p>
                          <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                            {incident.action_taken}
                          </p>
                        </div>
                      )}

                      {incident.notes && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Investigation Notes:
                          </p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {incident.notes}
                          </p>
                        </div>
                      )}

                      {incident.status !== "resolved" && incident.status !== "closed" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Response to Customer
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="3"
                            placeholder="Type your reply here before resolving..."
                            value={resolutionReply}
                            onChange={(e) => setResolutionReply(e.target.value)}
                          ></textarea>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {incident.status !== "resolved" &&
                          incident.status !== "closed" && (
                            <>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    incident.id,
                                    "investigating",
                                  )
                                }
                                disabled={
                                  actionLoading === incident.id ||
                                  incident.status === "investigating"
                                }
                              >
                                Investigating
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(incident.id, "resolved")
                                }
                                disabled={actionLoading === incident.id || !resolutionReply.trim()}
                                title={!resolutionReply.trim() ? "Please enter a reply to resolve" : ""}
                              >
                                <CheckCircle size={16} />
                                Resolve & Reply
                              </Button>
                            </>
                          )}
                        {incident.status === "resolved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(incident.id, "closed")
                            }
                            disabled={actionLoading === incident.id}
                          >
                            Close Incident
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}
      {/* Safety Notice */}
      <Card className="p-6 bg-red-50 border-2 border-red-200">
        <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
          <AlertTriangle size={24} />
          Safety Protocol
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-red-600">•</span>
            <span>
              All critical incidents require immediate police notification
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600">•</span>
            <span>
              SOS alerts trigger automatic emergency contact to registered
              number
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600">•</span>
            <span>
              Investigation must be completed within 48 hours for high-severity
              incidents
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600">•</span>
            <span>
              All parties involved must be contacted and statements recorded
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
