import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaUserCog,
  FaFilePdf,
} from "react-icons/fa";
import axiosInstance from "../../../Api/axiosInstance";
import GetAdminId from "../../../Api/GetAdminId";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SalesReport() {
  // -------------------- STEP 1: ROLE SELECTION --------------------
  const adminId = GetAdminId();
  const [selectedRole, setSelectedRole] = useState("member");
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const reportRef = useRef(null);

  const roles = [
    { value: "", label: "Select Role..." },
    { value: "member", label: "Member" },
    { value: "receptionist", label: "Receptionist" },
    { value: "personal_trainer", label: "Personal Trainer" },
    { value: "general_trainer", label: "General Trainer" },
    { value: "manager", label: "Manager" },
    { value: "housekeeping", label: "Housekeeping" },
  ];

  // -------------------- STEP 2: FILTERS --------------------
  const [dateFrom, setDateFrom] = useState("2025-09-01");
  const [dateTo, setDateTo] = useState("2025-09-30");
  const [bookingStatus, setBookingStatus] = useState("All");
  const [trainer, setTrainer] = useState("All");

  // NOTE: Added "Completed" status based on the new API response
  const statuses = ["All", "Booked", "Confirmed", "Cancelled", "Completed"];
  const trainersList = ["All", "John Smith", "Mike Williams", "Unknown"];

  // -------------------- MOCK DATA --------------------
  const bookings = useMemo(
    () => [
      {
        username: "john_doe",
        trainer: "John Smith",
        type: "Strength Training",
        date: "2023-06-20",
        time: "10:00 - 11:00",
        price: 50,
        paymentStatus: "Paid",
        bookingStatus: "Booked",
      },
      {
        username: "mike_w",
        trainer: "Mike Williams",
        type: "Cardio & HIIT",
        date: "2023-06-22",
        time: "14:00 - 15:00",
        price: 60,
        paymentStatus: "Paid",
        bookingStatus: "Booked",
      },
      {
        username: "mike_w",
        trainer: "Mike Williams",
        date: "2025-09-18",
        time: "23:34 - 03:04",
        price: 70,
        paymentStatus: "Paid",
        bookingStatus: "Confirmed",
      },
      {
        username: "guest_user",
        trainer: "Unknown",
        date: "",
        time: "",
        price: 0,
        paymentStatus: "Paid",
        bookingStatus: "Booked",
      },
      {
        username: "john_doe",
        trainer: "John Smith",
        type: "Strength Training",
        date: "2023-06-21",
        time: "16:00 - 17:00",
        price: 50,
        paymentStatus: "Paid",
        bookingStatus: "Cancelled",
      },
      {
        username: "alice_123",
        trainer: "John Smith",
        date: "2023-06-25",
        time: "09:00 - 10:00",
        price: 50,
        paymentStatus: "Paid",
        bookingStatus: "Confirmed",
      },
      {
        username: "bob_456",
        trainer: "Mike Williams",
        date: "2023-06-26",
        time: "17:00 - 18:00",
        price: 60,
        paymentStatus: "Paid",
        bookingStatus: "Booked",
      },
    ],
    []
  );

  // ✅ DEFINE isInRange AT TOP LEVEL — OUTSIDE ALL HOOKS
  const isInRange = (d) => {
    if (!d) return false; // Handle empty dates
    const x = new Date(d).getTime();
    const a = new Date(dateFrom).getTime();
    const b = new Date(dateTo).getTime();
    return x >= a && x <= b;
  };

  // -------------------- DYNAMIC FILTERS BASED ON ROLE --------------------
  const isStaff = [
    "receptionist",
    "personal_trainer",
    "general_trainer",
    "manager",
    "housekeeping",
  ].includes(selectedRole);
  const isMember = selectedRole === "member";
  const isApiRole = ["member", "personal_trainer", "general_trainer", "receptionist"].includes(selectedRole);

  // Auto-set trainer for staff based on localStorage (simulated)
  const getMyTrainer = () => {
    const userMap = {
      john_doe: "John Smith",
      mike_w: "Mike Williams",
      guest_user: "Unknown",
    };
    const username = localStorage.getItem("username") || "guest_user";
    return userMap[username] || "Unknown";
  };

  // -------------------- API CALL FOR ALL ROLES --------------------
  useEffect(() => {
    // Check if the role requires an API call
    if (isApiRole) {
      fetchReport();
    }
  }, [isApiRole, selectedRole, dateFrom, dateTo]); // Rerun when role or dates change

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setApiData(null); // Reset data before fetching

    try {
      let url;
      if (selectedRole === 'receptionist') {
        // Special URL structure for receptionist
        url = `reports/reception/${adminId}`;
      } else {
        // Construct the URL dynamically based on the selected role
        const roleUrlMap = {
          member: `reports/members?adminId=${adminId}`,
          personal_trainer: `reports/personal-trainer?adminId=${adminId}`,
          general_trainer: `reports/general-trainer?adminId=${adminId}`,
        };
        url = roleUrlMap[selectedRole];
      }

      if (!url) {
        throw new Error("API endpoint not defined for the selected role.");
      }

      const response = await axiosInstance.get(url);

      if (response.data && response.data.success) {
        setApiData(response.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch report");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- FILTERED DATA --------------------
  const filtered = useMemo(() => {
    if (!selectedRole) return [];

    // If role uses API and data is available, use API data
    if (isApiRole && apiData) {
      // For receptionist, data is in apiData.receptionists
      if (selectedRole === 'receptionist') {
        return apiData.receptionists || [];
      }
      // For other roles, data is in apiData.data.transactions
      const sourceData = apiData.data?.transactions || [];
      return sourceData.filter((r) => {
        // NOTE: API data uses 'status' key, not 'bookingStatus'
        if (bookingStatus !== "All" && r.status !== bookingStatus) return false;
        if (trainer !== "All" && r.trainer !== trainer) return false;
        return true;
      });
    }

    // Otherwise, filter the mock data
    return bookings.filter((r) => {
      if (!isInRange(r.date)) return false;
      if (bookingStatus !== "All" && r.bookingStatus !== bookingStatus)
        return false;
      if (trainer !== "All" && r.trainer !== trainer) return false;

      if (isMember) {
        const loggedinUser = localStorage.getItem("username") || "guest_user";
        return r.username === loggedinUser;
      }

      if (isStaff && trainer === "My") {
        const myTrainer = getMyTrainer();
        return r.trainer === myTrainer;
      }

      return true;
    });
  }, [
    bookings,
    selectedRole,
    dateFrom,
    dateTo,
    bookingStatus,
    trainer,
    isMember,
    apiData,
    isApiRole,
  ]);

  // -------------------- KPIs --------------------
  const kpis = useMemo(() => {
    // If role uses API and data is available, use API stats
    if (isApiRole && apiData) {
      if (selectedRole === 'receptionist') {
        const summary = apiData.summary || {};
        const revenue = apiData.revenue || {};
        return {
          totalBookings: summary.present || 0,
          totalRevenue: revenue.total || 0,
          confirmed: summary.active || 0,
          cancelled: 0, // Not provided by API
          booked: summary.completed || 0,
          avgTicket: 0, // Not provided by API
        };
      }
      // For other API roles
      if (apiData.data?.stats) {
        return {
          totalBookings: parseInt(apiData.data.stats.totalBookings) || 0,
          totalRevenue: parseFloat(apiData.data.stats.totalRevenue) || 0,
          confirmed: parseInt(apiData.data.stats.confirmed) || 0,
          cancelled: parseInt(apiData.data.stats.cancelled) || 0,
          booked: parseInt(apiData.data.stats.booked) || 0,
          avgTicket: parseFloat(apiData.data.stats.avgTicket) || 0,
        };
      }
    }

    // Otherwise calculate from filtered data
    const totalBookings = filtered.length;
    const totalRevenue = filtered.reduce((sum, r) => sum + (r.price || 0), 0);
    const confirmed = filtered.filter(
      (b) => b.bookingStatus === "Confirmed"
    ).length;
    const cancelled = filtered.filter(
      (b) => b.bookingStatus === "Cancelled"
    ).length;
    const booked = filtered.filter((b) => b.bookingStatus === "Booked").length;
    const avgTicket = totalBookings
      ? Math.round(totalRevenue / totalBookings)
      : 0;

    return {
      totalBookings,
      totalRevenue,
      confirmed,
      cancelled,
      booked,
      avgTicket,
    };
  }, [filtered, isApiRole, apiData, selectedRole]);

  // -------------------- CHART DATA --------------------

  // Bookings by Day (Line Chart)
  const byDay = useMemo(() => {
    // If role uses API and data is available, use API data
    if (isApiRole && apiData) {
      if (selectedRole === 'receptionist') {
        // Map weeklyTrend to the expected format
        return (apiData.weeklyTrend || []).map(item => ({
            date: item.day,
            count: item.count
        })).sort((a,b) => a.sortOrder - b.sortOrder);
      }
      // For other API roles
      if (apiData.data?.bookingsByDay) {
        return apiData.data.bookingsByDay.map((item) => ({
          date: new Date(item.date).toLocaleDateString(),
          count: item.count,
        }));
      }
    }

    // Otherwise calculate from filtered data
    const map = new Map();
    filtered.forEach((r) => {
      if (!r.date) return;
      const prev = map.get(r.date) || { date: r.date, count: 0 };
      prev.count += 1;
      map.set(r.date, prev);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [filtered, isApiRole, apiData, selectedRole]);

  // Booking Status Distribution (Pie Chart)
  const byStatus = useMemo(() => {
    // If role uses API and data is available, use API data
    if (isApiRole && apiData) {
      if (selectedRole === 'receptionist') {
        const summary = apiData.summary || {};
        return [
            { name: 'Present', value: summary.present || 0 },
            { name: 'Active', value: summary.active || 0 },
            { name: 'Completed', value: summary.completed || 0 },
        ].filter(item => item.value > 0);
      }
      // For other API roles
      if (apiData.data?.bookingStatus) {
        return apiData.data.bookingStatus.map((item) => {
          // The key in the API response is 'bookingStatus'
          const statusName = item.bookingStatus ? item.bookingStatus : "Unknown";
          return {
            name: statusName.charAt(0).toUpperCase() + statusName.slice(1),
            value: item.count,
          };
        });
      }
    }

    // Otherwise calculate from filtered data
    const data = [
      { name: "Booked", value: kpis.booked },
      { name: "Confirmed", value: kpis.confirmed },
      { name: "Cancelled", value: kpis.cancelled },
    ].filter((item) => item.value > 0);
    return data;
  }, [kpis, isApiRole, apiData, selectedRole]);

  // Table: Aggregated by Date + Trainer
  const tableRows = useMemo(() => {
    // If role uses API and data is available, use API data
    if (isApiRole && apiData) {
      // For receptionist, data is in apiData.receptionists
      if (selectedRole === 'receptionist') {
        // Map receptionist data to the table format
        return (apiData.receptionists || []).map(item => ({
          date: '-', // Not provided
          trainer: item.name,
          username: '-',
          type: '-',
          time: '-',
          revenue: item.totalRevenue,
          status: `Check-ins: ${item.totalCheckins}`
        }));
      }
      // For other API roles
      if (apiData.data?.transactions) {
        // --- FIX IS HERE ---
        // The transactions array is directly in apiData.data
        // so we map over apiData.data.transactions
        return apiData.data.transactions.map((item) => ({
          date: new Date(item.date).toLocaleDateString(),
          trainer: item.trainer,
          username: item.username,
          type: item.type,
          time: item.time,
          revenue: 0, // API doesn't provide revenue in transactions
          status: item.status,
        }));
      }
    }

    // Otherwise calculate from filtered data
    const key = (r) => `${r.date}__${r.trainer}`;
    const map = new Map();
    filtered.forEach((r) => {
      const k = key(r);
      const prev = map.get(k) || {
        date: r.date,
        trainer: r.trainer,
        count: 0,
        revenue: 0,
      };
      prev.count += 1;
      prev.revenue += r.price || 0;
      map.set(k, prev);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [filtered, isApiRole, apiData, selectedRole]);

  // -------------------- EXPORT CSV --------------------
  const exportCSV = () => {
    if (!selectedRole) return alert("Please select a role first!");

    const header = [
      "Date",
      "Trainer",
      "Username",
      "Type",
      "Time",
      "Price",
      "Payment Status",
      "Booking Status",
    ];
    const rows = filtered.map((r) => [
      r.date,
      r.trainer,
      r.username,
      r.type || "-",
      r.time || "-",
      r.price || 0,
      r.paymentStatus || "-",
      r.bookingStatus || r.status || "-",
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_report_personal_training_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------- EXPORT PDF --------------------
  const exportPDF = async () => {
    if (!selectedRole) return alert("Please select a role first!");

    setPdfGenerating(true);

    try {
      const buttons = document.querySelectorAll(".btn");
      buttons.forEach((button) => {
        button.style.display = "none";
      });

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      buttons.forEach((button) => {
        button.style.display = "";
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`sales_report_personal_training_${dateFrom}_${dateTo}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  };

  // -------------------- RENDER STATE --------------------
  const canGenerate = selectedRole !== "";

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Sales Report</h2>
          <p className="text-muted mb-0">
            Generate personalized sales reports based on your role.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={exportCSV}
            disabled={!canGenerate}
          >
            <FaDownload className="me-2" /> Export CSV
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={exportPDF}
            disabled={!canGenerate || pdfGenerating}
          >
            <FaFilePdf className="me-2" />{" "}
            {pdfGenerating ? "Generating PDF..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* STEP 1: Role Selection Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <label className="form-label">
                <FaUserCog className="me-2" /> Select Your Role
              </label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {!selectedRole && (
              <div className="col-12">
                <div className="alert alert-warning">
                  <strong>Please select your role to proceed.</strong>
                  <br />
                  Members see only their bookings. Staff can view all or their
                  own.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STEP 2: Filters (Only show if role is selected) */}
      {selectedRole && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-6 col-md-3">
                <label className="form-label">
                  <FaCalendarAlt className="me-2" /> From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">
                  <FaCalendarAlt className="me-2" /> To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="form-control"
                />
              </div>

              {isStaff && (
                <>
                  <div className="col-6 col-md-2">
                    <label className="form-label">
                      <FaFilter className="me-2" /> Booking Status
                    </label>
                    <select
                      className="form-select"
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value)}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label">View</label>
                    <select
                      className="form-select"
                      value={trainer}
                      onChange={(e) => setTrainer(e.target.value)}
                    >
                      <option value="All">All Trainers</option>
                      <option value="My">My Bookings Only</option>
                      <option value="John Smith">John Smith</option>
                      <option value="Mike Williams">Mike Williams</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Generate Button (Only if Role Selected) */}
      {selectedRole && (
        <div className="mb-4 text-end">
          <button
            className="btn btn-primary"
            onClick={() =>
              isApiRole
                ? fetchReport()
                : alert(`Report generated for ${selectedRole}`)
            }
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      )}

      {/* Display Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* REPORT CONTENT */}
      <div ref={reportRef}>
        {selectedRole && !loading && !error && (
          <>
            {/* KPI Widgets */}
            <div className="row g-3 mb-4">
              <Widget title="Total Bookings" value={kpis.totalBookings} />
              <Widget
                title="Total Revenue"
                value={`₹ ${kpis.totalRevenue.toLocaleString("en-IN")}`}
              />
              <Widget
                title="Avg Ticket"
                value={`₹ ${kpis.avgTicket.toLocaleString("en-IN")}`}
              />
              <Widget title="Confirmed" value={kpis.confirmed} />
              <Widget title="Cancelled" value={kpis.cancelled} />
              <Widget title="Booked" value={kpis.booked} />
            </div>

            {/* Charts */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-lg-7">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0 fw-semibold">
                    Bookings by Day
                  </div>
                  <div className="card-body" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={byDay}
                        margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(v) => `${v} session(s)`} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#0d6efd"
                          strokeWidth={2}
                          dot={false}
                          name="Bookings"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-5">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0 fw-semibold">
                    Booking Status
                  </div>
                  <div className="card-body" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {byStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                ["#20c997", "#dc3545", "#ffc107", "#0d6efd"][
                                  index % 4
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 fw-semibold">
                Transactions
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Date</th>
                      <th>Trainer</th>
                      <th>Username</th>
                      <th>Type</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          No transactions found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      tableRows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.date}</td>
                          <td>{r.trainer}</td>
                          <td>{r.username}</td>
                          <td>{r.type || "-"}</td>
                          <td>{r.time || "-"}</td>
                          <td>
                            <span
                              className={`badge ${
                                r.status === "Confirmed" ||
                                r.status === "Completed" ||
                                r.status === "approved"
                                  ? "bg-success"
                                  : r.status === "Cancelled"
                                  ? "bg-danger"
                                  : "bg-primary"
                              }`}
                            >
                              {r.status || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Empty State Before Role Selection */}
      {!selectedRole && (
        <div className="text-center py-5">
          <div className="text-muted">
            <FaUserCog size={48} className="mb-3" />
            <h5>Select Your Role to Generate Report</h5>
            <p className="lead">
              Choose whether you're a Member or Staff member to see relevant
              training sales data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Widget({ title, value }) {
  return (
    <div className="col-6 col-lg-2">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="text-muted small">{title}</div>
          <div className="fs-5 fw-semibold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}