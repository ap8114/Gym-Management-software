import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import axiosInstance from "../../Api/axiosInstance"; // ✅ Adjust path if needed

const RequestedPlans = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  // 🔁 Fetch real data from /purchases
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axiosInstance.get("/purchases");
        if (response.data.success && Array.isArray(response.data.data)) {
          // Normalize data to match UI structure
          const normalized = response.data.data.map(item => ({
            id: item.id,
            admin: item.companyName, // UI shows this as "Admin"
            email: item.email,
            plan: item.selectedPlan,
            billing: item.billingDuration,
            date: new Date(item.purchaseDate).toLocaleDateString('en-GB'), // "2025-12-02" → "02/12/2025"
            status: item.status.charAt(0).toUpperCase() + item.status.slice(1) // "pending" → "Pending"
          }));
          setPurchases(normalized);
        } else {
          setPurchases([]);
        }
      } catch (error) {
        console.error("Failed to fetch purchases:", error);
        setPurchases([]);
        alert("Failed to load purchase requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  // ❌ TEMP: Local status update (replace with PUT /purchases/:id later)
  const updateStatus = (index, newStatus) => {
    const updated = [...purchases];
    updated[index].status = newStatus;
    setPurchases(updated);
    // TODO: Call PUT /purchases/:id with { status: newStatus.toLowerCase() }
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case "pending": return { bg: "#ffe9b3", color: "#8a5d00" };
      case "approved": return { bg: "#2ecc71", color: "white" };
      case "rejected": return { bg: "#ff6e6e", color: "white" };
      default: return { bg: "#f0f0f0", color: "#333" };
    }
  };

  const getPlanColor = (plan) => {
    return plan.toLowerCase().includes("gold") || plan.toLowerCase().includes("professional")
      ? { bg: "#ffd200", color: "#111" }
      : { bg: "#b6e6ef", color: "#083d44" };
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading purchase requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* HEADER */}
      <div className="container-fluid p-3 p-md-4">
        <div className="row align-items-center mb-4">
          <div className="col-12 col-md-8">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-dark d-flex align-items-center justify-content-center text-white" 
                   style={{ width: "40px", height: "40px", fontSize: "18px", fontWeight: "600" }}>
                📘
              </div>
              <h2 className="mb-0 fw-bold fs-4 fs-md-3">Requested Plans</h2>
            </div>
          </div>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="d-none d-lg-block">
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 px-3 border-0">Gym / Admin</th>
                    <th className="py-3 px-3 border-0">Email</th>
                    <th className="py-3 px-3 border-0">Plan</th>
                    <th className="py-3 px-3 border-0">Billing</th>
                    <th className="py-3 px-3 border-0">Requested On</th>
                    <th className="py-3 px-3 border-0">Status</th>
                    <th className="py-3 px-3 border-0 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">No purchase requests found</td>
                    </tr>
                  ) : (
                    purchases.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className="border-bottom"
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                        style={{ 
                          backgroundColor: hoverIndex === index ? "#f5faff" : "transparent",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <td className="py-3 px-3">
                          <div className="fw-semibold">{item.admin}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-muted small">{item.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span 
                            className="badge rounded-pill px-3 py-2"
                            style={{ 
                              backgroundColor: getPlanColor(item.plan).bg,
                              color: getPlanColor(item.plan).color,
                              fontSize: "13px",
                              fontWeight: "600"
                            }}
                          >
                            {item.plan}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-muted">{item.billing}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-muted small">{item.date}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span 
                            className="badge rounded-pill px-3 py-2"
                            style={{ 
                              backgroundColor: getStatusColor(item.status).bg,
                              color: getStatusColor(item.status).color,
                              fontSize: "13px",
                              fontWeight: "600"
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="d-flex gap-2 justify-content-center">
                            <button
                              className="btn btn-sm btn-success rounded-pill px-3 d-flex align-items-center gap-1"
                              style={{ 
                                fontSize: "12px",
                                transition: "all 0.3s ease",
                                transform: hoverIndex === index ? "translateY(-2px)" : "translateY(0)"
                              }}
                              onClick={() => updateStatus(index, "Approved")}
                              disabled={item.status.toLowerCase() !== "pending"}
                            >
                              <FaCheck size={12} /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger rounded-pill px-3 d-flex align-items-center gap-1"
                              style={{ 
                                fontSize: "12px",
                                transition: "all 0.3s ease",
                                transform: hoverIndex === index ? "translateY(-2px)" : "translateY(0)"
                              }}
                              onClick={() => updateStatus(index, "Rejected")}
                              disabled={item.status.toLowerCase() !== "pending"}
                            >
                              <FaTimes size={12} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TABLET VIEW */}
        <div className="d-none d-md-block d-lg-none">
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 px-2 border-0">Gym</th>
                    <th className="py-3 px-2 border-0">Plan</th>
                    <th className="py-3 px-2 border-0">Status</th>
                    <th className="py-3 px-2 border-0 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">No requests</td>
                    </tr>
                  ) : (
                    purchases.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className="border-bottom"
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                        style={{ 
                          backgroundColor: hoverIndex === index ? "#f5faff" : "transparent",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <td className="py-3 px-2">
                          <div className="fw-semibold">{item.admin}</div>
                          <div className="text-muted small">{item.email}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span 
                            className="badge rounded-pill px-2 py-1"
                            style={{ 
                              backgroundColor: getPlanColor(item.plan).bg,
                              color: getPlanColor(item.plan).color,
                              fontSize: "12px",
                              fontWeight: "600"
                            }}
                          >
                            {item.plan}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span 
                            className="badge rounded-pill px-2 py-1"
                            style={{ 
                              backgroundColor: getStatusColor(item.status).bg,
                              color: getStatusColor(item.status).color,
                              fontSize: "12px",
                              fontWeight: "600"
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="d-flex gap-1 justify-content-center flex-wrap">
                            <button
                              className="btn btn-sm btn-success rounded-pill px-2 py-1"
                              style={{ fontSize: "11px" }}
                              onClick={() => updateStatus(index, "Approved")}
                              disabled={item.status.toLowerCase() !== "pending"}
                            >
                              <FaCheck size={10} />
                            </button>
                            <button
                              className="btn btn-sm btn-danger rounded-pill px-2 py-1"
                              style={{ fontSize: "11px" }}
                              onClick={() => updateStatus(index, "Rejected")}
                              disabled={item.status.toLowerCase() !== "pending"}
                            >
                              <FaTimes size={10} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="d-lg-none">
          {purchases.length === 0 ? (
            <div className="text-center py-5 text-muted">No purchase requests found</div>
          ) : (
            purchases.map((item, index) => (
              <div key={item.id} className="card border-0 shadow-sm mb-3">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="mb-1 fw-bold">{item.admin}</h6>
                      <p className="text-muted small mb-0">{item.email}</p>
                    </div>
                    <button
                      className="btn btn-sm btn-light rounded-circle p-2"
                      onClick={() => toggleRowExpansion(index)}
                      style={{ border: "none" }}
                    >
                      {expandedRows.includes(index) ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Plan</small>
                      <span 
                        className="badge rounded-pill px-2 py-1 mt-1 d-inline-block"
                        style={{ 
                          backgroundColor: getPlanColor(item.plan).bg,
                          color: getPlanColor(item.plan).color,
                          fontSize: "12px",
                          fontWeight: "600"
                        }}
                      >
                        {item.plan}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Status</small>
                      <span 
                        className="badge rounded-pill px-2 py-1 mt-1 d-inline-block"
                        style={{ 
                          backgroundColor: getStatusColor(item.status).bg,
                          color: getStatusColor(item.status).color,
                          fontSize: "12px",
                          fontWeight: "600"
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {expandedRows.includes(index) && (
                    <div className="border-top pt-3">
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <small className="text-muted d-block">Billing</small>
                          <span className="fw-semibold">{item.billing}</span>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Requested On</small>
                          <span className="fw-semibold">{item.date}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-success rounded-pill flex-fill py-2 d-flex align-items-center justify-content-center gap-1"
                      style={{ fontSize: "13px" }}
                      onClick={() => updateStatus(index, "Approved")}
                      disabled={item.status.toLowerCase() !== "pending"}
                    >
                      <FaCheck size={12} /> Approve
                    </button>
                    <button
                      className="btn btn-danger rounded-pill flex-fill py-2 d-flex align-items-center justify-content-center gap-1"
                      style={{ fontSize: "13px" }}
                      onClick={() => updateStatus(index, "Rejected")}
                      disabled={item.status.toLowerCase() !== "pending"}
                    >
                      <FaTimes size={12} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestedPlans;