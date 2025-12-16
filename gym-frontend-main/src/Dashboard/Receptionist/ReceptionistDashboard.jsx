import React, { useState, useEffect } from "react";
import {
  RiUserLine,
  RiSearchLine,
  RiNotificationLine,
  RiAddLine,
} from "react-icons/ri";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../../Api/axiosInstance";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReceptionistDashboard = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [padLeft, setPadLeft] = useState(0); // px
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const branchId = userData.branchId || 1; // Default to 1 if not found
  const adminId = userData.adminId || 90; // Default to 90 if not found

  // Initialize dashboardData with proper structure
  const [dashboardData, setDashboardData] = useState({
    todayCheckins: 0,
    yesterdayCheckins: 0,
    checkinPercentage: 0,
    totalMembers: 0,
    newMembers: 0,
    weeklyTrend: [],
    attendanceData: {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [
        {
          label: "Attendance",
          data: [0, 0, 0, 0, 0, 0],
          borderColor: "#2f6a87",
          backgroundColor: "rgba(47, 106, 135, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3,
        },
      ],
    },
    revenueData: {
      labels: ["Razorpay", "Card", "Cash", "UPI"],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: [
            "rgba(47, 106, 135, 1)",
            "rgba(110, 178, 204, 1)",
            "rgba(251, 191, 114, 1)",
            "rgba(252, 141, 98, 1)",
          ],
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    },
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("en-US", options));
    };
    updateDateTime();
    const t = setInterval(updateDateTime, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // iPad mini fix: md breakpoint (≥768px) par left padding = sidebar width
    const handle = () => setPadLeft(window.innerWidth >= 768 ? 25 : 0); // 64px ~ sidebar width
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get branchId from localStorage
        let branchId = 1; // Default fallback
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.branchId) {
              branchId = user.branchId;
            }
          }
        } catch (err) {
          console.error("Error parsing user from localStorage:", err);
        }

        // Using axiosInstance to fetch data
        const response = await axiosInstance.get(
          `dashboard/recepitonishdsh?adminId=${adminId}`
        );

        console.log("API Response:", response.data);

        if (response.data && response.data.success) {
          const data = response.data.dashboard;

          // Process weekly trend data
          const weeklyTrendData = data.weeklyTrend || [];
          const attendanceData = Array(7).fill(0);
          const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

          // Sort by sortOrder and populate attendanceData
          if (weeklyTrendData.length > 0) {
            weeklyTrendData.forEach((item) => {
              const dayIndex = item.sortOrder - 1; // Adjust for 0-based array index
              if (dayIndex >= 0 && dayIndex < 7) {
                attendanceData[dayIndex] = item.count;
              }
            });
          }

          // Update dashboard data with API response
          setDashboardData((prevData) => ({
            ...prevData,
            todayCheckins: data.todayCheckinsCount || 0,
            yesterdayCheckins: data.yesterdayCheckinsCount || 0,
            checkinPercentage: data.checkinPercentage || 0,
            totalMembers: data.summary?.active || 0,
            newMembers: data.newMembers || 0,
            weeklyTrend: weeklyTrendData,
            attendanceData: {
              labels: weekDays,
              datasets: [
                {
                  ...prevData.attendanceData.datasets[0],
                  data: attendanceData,
                },
              ],
            },
            revenueData: {
              ...prevData.revenueData,
              datasets: [
                {
                  ...prevData.revenueData.datasets[0],
                  data: [
                    data.revenue?.razorpay || 0,
                    data.revenue?.card || 0,
                    data.revenue?.cash || 0,
                    data.revenue?.upi || 0,
                  ],
                },
              ],
            },
          }));
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        const errorMessage = err.response
          ? `Server responded with ${err.response.status}: ${
              err.response.data.message || err.response.statusText
            }`
          : err.message;
        setError(errorMessage);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const attendanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.9)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" },
      },
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { color: "#6b7280" },
      },
    },
  };

  const revenueData = dashboardData.revenueData;
  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#1f2937",
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.9)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light overflow-hidden">
      {/* Content (also shifted right on md+) */}
      <main style={{ paddingLeft: padLeft }}>
        <div className="container-fluid px-2 px-md-2 py-3 py-md-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 mb-md-4">
                <h2 className="fw-bold mb-1">Good Morning, Receptionist!</h2>
                <p className="text-muted mb-0">
                  Here's what's happening at your fitness center today.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="row g-3 mb-3 mb-md-4">
                <div className="col-12 col-md-6 col-lg-3 d-flex">
                  <div className="card border-0 shadow-sm h-100 w-100">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">
                          Today's Check-ins
                        </p>
                        <p
                          className="fw-bold mb-1"
                          style={{ fontSize: "1.75rem" }}
                        >
                          {dashboardData.todayCheckins}
                        </p>
                        <p className="text-success small mb-0">
                          {dashboardData.checkinPercentage > 0
                            ? `+${dashboardData.checkinPercentage}%`
                            : "Same as yesterday"}
                        </p>
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          backgroundColor: "rgba(110,178,204,0.2)",
                          width: "3rem",
                          height: "3rem",
                        }}
                      >
                        <RiUserLine
                          className="text-primary"
                          style={{ fontSize: "1.5rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3 d-flex">
                  <div className="card border-0 shadow-sm h-100 w-100">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">
                          Yesterday's Check-ins
                        </p>
                        <p
                          className="fw-bold mb-1"
                          style={{ fontSize: "1.75rem" }}
                        >
                          {dashboardData.yesterdayCheckins}
                        </p>
                        <p className="text-muted small mb-0">Total check-ins</p>
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          backgroundColor: "rgba(47,106,135,0.2)",
                          width: "3rem",
                          height: "3rem",
                        }}
                      >
                        <RiUserLine
                          className="text-primary"
                          style={{ fontSize: "1.5rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3 d-flex">
                  <div className="card border-0 shadow-sm h-100 w-100">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">Total Members</p>
                        <p
                          className="fw-bold mb-1"
                          style={{ fontSize: "1.75rem" }}
                        >
                          {dashboardData.totalMembers}
                        </p>
                        <p className="text-info small mb-0">Active members</p>
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          backgroundColor: "rgba(251,191,114,0.2)",
                          width: "3rem",
                          height: "3rem",
                        }}
                      >
                        <RiUserLine
                          className="text-primary"
                          style={{ fontSize: "1.5rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3 d-flex">
                  <div className="card border-0 shadow-sm h-100 w-100">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">Present Members</p>
                        <p
                          className="fw-bold mb-1"
                          style={{ fontSize: "1.75rem" }}
                        >
                          {dashboardData.weeklyTrend.length > 0 
                            ? dashboardData.weeklyTrend[dashboardData.weeklyTrend.length - 1].count 
                            : 0}
                        </p>
                        <p className="text-warning small mb-0">Today's attendance</p>
                      </div>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          backgroundColor: "rgba(252,141,98,0.2)",
                          width: "3rem",
                          height: "3rem",
                        }}
                      >
                        <RiUserLine
                          className="text-primary"
                          style={{ fontSize: "1.5rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="row g-3 mb-3 mb-md-4">
                <div className="col-12 col-lg-6 d-flex">
                  <div className="card border-0 shadow-sm w-100">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">Daily Attendance Trend</h5>
                      <div className="w-100" style={{ height: "300px" }}>
                        <Line
                          data={dashboardData.attendanceData}
                          options={attendanceOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-6 d-flex">
                  <div className="card border-0 shadow-sm w-100">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">
                        Revenue by Payment Method
                      </h5>
                      <div className="w-100" style={{ height: "300px" }}>
                        <Pie
                          data={dashboardData.revenueData}
                          options={revenueOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;