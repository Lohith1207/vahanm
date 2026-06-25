import { useEffect, useMemo, useState } from "react";
import { adminAPI } from "../../services/api";

const StatusBadge = ({ status }) => {
  const colors = {
    searching_driver: "bg-yellow-100 text-yellow-800",
    driver_assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
    online: "bg-green-100 text-green-800",
    on_ride: "bg-blue-100 text-blue-800",
    offline: "bg-gray-100 text-gray-600",
  };

  const labels = {
    searching_driver: "Searching",
    driver_assigned: "Assigned",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    online: "Online",
    on_ride: "On Ride",
    offline: "Offline",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}
    >
      {labels[status] || status || "Unknown"}
    </span>
  );
};

export const LiveMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    active_rides: [],
    completed_rides: [],
    cancelled_rides: [],
    stats: {},
  });
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setError(null);
        const response = await adminAPI.getLiveMonitorData();

        if (cancelled) return;
        setData(response.data);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.detail || "Failed to load live data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const intervalId = setInterval(load, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const stats = data.stats || {};

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // Animated stat card component with hover effects only
  const AnimatedStatCard = ({ label, value, color, sublabel, gradient = false, gradientColors = "" }) => {
    const baseClasses = gradient
      ? `bg-gradient-to-br ${gradientColors} text-white`
      : "bg-white";
    
    return (
      <div className={`${baseClasses} rounded-xl shadow-md p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
        <p className={`text-sm ${gradient ? "opacity-90" : "text-gray-500"}`}>{label}</p>
        <p className={`text-2xl font-bold ${gradient ? "" : color}`}>
          {label.includes('Revenue') || label.includes('Fare') 
            ? formatCurrency(value || 0)
            : (value || 0)
          }
        </p>
        {sublabel && (
          <p className={`text-xs mt-1 ${gradient ? "opacity-75" : "text-gray-400"}`}>{sublabel}</p>
        )}
      </div>
    );
  };

  const renderRidesTable = (rides, type) => {
    if (!rides || rides.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No {type} rides found
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dropoff</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              {type !== "cancelled" && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rides.map((ride) => (
              <tr key={ride.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <StatusBadge status={ride.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {ride.pickup_address}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {ride.dropoff_address}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="text-gray-900">{ride.customer?.name || "—"}</div>
                  <div className="text-gray-500 text-xs">{ride.customer?.phone || "—"}</div>
                </td>
                {type !== "cancelled" && (
                  <td className="px-4 py-3 text-sm">
                    {ride.driver ? (
                      <>
                        <div className="text-gray-900">{ride.driver.name || "—"}</div>
                        <div className="text-gray-500 text-xs">{ride.driver.phone || "—"}</div>
                      </>
                    ) : (
                      <span className="text-yellow-600">Searching...</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {ride.fare ? formatCurrency(ride.fare) : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatTime(ride.completed_at || ride.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AnimatedStatCard 
          label="Total Rides" 
          value={stats.total_rides} 
          color="text-gray-800" 
          sublabel="All time"
        />
        <AnimatedStatCard 
          label="Completed" 
          value={stats.completed_rides} 
          color="text-green-600" 
          sublabel="All time"
        />
        <AnimatedStatCard 
          label="In Progress" 
          value={stats.in_progress_rides} 
          color="text-blue-600" 
          sublabel="Right now"
        />
        <AnimatedStatCard 
          label="Searching" 
          value={stats.searching_rides} 
          color="text-yellow-600" 
          sublabel="Right now"
        />
        <AnimatedStatCard 
          label="Cancelled" 
          value={stats.cancelled_rides} 
          color="text-red-600" 
          sublabel="All time"
        />
        <AnimatedStatCard 
          label="Total Revenue" 
          value={stats.total_revenue} 
          gradient={true}
          gradientColors="from-purple-500 to-purple-700"
          sublabel="All time"
        />
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedStatCard 
          label="Today's Revenue" 
          value={stats.today_revenue} 
          gradient={true}
          gradientColors="from-green-500 to-green-700"
          sublabel={`${stats.today_rides || 0} rides completed today`}
        />
        <AnimatedStatCard 
          label="Average Fare" 
          value={stats.average_fare} 
          gradient={true}
          gradientColors="from-blue-500 to-blue-700"
          sublabel="Per completed ride"
        />
        <AnimatedStatCard 
          label="Active Drivers" 
          value={stats.online_drivers} 
          gradient={true}
          gradientColors="from-orange-500 to-orange-700"
          sublabel={`Out of ${stats.total_drivers || 0} total`}
        />
        <AnimatedStatCard 
          label="Total Customers" 
          value={stats.total_customers} 
          gradient={true}
          gradientColors="from-indigo-500 to-indigo-700"
          sublabel="Registered users"
        />
      </div>

      {/* Live Data Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("active")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "active"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Active ({data.active_rides?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "completed"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Recent Completed ({data.completed_rides?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === "cancelled"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Recent Cancelled ({data.cancelled_rides?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading live data...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              {activeTab === "active" && renderRidesTable(data.active_rides, "active")}
              {activeTab === "completed" && renderRidesTable(data.completed_rides, "completed")}
              {activeTab === "cancelled" && renderRidesTable(data.cancelled_rides, "cancelled")}
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${error ? "bg-red-500" : "bg-green-500"} animate-pulse`}
          ></div>
          <span className="text-sm text-gray-600">
            {error ? "Connection error" : "Live - Auto-refreshing every 5s"}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {stats.total_customers || 0} registered customers
        </div>
      </div>
    </div>
  );
};