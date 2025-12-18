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
  const [staffList, setStaffList] = useState([]);
  const roles = [
    { value: "", label: "Select Role..." },
    { value: "member", label: "Total Sales" },
    { value: "receptionist", label: "Receptionist" },
    { value: "personal_trainer", label: "Personal Trainer" },
    { value: "general_trainer", label: "General Trainer" },
    { value: "housekeeping", label: "Housekeeping" },
  ];

  // -------------------- STEP 2: FILTERS --------------------
  const [dateFrom, setDateFrom] = useState("2025-09-01");
  const [dateTo, setDateTo] = useState("2025-09-30");
  const [bookingStatus, setBookingStatus] = useState("All");
  const [trainer, setTrainer] = useState("All");

  const statuses = ["All", "Booked", "Confirmed", "Cancelled", "Completed"];

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

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axiosInstance.get(`/staff/admin/${adminId}`);
        if (res.data?.success) {
          setStaffList(res.data.staff);
        }
      } catch (error) {
        console.error("Error fetching staff", error);
      }
    };

    fetchStaff();
  }, [adminId]);

  // ✅ Helper: Get staff filtered by selected role
  const getFilteredStaff = () => {
    if (!selectedRole || selectedRole === "member") return [];
    // Map selectedRole (from dropdown value) to expected roleId
    const roleToIdMap = {
      personal_trainer: 5,
      general_trainer: 6,
      receptionist: 7,
      housekeeping: 8,
    };

    const expectedRoleId = roleToIdMap[selectedRole];
    if (expectedRoleId === undefined) return [];

    return staffList.filter(staff => staff.roleId === expectedRoleId);
  };

  // ✅ Helper: Get current user's trainer name (for "My" filter)
  const getMyTrainer = () => {
    // If user is staff (check localStorage for staffId)
    const storedStaffId = localStorage.getItem("staffId");
    if (storedStaffId) {
      const staffUser = staffList.find(s => s.staffId == storedStaffId);
      if (staffUser) return staffUser.fullName.trim();
    }

    // Fallback for members
    const userMap = {
      john_doe: "John Smith",
      mike_w: "Mike Williams",
      guest_user: "Unknown",
    };
    const username = localStorage.getItem("username") || "guest_user";
    return userMap[username] || "Unknown";
  };
  const isInRange = (d) => {
    if (!d) return false;
    const x = new Date(d).getTime();
    const a = new Date(dateFrom).getTime();
    const b = new Date(dateTo).getTime();
    return x >= a && x <= b;
  };

  const isStaff = [
    "receptionist",
    "personal_trainer",
    "general_trainer",
    "housekeeping",
  ].includes(selectedRole);
  const isMember = selectedRole === "member";
  const isApiRole = ["member", "personal_trainer", "general_trainer", "receptionist"].includes(selectedRole);

  // -------------------- API CALL --------------------
  useEffect(() => {
    if (isApiRole) {
      fetchReport();
    }
  }, [isApiRole, selectedRole, dateFrom, dateTo]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setApiData(null);

    try {
      let url;
      if (selectedRole === 'receptionist') {
        url = `reports/reception/${adminId}`;
      } else {
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

    if (isApiRole && apiData) {
      if (selectedRole === 'receptionist') {
        return apiData.receptionists || [];
      }
      const sourceData = apiData.data?.transactions || [];
      return sourceData.filter((r) => {
        if (bookingStatus !== "All" && r.status !== bookingStatus) return false;
        if (trainer !== "All" && trainer !== "My" && r.trainer !== trainer) return false;
        if (trainer === "My") {
          const myTrainer = getMyTrainer();
          return r.trainer === myTrainer;
        }
        return true;
      });
    }

    return bookings.filter((r) => {
      if (!isInRange(r.date)) return false;
      if (bookingStatus !== "All" && r.bookingStatus !== bookingStatus) return false;

      if (isMember) {
        const loggedinUser = localStorage.getItem("username") || "guest_user";
        return r.username === loggedinUser;
      }

      if (isStaff) {
        if (trainer === "My") {
          const myTrainer = getMyTrainer();
          return r.trainer === myTrainer;
        } else if (trainer !== "All") {
          return r.trainer === trainer;
        }
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
    isStaff,
    apiData,
    isApiRole,
    staffList,
  ]);

  // -------------------- KPIs --------------------
  const kpis = useMemo(() => {
    if (isApiRole && apiData) {
      if (selectedRole === 'receptionist') {
        const summary = apiData.summary || {};
        const revenue = apiData.revenue || {};
        return {
          totalBookings: summary.present || 0,
          totalRevenue: revenue.total || 0,
          confirmed: summary.active || 0,
          cancelled: 0,
          booked: summary.completed || 0,
          avgTicket: 0,
        };
      }
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

    const totalBookings = filtered.length;
    const totalRevenue = filtered.reduce((sum, r) => sum + (r.price || 0), 0);
    const confirmed = filtered.filter((b) => b.bookingStatus === "Confirmed").length;
    const cancelled = filtered.filter((b) => b.bookingStatus === "Cancelled").length;
    const booked = filtered.filter((b) => b.bookingStatus === "Booked").length;
    const avgTicket = totalBookings ? Math.round(totalRevenue / totalBookings) : 0;

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
  const byDay = useMemo(() => {
    if (isApiRole && apiData) {
      if (selectedRole === 'receptionist') {
        return (apiData.weeklyTrend || []).map(item => ({
          date: item.day,
          count: item.count
        })).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
      if (apiData.data?.bookingsByDay) {
        return apiData.data.bookingsByDay.map((item) => ({
          date: new Date(item.date).toLocaleDateString(),
          count: item.count,
        }));
      }
    }

    const map = new Map();
    filtered.forEach((r) => {
      if (!r.date) return;
      const prev = map.get(r.date) || { date: r.date, count: 0 };
      prev.count += 1;
      map.set(r.date, prev);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered, isApiRole, apiData, selectedRole]);

  const byStatus = useMemo(() => {
    if (isApiRole && apiData) {
      if (selectedRole === 'receptionist') {
        const summary = apiData.summary || {};
        return [
          { name: 'Present', value: summary.present || 0 },
          { name: 'Active', value: summary.active || 0 },
          { name: 'Completed', value: summary.completed || 0 },
        ].filter(item => item.value > 0);
      }
      if (apiData.data?.bookingStatus) {
        return apiData.data.bookingStatus.map((item) => {
          const statusName = item.bookingStatus ? item.bookingStatus : "Unknown";
          return {
            name: statusName.charAt(0).toUpperCase() + statusName.slice(1),
            value: item.count,
          };
        });
      }
    }

    const data = [
      { name: "Booked", value: kpis.booked },
      { name: "Confirmed", value: kpis.confirmed },
      { name: "Cancelled", value: kpis.cancelled },
    ].filter((item) => item.value > 0);
    return data;
  }, [kpis, isApiRole, apiData, selectedRole]);

  const tableRows = useMemo(() => {
    if (isApiRole && apiData) {
      if (selectedRole === 'receptionist') {
        return (apiData.receptionists || []).map(item => ({
          date: '-',
          trainer: item.name,
          username: '-',
          type: '-',
          time: '-',
          revenue: item.totalRevenue,
          status: `Check-ins: ${item.totalCheckins}`
        }));
      }
      if (apiData.data?.transactions) {
        return apiData.data.transactions.map((item) => ({
          date: new Date(item.date).toLocaleDateString(),
          trainer: item.trainer,
          username: item.username,
          type: item.type,
          time: item.time,
          revenue: 0,
          status: item.status,
        }));
      }
    }

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
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
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
    a.download = `sales_report_${selectedRole}_${dateFrom}_${dateTo}.csv`;
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

      pdf.save(`sales_report_${selectedRole}_${dateFrom}_${dateTo}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const canGenerate = selectedRole !== "";
  const filteredStaff = getFilteredStaff();

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

      {/* Role Selection */}
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
                  Members see only their bookings. Staff can view all or their own.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
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
                      <option value="All">All</option>
                      {filteredStaff.map((staff) => (
                        <option key={staff.staffId} value={staff.fullName.trim()}>
                          {staff.fullName.trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {selectedRole && (
        <div className="mb-4 text-end">
          <button
            className="btn btn-primary"
            onClick={() => (isApiRole ? fetchReport() : alert(`Report generated for ${selectedRole}`))}
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* REPORT CONTENT */}
      <div ref={reportRef}>
        {selectedRole && !loading && !error && (
          <>
            {/* KPIs */}
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
                                ["#20c997", "#dc3545", "#ffc107", "#0d6efd"][index % 4]
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
                              className={`badge ${["Confirmed", "Completed", "approved", "Present", "Active"].includes(
                                r.status || r.bookingStatus
                              )
                                  ? "bg-success"
                                  : r.status === "Cancelled" || r.bookingStatus === "Cancelled"
                                    ? "bg-danger"
                                    : "bg-primary"
                                }`}
                            >
                              {r.status || r.bookingStatus || "N/A"}
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

      {!selectedRole && (
        <div className="text-center py-5">
          <div className="text-muted">
            <FaUserCog size={48} className="mb-3" />
            <h5>Select Your Role to Generate Report</h5>
            <p className="lead">
              Choose whether you're a Member or Staff member to see relevant training sales data.
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