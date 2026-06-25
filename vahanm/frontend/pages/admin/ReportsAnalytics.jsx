import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { adminAPI } from "../../services/api";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  Users,
  Car,
  Clock,
  RefreshCw,
  AlertCircle,
  FileText,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState("7");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics data state
  const [kpi, setKpi] = useState({
    total_revenue: 0,
    total_rides: 0,
    active_users: 0,
    avg_wait_time: 0,
    revenue_change: 0,
    rides_change: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [rideTypeData, setRideTypeData] = useState([]);
  const [driverPerformanceData, setDriverPerformanceData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [summary, setSummary] = useState({
    completion_rate: 0,
    avg_distance: 0,
    avg_fare: 0,
  });

  // Chat Assistant state
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = parseInt(dateRange);
      const { data } = await adminAPI.getAnalyticsOverview(days);

      setKpi(data.kpi || {});
      setRevenueData(data.revenue_trend || []);
      setHourlyData(data.hourly_data || []);
      setRideTypeData(data.ride_type_data || []);
      setDriverPerformanceData(data.driver_performance || []);
      setUserGrowthData(data.user_growth_data || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Auto-fetch summary when analytics data loads or dateRange changes
  useEffect(() => {
    if (!loading) {
      fetchDailySummary();
    }
  }, [loading, dateRange]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages]);

  // Fetch daily summary
  const fetchDailySummary = async () => {
    if (summaryLoading) return;
    setSummaryLoading(true);
    try {
      const days = parseInt(dateRange);
      const { data } = await adminAPI.getAnalyticsSummary(days);
      setChatMessages([
        {
          id: Date.now(),
          type: "ai",
          content: data.summary,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setChatMessages([
        {
          id: Date.now(),
          type: "ai",
          content: "Welcome! I'm your analytics assistant. Ask me anything about your ride data.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handle question submission
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const question = chatInput.trim();
    setChatInput("");
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);

    try {
      const days = parseInt(dateRange);
      const { data } = await adminAPI.askAnalyticsAI(question, days);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: data.answer,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error asking question:", err);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "Sorry, I couldn't process your question. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [];

    // Header section
    csvRows.push("RIDE AGGREGATOR ANALYTICS REPORT");
    csvRows.push(`Period: Last ${dateRange} days`);
    csvRows.push(`Generated: ${new Date().toLocaleString()}`);
    csvRows.push("");

    // KPI Summary
    csvRows.push("=== KEY PERFORMANCE INDICATORS ===");
    csvRows.push(`Total Revenue,₹${kpi.total_revenue}`);
    csvRows.push(`Total Rides,${kpi.total_rides}`);
    csvRows.push(`Active Users,${kpi.active_users}`);
    csvRows.push(`Avg Ride Duration,${kpi.avg_wait_time} min`);
    csvRows.push(`Revenue Change,${kpi.revenue_change}%`);
    csvRows.push(`Rides Change,${kpi.rides_change}%`);
    csvRows.push("");

    // Summary Stats
    csvRows.push("=== SUMMARY STATISTICS ===");
    csvRows.push(`Completion Rate,${summary.completion_rate}%`);
    csvRows.push(`Avg Ride Distance,${summary.avg_distance} km`);
    csvRows.push(`Avg Ride Fare,₹${summary.avg_fare}`);
    csvRows.push("");

    // Revenue Trend
    csvRows.push("=== DAILY REVENUE TREND ===");
    csvRows.push("Date,Revenue,Rides");
    revenueData.forEach((item) => {
      csvRows.push(`${item.date},₹${item.revenue},${item.rides}`);
    });
    csvRows.push("");

    // Hourly Data
    csvRows.push("=== HOURLY RIDE DISTRIBUTION (Today) ===");
    csvRows.push("Hour,Rides");
    hourlyData.forEach((item) => {
      csvRows.push(`${item.hour},${item.rides}`);
    });
    csvRows.push("");

    // Ride Type Distribution
    csvRows.push("=== RIDE TYPE DISTRIBUTION ===");
    csvRows.push("Type,Percentage,Count");
    rideTypeData.forEach((item) => {
      csvRows.push(`${item.name},${item.value}%,${item.count}`);
    });
    csvRows.push("");

    // Driver Performance
    csvRows.push("=== DRIVER PERFORMANCE BY RATING ===");
    csvRows.push("Rating Category,Driver Count");
    driverPerformanceData.forEach((item) => {
      csvRows.push(`${item.name},${item.drivers}`);
    });
    csvRows.push("");

    // User Growth
    csvRows.push("=== USER GROWTH (Last 6 Months) ===");
    csvRows.push("Month,Customers,Drivers");
    userGrowthData.forEach((item) => {
      csvRows.push(`${item.month},${item.customers},${item.drivers}`);
    });

    // Create and download
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `analytics_report_${dateRange}days_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF (using browser print)
  const exportToPDF = () => {
    // Create a printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analytics Report - Last ${dateRange} Days</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .kpi-card { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
          .kpi-value { font-size: 24px; font-weight: bold; color: #1e40af; }
          .kpi-label { font-size: 12px; color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
          th { background: #f9fafb; font-weight: 600; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .summary-card { padding: 15px; border-radius: 8px; text-align: center; }
          .summary-green { background: #dcfce7; }
          .summary-blue { background: #dbeafe; }
          .summary-purple { background: #f3e8ff; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>📊 Ride Aggregator Analytics Report</h1>
        <p><strong>Period:</strong> Last ${dateRange} days | <strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <h2>Key Performance Indicators</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-value">₹${kpi.total_revenue?.toLocaleString() || 0}</div>
            <div class="kpi-label">Total Revenue</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${kpi.total_rides?.toLocaleString() || 0}</div>
            <div class="kpi-label">Total Rides</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${kpi.active_users?.toLocaleString() || 0}</div>
            <div class="kpi-label">Active Users</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${kpi.avg_wait_time || 0} min</div>
            <div class="kpi-label">Avg Duration</div>
          </div>
        </div>
        
        <h2>Summary Statistics</h2>
        <div class="summary-grid">
          <div class="summary-card summary-green">
            <div class="kpi-value" style="color: #16a34a;">${summary.completion_rate || 0}%</div>
            <div class="kpi-label">Completion Rate</div>
          </div>
          <div class="summary-card summary-blue">
            <div class="kpi-value" style="color: #2563eb;">${summary.avg_distance || 0} km</div>
            <div class="kpi-label">Avg Distance</div>
          </div>
          <div class="summary-card summary-purple">
            <div class="kpi-value" style="color: #7c3aed;">₹${summary.avg_fare || 0}</div>
            <div class="kpi-label">Avg Fare</div>
          </div>
        </div>
        
        <h2>Daily Revenue Trend</h2>
        <table>
          <tr><th>Date</th><th>Revenue</th><th>Rides</th></tr>
          ${revenueData.map((item) => `<tr><td>${item.date}</td><td>₹${item.revenue?.toLocaleString()}</td><td>${item.rides}</td></tr>`).join("")}
        </table>
        
        <h2>Ride Type Distribution</h2>
        <table>
          <tr><th>Type</th><th>Percentage</th><th>Count</th></tr>
          ${rideTypeData.map((item) => `<tr><td>${item.name}</td><td>${item.value}%</td><td>${item.count}</td></tr>`).join("")}
        </table>
        
        <h2>Driver Performance by Rating</h2>
        <table>
          <tr><th>Rating Category</th><th>Driver Count</th></tr>
          ${driverPerformanceData.map((item) => `<tr><td>${item.name}</td><td>${item.drivers}</td></tr>`).join("")}
        </table>
        
        <h2>User Growth (Last 6 Months)</h2>
        <table>
          <tr><th>Month</th><th>Customers</th><th>Drivers</th></tr>
          ${userGrowthData.map((item) => `<tr><td>${item.month}</td><td>${item.customers}</td><td>${item.drivers}</td></tr>`).join("")}
        </table>
        
        <div class="footer">
          <p>This report was generated automatically by the Ride Aggregator Admin Dashboard.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}k`;
    }
    return `₹${value}`;
  };

  return (
    <div className="relative flex gap-6">
      {/* Main Content */}
      <div className={`flex-1 space-y-6 transition-all duration-300 ${chatOpen ? 'mr-0' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={32} />
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText size={20} />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download size={20} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </p>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="p-8 text-center">
          <RefreshCw size={32} className="animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </Card>
      )}

      {!loading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-green-600" size={32} />
                {kpi.revenue_change >= 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(kpi.total_revenue)}
              </p>
              <p className="text-gray-600 mt-1">
                Total Revenue ({dateRange} days)
              </p>
              <p
                className={`text-sm font-semibold mt-2 ${kpi.revenue_change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {kpi.revenue_change >= 0 ? "+" : ""}
                {kpi.revenue_change.toFixed(1)}% vs previous period
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Car className="text-blue-600" size={32} />
                {kpi.rides_change >= 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {kpi.total_rides.toLocaleString()}
              </p>
              <p className="text-gray-600 mt-1">
                Total Rides ({dateRange} days)
              </p>
              <p
                className={`text-sm font-semibold mt-2 ${kpi.rides_change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {kpi.rides_change >= 0 ? "+" : ""}
                {kpi.rides_change.toFixed(1)}% vs previous period
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="text-purple-600" size={32} />
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {kpi.active_users.toLocaleString()}
              </p>
              <p className="text-gray-600 mt-1">Active Users</p>
              <p className="text-green-600 text-sm font-semibold mt-2">
                Active in period
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-orange-600" size={32} />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {kpi.avg_wait_time} min
              </p>
              <p className="text-gray-600 mt-1">Avg Ride Duration</p>
              <p className="text-orange-600 text-sm font-semibold mt-2">
                Average trip time
              </p>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-600" size={24} />
              Revenue Trend (Last {dateRange} Days)
            </h3>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₹${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No revenue data available for this period
              </div>
            )}
          </Card>

          {/* Hourly Rides */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-blue-600" size={24} />
              Rides by Hour (Today)
            </h3>
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis allowDecimals={false} domain={[0, (dataMax) => Math.max(dataMax, 6)]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rides" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                No hourly ride data available
              </div>
            )}
          </Card>

          {/* Split Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ride Type Distribution - Economy = standard car, Premium = higher-end, Bike/Auto = two-wheeler/auto */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Ride Type Distribution
              </h3>
              <p className="text-sm text-gray-500 mb-4">By vehicle type (Economy = standard car, Premium = higher-end, Shared/Luxury/Bike/Auto)</p>
              {rideTypeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={rideTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {rideTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {rideTypeData.map((type) => (
                      <div key={type.name} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: type.color }}
                        ></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {type.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {type.value}% ({type.count} rides)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  No ride type data available
                </div>
              )}
            </Card>

            {/* Driver Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Driver Performance
              </h3>
              {driverPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={driverPerformanceData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} drivers`, "Count"]}
                    />
                    <Bar dataKey="drivers" radius={[0, 8, 8, 0]} barSize={50}>
                      {driverPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  No driver performance data available
                </div>
              )}
            </Card>
          </div>

          {/* User Growth - new customer/driver signups per month */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Users className="text-purple-600" size={24} />
              User Growth (Last 6 Months)
            </h3>
            <p className="text-sm text-gray-500 mb-4">New signups per month (by account creation date)</p>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) =>
                      value > 1000 ? `${(value / 1000).toFixed(0)}k` : value
                    }
                  />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="drivers"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                No user growth data available
              </div>
            )}
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Completion Rate
              </h4>
              <p className="text-4xl font-bold text-green-700">
                {summary.completion_rate}%
              </p>
              <p className="text-green-600 text-sm mt-2">
                Rides completed vs total
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Avg Ride Distance
              </h4>
              <p className="text-4xl font-bold text-blue-700">
                {summary.avg_distance} km
              </p>
              <p className="text-blue-600 text-sm mt-2">
                Average trip distance
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Avg Ride Fare
              </h4>
              <p className="text-4xl font-bold text-purple-700">
                ₹{summary.avg_fare}
              </p>
              <p className="text-purple-600 text-sm mt-2">
                Average fare per ride
              </p>
            </Card>
          </div>
        </>
      )}
      </div>

      {/* AI Assistant Chat Panel - sticky on right so it stays visible while scrolling */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-96 flex-shrink-0 sticky top-4 self-start"
          >
            <Card className="h-[calc(100vh-2rem)] flex flex-col shadow-xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Analytics AI</h3>
                      <p className="text-white/80 text-xs">Your data insights assistant</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="text-white" size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
              >
                {summaryLoading && chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-4"
                      >
                        <Sparkles className="text-blue-600" size={32} />
                      </motion.div>
                      <p className="text-gray-500 text-sm">Analyzing your data...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.type === "ai" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                            <Bot className="text-white" size={18} />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                            message.type === "user"
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
                              : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className={`text-xs mt-1.5 ${
                            message.type === "user" ? "text-blue-100" : "text-gray-400"
                          }`}>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.type === "user" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-md">
                            <User className="text-white" size={18} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 justify-start"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                          <Bot className="text-white" size={18} />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
                          <div className="flex gap-1.5">
                            <motion.div
                              className="w-2 h-2 bg-blue-600 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-blue-600 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-blue-600 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your analytics..."
                    disabled={chatLoading}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  />
                  <motion.button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Try: "Why did rides decrease?" or "What are peak hours?"
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button (when closed) */}
      {!chatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all z-50"
        >
          <MessageSquare size={24} />
        </motion.button>
      )}
    </div>
  );
};
