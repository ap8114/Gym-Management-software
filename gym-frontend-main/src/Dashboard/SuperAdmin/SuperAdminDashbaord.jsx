import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import BaseUrl from "../../Api/BaseUrl";


export default function DashboardHomePage() {
  // State for API data, loading, and errors
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect to fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/dashboard/dashboard`);
        if (response.data && response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError("Failed to load dashboard data.");
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  // --- Conditional Rendering for Loading and Error States ---
  if (loading) {
    return <div>Loading dashboard...</div>; // Or a spinner component
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // --- Data Transformation ---
  // If data is not loaded yet, return null to prevent errors
  if (!dashboardData) {
    return null;
  }

  // ----------- KPIs (Mapped from API) -----------
  // NOTE: The API does not provide 'delta', so we are using placeholder values.
  const kpis = [
    { title: "Total Revenue", value: dashboardData.totalRevenue, delta: +12 },
    { title: "Monthly Revenue", value: dashboardData.monthlyRevenue, delta: +9 },
    { title: "New Admins", value: dashboardData.newAdmins, delta: +8 },
    { title: "Total Admins", value: dashboardData.totalAdmins, delta: +3 },
  ];

  // ----------- Revenue Chart (Mapped from API) -----------
  const revenueData = dashboardData.revenueVsTarget.days.map((day, index) => ({
    d: day,
    revenue: dashboardData.revenueVsTarget.revenue[index],
    target: dashboardData.revenueVsTarget.target[index],
  }));

  // ----------- Branch Leaderboard (Mapped from API) -----------
  const leaderboard = dashboardData.branchLeaderboard.map((branch) => ({
    branch: branch.branchName,
    revenue: branch.revenue,
    newMembers: branch.newMembers,
  }));

  // ----------- Alerts (Static, as not provided by API) -----------
  const alerts = [
    { type: "danger", text: "12 invoices overdue (₹87,990)" }, // Changed $ to ₹
    { type: "success", text: "Razorpay webhook verified" },
    { type: "warning", text: "Diwali Promo scheduled (All branches)" },
    { type: "info", text: "New QR batch printed for Pune" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Dashboard</h2>
        <div className="text-muted">Super Admin Overview</div>
      </div>

      {/* KPI ROW */}
      <div className="row g-3 mb-4">
        {kpis.map((k, i) => (
          <div className="col-6 col-md-4" key={i}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="text-muted small">{k.title}</div>
                <div className="fs-5 fw-semibold mt-1">
                  {k.title.includes("Revenue") ? fmtINR(k.value) : k.value}
                </div>
                <div
                  className={`small mt-1 d-inline-flex align-items-center ${
                    k.delta >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {k.delta >= 0 ? (
                    <FaArrowUp className="me-1" />
                  ) : (
                    <FaArrowDown className="me-1" />
                  )}
                  {Math.abs(k.delta)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Leaderboard */}
      <div className="row g-3 mb-4">
        {/* Chart */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">
              Revenue vs Target
            </div>
            <div className="card-body" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="d" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtINR(v)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0d6efd"
                    strokeWidth={2}
                    dot={false}
                    name="Actual Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#6c757d"
                    strokeWidth={2}
                    dot={false}
                    name="Target Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">
              Branch Leaderboard
            </div>
            <div className="table-responsive" style={{maxHeight: '340px', overflowY: 'auto'}}>
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light sticky-top">
                  <tr>
                    <th>Branch</th>
                    <th>Revenue</th>
                    <th>New</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((r, i) => (
                    <tr key={i}>
                      <td>{r.branch}</td>
                      <td>{fmtINR(r.revenue)}</td>
                      <td>{r.newMembers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">
              Alerts & Tasks
            </div>
            <div className="list-group list-group-flush">
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className="list-group-item d-flex align-items-center"
                >
                  <span
                    className={`badge rounded-pill me-3 ${badgeTone(a.type)}`}
                  >
                    {a.type.toUpperCase()}
                  </span>
                  {a.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- Helpers --------
function fmtINR(n) {
  // Handle null or undefined values from the API
  if (n === null || n === undefined) {
    return "₹ 0"; // Changed $ to ₹
  }
  return "₹ " + n.toLocaleString("en-IN"); // Changed $ to ₹
}

function badgeTone(type) {
  switch (type) {
    case "danger":
      return "bg-danger-subtle text-danger-emphasis";
    case "success":
      return "bg-success-subtle text-success-emphasis";
    case "warning":
      return "bg-warning-subtle text-warning-emphasis";
    default:
      return "bg-info-subtle text-info-emphasis";
  }
}