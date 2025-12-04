import React from "react";
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

export default function DashboardHomePage() {
  // ----------- UPDATED KPIs (4 Only) -----------
  const kpis = [
    { title: "Total Revenue", value: 3500000, delta: +12 },

    // NEW KPI → Monthly Revenue
    { title: "Monthly Revenue", value: 420000, delta: +9 },

    { title: "New Admins", value: 12, delta: +8 },

    // CHANGED: Total Branches → Total Admins
    { title: "Total Admins", value: 48, delta: +3 },
  ];

  // ----------- Revenue Chart -----------
  const revenueData = [
    { d: "01", revenue: 120000, target: 100000 },
    { d: "05", revenue: 160000, target: 120000 },
    { d: "10", revenue: 210000, target: 180000 },
    { d: "15", revenue: 190000, target: 200000 },
    { d: "20", revenue: 260000, target: 230000 },
    { d: "25", revenue: 300000, target: 260000 },
    { d: "30", revenue: 350000, target: 300000 },
  ];

  // ----------- Branch Leaderboard -----------
  const leaderboard = [
    { branch: "Andheri", revenue: 1550000, newMembers: 85 },
    { branch: "Bandra", revenue: 1320000, newMembers: 64 },
    { branch: "Thane", revenue: 980000, newMembers: 51 },
    { branch: "Pune", revenue: 760000, newMembers: 43 },
  ];

  // ----------- Alerts -----------
  const alerts = [
    { type: "danger", text: "12 invoices overdue (₹87,990)" },
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

      {/* KPI ROW (3 Cards Only Now) */}
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
                  className={`small mt-1 d-inline-flex align-items-center ${k.delta >= 0 ? "text-success" : "text-danger"
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
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#6c757d"
                    strokeWidth={2}
                    dot={false}
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
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
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
                  <span className={`badge rounded-pill me-3 ${badgeTone(a.type)}`}>
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
  return "₹ " + n.toLocaleString("en-IN");
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
