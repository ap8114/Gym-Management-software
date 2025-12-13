import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  Tab,
  Button,
  Card,
  Alert,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
} from "react-icons/fa";
import axiosInstance from "../../Api/axiosInstance";
import BaseUrl from "../../Api/BaseUrl";
import GetAdminId from "../../Api/GetAdminId";

const CreatePlan = () => {
  const adminId = GetAdminId();
  const [activeTab, setActiveTab] = useState("group");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState({ id: null, type: null });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [requestToProcess, setRequestToProcess] = useState(null);
  const [newPlan, setNewPlan] = useState({
    name: "",
    sessions: "",
    validity: "",
    price: "",
    type: "group",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiPlans, setApiPlans] = useState([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [renewalRequests, setRenewalRequests] = useState([]);
  const [activeRequestTab, setActiveRequestTab] = useState("booking");

  const customColor = "#6EB2CC";

  const [groupPlans, setGroupPlans] = useState([]);
  const [personalPlans, setPersonalPlans] = useState([]);

  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      return null;
    }
  };

  const user = getUserFromStorage();
  const memberId = user?.id || null;
  const branchId = user?.branchId || null;
  const name = user?.fullName || null;

  // Fetch plans and booking requests
  useEffect(() => {
    fetchPlansFromAPI();
    fetchBookingRequests();
    fetchRenewalRequests();
  }, []);

  const fetchPlansFromAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminId = localStorage.getItem("userId") || "4";
      const response = await axiosInstance.get(
        `${BaseUrl}MemberPlan?adminId=${adminId}`
      );
      if (response.data.success) {
        const formattedPlans = response.data.plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          sessions: plan.sessions,
          validity: plan.validityDays,
          price: `₹${plan.price.toLocaleString()}`,
          active: plan.active ?? true,
          type: plan.type.toLowerCase(),
        }));
        setApiPlans(formattedPlans);
        setPlansLoaded(true);
        setGroupPlans(formattedPlans.filter((p) => p.type === "group"));
        setPersonalPlans(formattedPlans.filter((p) => p.type === "personal"));
      } else {
        setError("Failed to fetch plans.");
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.response?.data?.message || "Failed to fetch plans.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const adminId = localStorage.getItem("userId") || "4";
      const response = await axiosInstance.get(
        `${BaseUrl}booking/requests?adminId=${adminId}`
      );
      if (response.data.success) {
        const formattedRequests = response.data.requests.map((request) => ({
          id: request.id,
          memberName: request.memberName,
          planName: request.className || "Personal Training",
          planType: request.className ? "group" : "personal",
          price: `₹${parseFloat(request.price).toLocaleString()}`,
          sessions: "N/A",
          validity: "N/A",
          sessionsUsed: "N/A",
          requestedAt: new Date(request.createdAt).toLocaleString(),
          status: request.status.toLowerCase(),
          upiId: request.upiId,
          classId: request.classId,
          memberId: request.memberId,
          branchId: request.branchId,
          requestType: "booking"
        }));
        setBookingRequests(formattedRequests);
      }
    } catch (err) {
      console.error("Error fetching booking requests:", err);
      setError(
        err.response?.data?.message || "Failed to fetch booking requests."
      );
    }
  };

  const fetchRenewalRequests = async () => {
    try {
      const adminId = localStorage.getItem("userId") || "4";
      const response = await axiosInstance.get(
        `${BaseUrl}members/renew?adminId=${adminId}`
      );
      
      if (response.data) {
        let renewals = [];
        
        if (response.data.success && Array.isArray(response.data.renewals)) {
          renewals = response.data.renewals;
        } else if (Array.isArray(response.data)) {
          renewals = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          renewals = response.data.data;
        }
        
        const formattedRenewals = renewals.map((renewal) => {
          const member = renewal.member || {};
          const currentPlan = renewal.currentPlan || {};
          const requestedPlan = renewal.requestedPlan || {};
          
          return {
            id: renewal.id,
            memberName: member.fullName || 'Unknown',
            memberEmail: member.email || 'N/A',
            memberPhone: member.phone || 'N/A',
            currentPlan: currentPlan.name || 'Unknown',
            currentPlanType: currentPlan.type ? currentPlan.type.toLowerCase() : 'unknown',
            requestedPlan: requestedPlan.name || 'Unknown',
            requestedPlanType: requestedPlan.type ? requestedPlan.type.toLowerCase() : 'unknown',
            price: requestedPlan.price ? `₹${parseFloat(requestedPlan.price).toLocaleString()}` : 'N/A',
            sessions: requestedPlan.sessions || 'N/A',
            validity: requestedPlan.validityDays || requestedPlan.validity || 'N/A',
            membershipFrom: renewal.membershipFrom || 'N/A',
            membershipTo: renewal.membershipTo || 'N/A',
            requestedAt: renewal.createdAt ? new Date(renewal.createdAt).toLocaleString() : 'N/A',
            status: renewal.status ? renewal.status.toLowerCase() : 'unknown',
            memberId: renewal.memberId || member.id || null,
            branchId: renewal.branchId || member.branchId || null,
            requestType: "renewal"
          };
        });
        
        setRenewalRequests(formattedRenewals);
      }
    } catch (err) {
      console.error("Error fetching renewal requests:", err);
    }
  };

  const fetchPlanById = async (planId) => {
    setViewLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `${BaseUrl}MemberPlan/${planId}`
      );
      if (response.data.success) {
        const plan = response.data.plan;
        const formattedPlan = {
          id: plan.id,
          name: plan.name,
          sessions: plan.sessions,
          validity: plan.validityDays,
          price: `₹${plan.price.toLocaleString()}`,
          active: plan.active ?? true,
          type: plan.type.toLowerCase(),
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
        setSelectedPlan(formattedPlan);
        setShowViewModal(true);
      } else {
        setError("Failed to fetch plan details.");
      }
    } catch (err) {
      console.error("Error fetching plan:", err);
      setError(err.response?.data?.message || "Failed to fetch plan.");
    } finally {
      setViewLoading(false);
    }
  };

  const getPlansByType = (type) => {
    const plans = type === "group" ? groupPlans : personalPlans;
    return plans;
  };

  const updatePlansByType = (type, updatedPlans) => {
    if (type === "group") setGroupPlans(updatedPlans);
    else setPersonalPlans(updatedPlans);
  };

  const handleCreatePlan = async () => {
    if (
      !newPlan.name ||
      !newPlan.sessions ||
      !newPlan.validity ||
      !newPlan.price
    ) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const adminId = localStorage.getItem("userId") || "4";
      const payload = {
        planName: newPlan.name,
        sessions: parseInt(newPlan.sessions),
        validity: parseInt(newPlan.validity),
        price: parseInt(newPlan.price),
        adminId: parseInt(adminId),
        type: newPlan.type.toUpperCase(),
      };
      const response = await axiosInstance.post(
        `${BaseUrl}MemberPlan`,
        payload
      );
      if (response.data.success) {
        const plan = {
          id: response.data.plan.id,
          name: response.data.plan.name,
          sessions: response.data.plan.sessions,
          validity: response.data.plan.validityDays,
          price: `₹${response.data.plan.price.toLocaleString()}`,
          active: true,
          type: response.data.plan.type.toLowerCase(),
        };
        const currentPlans =
          newPlan.type === "group" ? groupPlans : personalPlans;
        updatePlansByType(newPlan.type, [...currentPlans, plan]);
        setApiPlans([...apiPlans, plan]);
        setNewPlan({
          name: "",
          sessions: "",
          validity: "",
          price: "",
          type: activeTab === "personal" ? "personal" : "group",
        });
        setShowCreateModal(false);
        alert(
          `✅ ${
            newPlan.type === "group" ? "Group" : "Personal"
          } Plan Created: ${plan.name}`
        );
      } else {
        setError("Failed to create plan.");
      }
    } catch (err) {
      console.error("Error creating plan:", err);
      setError(err.response?.data?.message || "Failed to create plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan, planType) => {
    setSelectedPlan({ ...plan, type: planType });
    setNewPlan({
      name: plan.name,
      sessions: plan.sessions.toString(),
      validity: plan.validity.toString(),
      price: plan.price.replace("₹", "").replace(",", ""),
      type: planType,
    });
    setShowEditModal(true);
  };

  const handleUpdatePlan = async () => {
    if (
      !newPlan.name ||
      !newPlan.sessions ||
      !newPlan.validity ||
      !newPlan.price
    ) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const adminId = localStorage.getItem("userId") || "4";
      const payload = {
        planName: newPlan.name,
        sessions: parseInt(newPlan.sessions),
        validity: parseInt(newPlan.validity),
        price: parseInt(newPlan.price),
        adminId: parseInt(adminId),
        type: newPlan.type.toUpperCase(),
      };
      const response = await axiosInstance.put(
        `${BaseUrl}MemberPlan/${adminId}/${selectedPlan.id}`,
        payload
      );
      if (response.data.success) {
        const updatedPlan = {
          ...selectedPlan,
          id: response.data.plan.id,
          name: response.data.plan.name,
          sessions: response.data.plan.sessions,
          validity: response.data.plan.validityDays,
          price: `₹${response.data.plan.price.toLocaleString()}`,
          type: response.data.plan.type.toLowerCase(),
        };
        const currentPlans = getPlansByType(selectedPlan.type);
        updatePlansByType(
          selectedPlan.type,
          currentPlans.map((p) => (p.id === selectedPlan.id ? updatedPlan : p))
        );
        setApiPlans(
          apiPlans.map((p) => (p.id === selectedPlan.id ? updatedPlan : p))
        );
        setNewPlan({
          name: "",
          sessions: "",
          validity: "",
          price: "",
          type: "group",
        });
        setShowEditModal(false);
        setSelectedPlan(null);
        alert(`✅ Plan Updated: ${updatedPlan.name}`);
      } else {
        setError("Failed to update plan.");
      }
    } catch (err) {
      console.error("Error updating plan:", err);
      setError(err.response?.data?.message || "Failed to update plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = (planId, planType) => {
    setPlanToDelete({ id: planId, type: planType });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.delete(
        `${BaseUrl}MemberPlan/${planToDelete.id}`
      );
      if (response.data.success) {
        const { id, type } = planToDelete;
        const currentPlans = getPlansByType(type);
        updatePlansByType(
          type,
          currentPlans.filter((p) => p.id !== id)
        );
        setApiPlans(apiPlans.filter((p) => p.id !== id));
        setShowDeleteModal(false);
        alert("✅ Plan Deleted!");
      } else {
        setError("Failed to delete plan.");
      }
    } catch (err) {
      console.error("Error deleting plan:", err);
      setError(err.response?.data?.message || "Failed to delete plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlanToDelete({ id: null, type: null });
  };

  const handleTogglePlan = async (planId, planType) => {
    setLoading(true);
    setError(null);
    try {
      const currentPlans = getPlansByType(planType);
      const plan = currentPlans.find((p) => p.id === planId);
      if (!plan) {
        setError("Plan not found");
        return;
      }
      const response = await axiosInstance.patch(
        `${BaseUrl}MemberPlan/${planId}`,
        {
          active: !plan.active,
        }
      );
      if (response.data.success) {
        updatePlansByType(
          planType,
          currentPlans.map((p) =>
            p.id === planId ? { ...p, active: !p.active } : p
          )
        );
        setApiPlans(
          apiPlans.map((p) =>
            p.id === planId ? { ...p, active: !p.active } : p
          )
        );
        alert(`✅ Plan status updated!`);
      } else {
        setError("Failed to update plan status.");
      }
    } catch (err) {
      console.error("Error toggling plan:", err);
      setError(err.response?.data?.message || "Failed to update plan status.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (request) => {
    setRequestToProcess(request);
    setShowStatusModal(true);
  };

  const handleProcessStatus = async (status) => {
    if (!requestToProcess) return;
    try {
      let response;
      const isRenewal = requestToProcess.requestType === "renewal";
      
      const payload = {
        adminId: parseInt(adminId),
      };

      if (isRenewal) {
        const endpoint = status === "approved" 
          ? `${BaseUrl}members/renew/approve/${requestToProcess.id}`
          : `${BaseUrl}members/renew/reject/${requestToProcess.id}`;
          
        response = await axiosInstance.put(endpoint, payload);
        
        if (response.data.success) {
          setRenewalRequests(
            renewalRequests.map((req) =>
              req.id === requestToProcess.id ? { ...req, status } : req
            )
          );
        }
      } else {
        const endpoint = status === "approved"
          ? `${BaseUrl}booking/approve/${requestToProcess.id}`
          : `${BaseUrl}booking/reject/${requestToProcess.id}`;
          
        response = await axiosInstance.put(endpoint, payload);
        
        if (response.data.success) {
          setBookingRequests(
            bookingRequests.map((req) =>
              req.id === requestToProcess.id ? { ...req, status } : req
            )
          );
        }
      }

      if (response.data.success) {
        const msg =
          status === "approved"
            ? `✅ ${isRenewal ? "Renewal" : "Booking"} Approved! Member will be notified.`
            : `❌ ${isRenewal ? "Renewal" : "Booking"} Rejected. Member will be notified.`;
        alert(msg);
        setShowStatusModal(false);
        setRequestToProcess(null);
      } else {
        setError(`Failed to update ${isRenewal ? "renewal" : "booking"} status.`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError(
        err.response?.data?.message || `Failed to update ${requestToProcess.requestType === "renewal" ? "renewal" : "booking"} status.`
      );
    }
  };

  const handleToggleRequestStatus = async (requestId) => {
    const bookingRequest = bookingRequests.find((req) => req.id === requestId);
    const renewalRequest = renewalRequests.find((req) => req.id === requestId);
    
    const request = bookingRequest || renewalRequest;
    if (!request) return;
    
    const isRenewal = request.requestType === "renewal";
    
    if (request.status === "pending") {
      handleOpenStatusModal(request);
      return;
    }

    const newStatus = request.status === "approved" ? "rejected" : "approved";
    try {
      let response;
      const payload = {
        adminId: parseInt(adminId),
      };

      if (isRenewal) {
        const endpoint = newStatus === "approved"
          ? `${BaseUrl}members/renew/approve/${requestId}`
          : `${BaseUrl}members/renew/reject/${requestId}`;
          
        response = await axiosInstance.put(endpoint, payload);
        
        if (response.data.success) {
          setRenewalRequests(
            renewalRequests.map((req) =>
              req.id === requestId ? { ...req, status: newStatus } : req
            )
          );
        }
      } else {
        const endpoint = newStatus === "approved"
          ? `${BaseUrl}booking/approve/${requestId}`
          : `${BaseUrl}booking/reject/${requestId}`;
          
        response = await axiosInstance.put(endpoint, payload);
        
        if (response.data.success) {
          setBookingRequests(
            bookingRequests.map((req) =>
              req.id === requestId ? { ...req, status: newStatus } : req
            )
          );
        }
      }

      if (response.data.success) {
        const msg =
          newStatus === "approved"
            ? `✅ ${isRenewal ? "Renewal" : "Booking"} Approved!`
            : `❌ ${isRenewal ? "Renewal" : "Booking"} Rejected.`;
        alert(msg);
      } else {
        setError(`Failed to toggle ${isRenewal ? "renewal" : "booking"} status.`);
      }
    } catch (err) {
      console.error("Error toggling request:", err);
      setError(
        err.response?.data?.message || `Failed to update ${isRenewal ? "renewal" : "booking"} request.`
      );
    }
  };

  const pendingRequests = bookingRequests.filter((r) => r.status === "pending");
  const approvedRequests = bookingRequests.filter(
    (r) => r.status === "approved"
  );
  const rejectedRequests = bookingRequests.filter(
    (r) => r.status === "rejected"
  );

  const pendingRenewals = renewalRequests.filter((r) => r.status === "pending");
  const approvedRenewals = renewalRequests.filter(
    (r) => r.status === "approved"
  );
  const rejectedRenewals = renewalRequests.filter(
    (r) => r.status === "rejected"
  );

  const renderPlanCard = (plan, planType) => (
    <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex mb-3">
      <Card
        className="h-100 shadow-sm border-0 w-100"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        <div
          style={{
            height: "6px",
            backgroundColor: plan.active ? customColor : "#ccc",
            width: "100%",
          }}
        ></div>
        <Card.Body className="d-flex flex-column p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div
                className="badge mb-2 px-2 py-1"
                style={{
                  backgroundColor: customColor,
                  color: "white",
                  fontSize: "0.7rem",
                }}
              >
                {planType === "group" ? "GROUP" : "PERSONAL"}
              </div>
              <h5
                className="fw-bold mb-0"
                style={{
                  color: customColor,
                  fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                }}
              >
                {plan.name}
              </h5>
            </div>
            <div className="d-flex gap-1">
              <Button
                variant="link"
                size="sm"
                className="p-1 rounded-circle"
                style={{
                  color: "#6EB2CC",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                }}
                onClick={() => fetchPlanById(plan.id)}
              >
                <FaEye size={14} />
              </Button>
              <Button
                variant="link"
                size="sm"
                className="p-1 rounded-circle"
                style={{
                  color: "#6EB2CC",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                }}
                onClick={() => handleEditPlan(plan, planType)}
              >
                <FaEdit size={14} />
              </Button>
              <Button
                variant="link"
                size="sm"
                className="p-1 rounded-circle"
                style={{
                  color: "#dc3545",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                }}
                onClick={() => handleDeletePlan(plan.id, planType)}
              >
                <FaTrash size={14} />
              </Button>
            </div>
          </div>
          <ul className="list-unstyled mb-3 flex-grow-1">
            <li className="mb-2 d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                🎯
              </span>
              <strong style={{ fontSize: "0.9rem" }}>
                {plan.sessions} Sessions
              </strong>
            </li>
            <li className="mb-2 d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                📅
              </span>
              <strong style={{ fontSize: "0.9rem" }}>
                Validity: {plan.validity} Days
              </strong>
            </li>
            <li className="mb-2 d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                💰
              </span>
              <strong style={{ fontSize: "0.9rem" }}>
                Price: {plan.price}
              </strong>
            </li>
          </ul>
          <div className="d-flex gap-2 mt-auto">
            {plan.active ? (
              <Button
                size="sm"
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-medium"
                onClick={() => handleTogglePlan(plan.id, planType)}
                style={{
                  backgroundColor: customColor,
                  borderColor: customColor,
                  color: "white",
                  fontSize: "0.8rem",
                  padding: "0.3rem 0.5rem",
                }}
              >
                <FaToggleOn size={12} /> Active
              </Button>
            ) : (
              <Button
                size="sm"
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-medium"
                onClick={() => handleTogglePlan(plan.id, planType)}
                style={{
                  backgroundColor: "#6c757d",
                  borderColor: "#6c757d",
                  color: "white",
                  fontSize: "0.8rem",
                  padding: "0.3rem 0.5rem",
                }}
              >
                <FaToggleOff size={12} /> Inactive
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  const renderBookingRequestRow = (req, index) => (
    <tr key={req.id}>
      <td>{index + 1}</td>
      <td>
        <strong>{req.memberName}</strong>
      </td>
      <td>{req.planName}</td>
      <td>
        <span
          className="badge px-3 py-2"
          style={{
            backgroundColor: customColor,
            color: "white",
            borderRadius: "20px",
          }}
        >
          {req.planType}
        </span>
      </td>
      {/* <td className="d-none d-lg-table-cell">
        {req.sessions} total
      </td>
      <td className="d-none d-lg-table-cell">
        {req.validity} days
      </td> */}
      <td>{req.requestedAt}</td>
      <td>
        {req.status === "pending" && (
          <span
            className="badge bg-warning text-dark px-3 py-2"
            style={{ borderRadius: "20px" }}
          >
            Pending
          </span>
        )}
        {req.status === "approved" && (
          <span
            className="badge px-3 py-2"
            style={{
              backgroundColor: customColor,
              color: "white",
              borderRadius: "20px",
            }}
          >
            Approved
          </span>
        )}
        {req.status === "rejected" && (
          <span
            className="badge bg-danger px-3 py-2"
            style={{ borderRadius: "20px" }}
          >
            Rejected
          </span>
        )}
      </td>
      <td>
        <div className="d-flex gap-2 align-items-center">
          {req.status === "pending" ? (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleOpenStatusModal(req)}
              style={{
                backgroundColor: "#ffc107",
                borderColor: "#ffc107",
                color: "#212529",
              }}
            >
              <FaToggleOn size={14} /> Process
            </Button>
          ) : req.status === "approved" ? (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleToggleRequestStatus(req.id)}
              style={{
                backgroundColor: customColor,
                borderColor: customColor,
                color: "white",
              }}
            >
              <FaToggleOn size={14} /> Active
            </Button>
          ) : (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleToggleRequestStatus(req.id)}
              style={{
                backgroundColor: "#6c757d",
                borderColor: "#6c757d",
                color: "white",
              }}
            >
              <FaToggleOff size={14} /> Inactive
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  const renderRenewalRequestRow = (req, index) => (
    <tr key={req.id}>
      <td>{index + 1}</td>
      <td>
        <strong>{req.memberName}</strong>
        <div className="text-muted small">{req.memberEmail}</div>
      </td>
      <td>
        <div>{req.currentPlan}</div>
        <div className="text-muted small">Current Plan</div>
      </td>
      <td>
        <div>{req.requestedPlan}</div>
        <div className="text-muted small">Requested Plan</div>
      </td>
      <td>
        <span
          className="badge px-3 py-2"
          style={{
            backgroundColor: customColor,
            color: "white",
            borderRadius: "20px",
          }}
        >
          {req.requestedPlanType}
        </span>
      </td>
      {/* <td className="d-none d-lg-table-cell">
        {req.sessions} total
      </td>
      <td className="d-none d-lg-table-cell">
        {req.validity} days
      </td> */}
      <td>{req.requestedAt}</td>
      <td>
        {req.status === "pending" && (
          <span
            className="badge bg-warning text-dark px-3 py-2"
            style={{ borderRadius: "20px" }}
          >
            Pending
          </span>
        )}
        {req.status === "approved" && (
          <span
            className="badge px-3 py-2"
            style={{
              backgroundColor: customColor,
              color: "white",
              borderRadius: "20px",
            }}
          >
            Approved
          </span>
        )}
        {req.status === "rejected" && (
          <span
            className="badge bg-danger px-3 py-2"
            style={{ borderRadius: "20px" }}
          >
            Rejected
          </span>
        )}
      </td>
      <td>
        <div className="d-flex gap-2 align-items-center">
          {req.status === "pending" ? (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleOpenStatusModal(req)}
              style={{
                backgroundColor: "#ffc107",
                borderColor: "#ffc107",
                color: "#212529",
              }}
            >
              <FaToggleOn size={14} /> Process
            </Button>
          ) : req.status === "approved" ? (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleToggleRequestStatus(req.id)}
              style={{
                backgroundColor: customColor,
                borderColor: customColor,
                color: "white",
              }}
            >
              <FaToggleOn size={14} /> Active
            </Button>
          ) : (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleToggleRequestStatus(req.id)}
              style={{
                backgroundColor: "#6c757d",
                borderColor: "#6c757d",
                color: "white",
              }}
            >
              <FaToggleOff size={14} /> Inactive
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  const renderBookingRequestCard = (req, index) => (
    <Card
      key={req.id}
      className="mb-3 border shadow-sm"
      style={{ borderRadius: "10px" }}
    >
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0 fw-bold">{req.memberName}</h6>
          <span className="badge bg-secondary rounded-pill">
            {index + 1}
          </span>
        </div>
        <div className="mb-2">
          <span className="text-muted small">Plan: </span>
          {req.planName}
        </div>
        <div className="mb-2">
          <span className="text-muted small">Type: </span>
          <span
            className="badge px-2 py-1"
            style={{
              backgroundColor: customColor,
              color: "white",
              borderRadius: "20px",
            }}
          >
            {req.planType}
          </span>
        </div>
        <div className="row mb-2">
          <div className="col-6">
            <span className="text-muted small">
              Sessions:{" "}
            </span>
            {req.sessions}
          </div>
          <div className="col-6">
            <span className="text-muted small">
              Validity:{" "}
            </span>
            {req.validity} days
          </div>
        </div>
        <div className="mb-3">
          <span className="text-muted small">
            Requested:{" "}
          </span>
          {req.requestedAt}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {req.status === "pending" && (
              <span
                className="badge bg-warning text-dark px-3 py-2"
                style={{ borderRadius: "20px" }}
              >
                Pending
              </span>
            )}
            {req.status === "approved" && (
              <span
                className="badge px-3 py-2"
                style={{
                  backgroundColor: customColor,
                  color: "white",
                  borderRadius: "20px",
                }}
              >
                Approved
              </span>
            )}
            {req.status === "rejected" && (
              <span
                className="badge bg-danger px-3 py-2"
                style={{ borderRadius: "20px" }}
              >
                Rejected
              </span>
            )}
          </div>
          {req.status === "pending" ? (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleOpenStatusModal(req)}
              style={{
                backgroundColor: "#ffc107",
                borderColor: "#ffc107",
                color: "#212529",
              }}
            >
              <FaToggleOn size={14} /> Process
            </Button>
          ) : req.status === "approved" ? (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleToggleRequestStatus(req.id)}
              style={{
                backgroundColor: customColor,
                borderColor: customColor,
                color: "white",
              }}
            >
              <FaToggleOn size={14} /> Active
            </Button>
          ) : (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleToggleRequestStatus(req.id)}
              style={{
                backgroundColor: "#6c757d",
                borderColor: "#6c757d",
                color: "white",
              }}
            >
              <FaToggleOff size={14} /> Inactive
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const renderRenewalRequestCard = (req, index) => (
    <Card
      key={req.id}
      className="mb-3 border shadow-sm"
      style={{ borderRadius: "10px" }}
    >
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0 fw-bold">{req.memberName}</h6>
          <span className="badge bg-secondary rounded-pill">
            {index + 1}
          </span>
        </div>
        <div className="mb-2">
          <span className="text-muted small">Email: </span>
          {req.memberEmail}
        </div>
        <div className="mb-2">
          <span className="text-muted small">Current Plan: </span>
          {req.currentPlan}
        </div>
        <div className="mb-2">
          <span className="text-muted small">Requested Plan: </span>
          {req.requestedPlan}
        </div>
        <div className="mb-2">
          <span className="text-muted small">Type: </span>
          <span
            className="badge px-2 py-1"
            style={{
              backgroundColor: customColor,
              color: "white",
              borderRadius: "20px",
            }}
          >
            {req.requestedPlanType}
          </span>
        </div>
        <div className="row mb-2">
          <div className="col-6">
            <span className="text-muted small">
              Sessions:{" "}
            </span>
            {req.sessions}
          </div>
          <div className="col-6">
            <span className="text-muted small">
              Validity:{" "}
            </span>
            {req.validity} days
          </div>
        </div>
        <div className="mb-3">
          <span className="text-muted small">
            Requested:{" "}
          </span>
          {req.requestedAt}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {req.status === "pending" && (
              <span
                className="badge bg-warning text-dark px-3 py-2"
                style={{ borderRadius: "20px" }}
              >
                Pending
              </span>
            )}
            {req.status === "approved" && (
              <span
                className="badge px-3 py-2"
                style={{
                  backgroundColor: customColor,
                  color: "white",
                  borderRadius: "20px",
                }}
              >
                Approved
              </span>
            )}
            {req.status === "rejected" && (
              <span
                className="badge bg-danger px-3 py-2"
                style={{ borderRadius: "20px" }}
              >
                Rejected
              </span>
            )}
          </div>
          {req.status === "pending" ? (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleOpenStatusModal(req)}
              style={{
                backgroundColor: "#ffc107",
                borderColor: "#ffc107",
                color: "#212529",
              }}
            >
              <FaToggleOn size={14} /> Process
            </Button>
          ) : req.status === "approved" ? (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleToggleRequestStatus(req.id)}
              style={{
                backgroundColor: customColor,
                borderColor: customColor,
                color: "white",
              }}
            >
              <FaToggleOn size={14} /> Active
            </Button>
          ) : (
            <Button
              size="sm"
              className="d-flex align-items-center gap-1 fw-medium"
              onClick={() => handleToggleRequestStatus(req.id)}
              style={{
                backgroundColor: "#6c757d",
                borderColor: "#6c757d",
                color: "white",
              }}
            >
              <FaToggleOff size={14} /> Inactive
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  const bookingStats = [
    {
      label: "Pending Requests",
      count: pendingRequests.length,
      bg: "#fff3cd",
      color: "#856404",
    },
    {
      label: "Approved Bookings",
      count: approvedRequests.length,
      bg: "#d1ecf1",
      color: "#0c5460",
    },
    {
      label: "Rejected Requests",
      count: rejectedRequests.length,
      bg: "#f8d7da",
      color: "#721c24",
    },
  ];

  const renewalStats = [
    {
      label: "Pending Renewals",
      count: pendingRenewals.length,
      bg: "#fff3cd",
      color: "#856404",
    },
    {
      label: "Approved Renewals",
      count: approvedRenewals.length,
      bg: "#d1ecf1",
      color: "#0c5460",
    },
    {
      label: "Rejected Renewals",
      count: rejectedRenewals.length,
      bg: "#f8d7da",
      color: "#721c24",
    },
  ];

  return (
    <div className="bg-light min-vh-100">
      <Container fluid className="px-2 px-sm-3 px-md-5 py-3 py-md-4">
        <h1
          className="mb-3 mb-md-4 fw-bold text-dark"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}
        >
          Plan & Booking Management
        </h1>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4 p-3 bg-white rounded shadow-sm border">
          <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
            <Button
              variant={activeTab === "group" ? "primary" : "outline-primary"}
              onClick={() => setActiveTab("group")}
              className="px-3 px-md-4 py-2 fw-medium d-flex align-items-center justify-content-center"
              style={{
                backgroundColor:
                  activeTab === "group" ? customColor : "transparent",
                borderColor: customColor,
                color: activeTab === "group" ? "white" : customColor,
                width: "100%",
                maxWidth: "300px",
              }}
            >
              Group Class Plans
            </Button>
            <Button
              variant={activeTab === "personal" ? "primary" : "outline-primary"}
              onClick={() => setActiveTab("personal")}
              className="px-3 px-md-4 py-2 fw-medium d-flex align-items-center justify-content-center"
              style={{
                backgroundColor:
                  activeTab === "personal" ? customColor : "transparent",
                borderColor: customColor,
                color: activeTab === "personal" ? "white" : customColor,
                width: "100%",
                maxWidth: "300px",
              }}
            >
              Personal Training Plans
            </Button>
          </div>
          <Button
            onClick={() => {
              setNewPlan({
                name: "",
                sessions: "",
                validity: "",
                price: "",
                type: activeTab === "personal" ? "personal" : "group",
              });
              setShowCreateModal(true);
            }}
            className="px-3 px-md-4 py-2 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: customColor,
              borderColor: customColor,
              color: "white",
              width: "100%",
              maxWidth: "200px",
            }}
          >
            <FaPlus size={14} className="me-2" />
            Create Plan
          </Button>
        </div>

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Row>
            <Col md={12}>
              <Tab.Content>
                <Tab.Pane eventKey="group">
                  {loading && !plansLoaded ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                        style={{ color: customColor }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading plans...</p>
                    </div>
                  ) : groupPlans.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="display-4 mb-3">📋</div>
                      <p className="fs-5">No group plans found.</p>
                    </div>
                  ) : (
                    <Row className="g-2 g-md-3">
                      {getPlansByType("group").map((plan) =>
                        renderPlanCard(plan, "group")
                      )}
                    </Row>
                  )}
                </Tab.Pane>
                <Tab.Pane eventKey="personal">
                  {loading && !plansLoaded ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                        style={{ color: customColor }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading plans...</p>
                    </div>
                  ) : personalPlans.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="display-4 mb-3">📋</div>
                      <p className="fs-5">No personal plans found.</p>
                    </div>
                  ) : (
                    <Row className="g-2 g-md-3">
                      {getPlansByType("personal").map((plan) =>
                        renderPlanCard(plan, "personal")
                      )}
                    </Row>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>

        {/* Booking Requests Section */}
        <div
          className="mt-5 pt-4 border-top"
          style={{ borderColor: customColor }}
        >
          <h3
            className="fw-bold mb-4 text-dark"
            style={{ fontSize: "clamp(1.2rem, 3vw, 1.4rem)" }}
          >
            Member Requests
          </h3>
          
          {/* Request Type Tabs */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4 p-3 bg-white rounded shadow-sm border">
            <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
              <Button
                variant={activeRequestTab === "booking" ? "primary" : "outline-primary"}
                onClick={() => setActiveRequestTab("booking")}
                className="px-3 px-md-4 py-2 fw-medium d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor:
                    activeRequestTab === "booking" ? customColor : "transparent",
                  borderColor: customColor,
                  color: activeRequestTab === "booking" ? "white" : customColor,
                  width: "100%",
                  maxWidth: "300px",
                }}
              >
                Booking Requests
              </Button>
              <Button
                variant={activeRequestTab === "renewal" ? "primary" : "outline-primary"}
                onClick={() => setActiveRequestTab("renewal")}
                className="px-3 px-md-4 py-2 fw-medium d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor:
                    activeRequestTab === "renewal" ? customColor : "transparent",
                  borderColor: customColor,
                  color: activeRequestTab === "renewal" ? "white" : customColor,
                  width: "100%",
                  maxWidth: "300px",
                }}
              >
                Renewal Requests
              </Button>
            </div>
          </div>

          {/* Request Statistics */}
          <Row className="mb-4 g-3">
            {(activeRequestTab === "booking" ? bookingStats : renewalStats).map((item, i) => (
              <Col xs={12} sm={6} md={4} key={i}>
                <Card
                  className="text-center border-0 shadow-sm h-100"
                  style={{ backgroundColor: "#f8f9fa", borderRadius: "12px" }}
                >
                  <Card.Body className="py-3 py-md-4">
                    <div
                      className="d-flex justify-content-center align-items-center mb-2"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: item.bg,
                        margin: "0 auto",
                      }}
                    >
                      <span
                        className="fw-bold"
                        style={{ color: item.color, fontSize: "1.5rem" }}
                      >
                        {item.count}
                      </span>
                    </div>
                    <h5 className="fw-bold mb-1" style={{ color: customColor }}>
                      {item.label}
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Requests Table */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Header
              className="bg-light border-0 pb-3"
              style={{ borderBottom: `3px solid ${customColor}` }}
            >
              <h5 className="mb-0 text-dark" style={{ fontWeight: "600" }}>
                All {activeRequestTab === "booking" ? "Booking" : "Renewal"} Requests
              </h5>
              <small className="text-muted">
                Total: {activeRequestTab === "booking" ? bookingRequests.length : renewalRequests.length} requests
              </small>
            </Card.Header>
            <Card.Body className="p-0">
              {(activeRequestTab === "booking" ? bookingRequests.length === 0 : renewalRequests.length === 0) ? (
                <div className="text-center text-muted py-5">
                  <div className="display-4 mb-3">📭</div>
                  <p className="fs-5">No {activeRequestTab === "booking" ? "booking" : "renewal"} requests yet.</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive d-none d-md-block">
                    <Table hover responsive className="align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>#</th>
                          <th>Member</th>
                          {activeRequestTab === "renewal" && <th>Current Plan</th>}
                          <th>{activeRequestTab === "renewal" ? "Requested Plan" : "Plan"}</th>
                          <th>Type</th>
                          {/* <th className="d-none d-lg-table-cell">Sessions</th>
                          <th className="d-none d-lg-table-cell">Validity</th> */}
                          <th>Requested At</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeRequestTab === "booking" 
                          ? bookingRequests.map((req, index) => renderBookingRequestRow(req, index))
                          : renewalRequests.map((req, index) => renderRenewalRequestRow(req, index))
                        }
                      </tbody>
                    </Table>
                  </div>

                  {/* Mobile View */}
                  <div className="d-md-none p-3">
                    {activeRequestTab === "booking" 
                      ? bookingRequests.map((req, index) => renderBookingRequestCard(req, index))
                      : renewalRequests.map((req, index) => renderRenewalRequestCard(req, index))
                    }
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Modals */}
        {/* Status Modal */}
        <Modal
          show={showStatusModal}
          onHide={() => setShowStatusModal(false)}
          centered
          size="sm"
        >
          <Modal.Header
            className="py-2 px-3"
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: `2px solid ${customColor}`,
            }}
          >
            <Modal.Title
              style={{ color: "#333", fontWeight: "600", fontSize: "1.1rem" }}
            >
              Process {requestToProcess?.requestType === "renewal" ? "Renewal" : "Booking"} Request
            </Modal.Title>
            <Button
              variant="link"
              className="p-0 m-0"
              onClick={() => setShowStatusModal(false)}
              style={{ color: "#6c757d" }}
            >
              <span aria-hidden="true">&times;</span>
            </Button>
          </Modal.Header>
          <Modal.Body className="py-3 px-3">
            {requestToProcess && (
              <div>
                <p className="mb-2 fw-medium text-center">
                  Process {requestToProcess.requestType === "renewal" ? "renewal" : "booking"} request from:
                </p>
                <div className="text-center mb-3">
                  <strong>{requestToProcess.memberName}</strong>
                  {requestToProcess.requestType === "renewal" && (
                    <div className="text-muted small">
                      {requestToProcess.memberEmail}
                    </div>
                  )}
                  <div className="text-muted small">
                    {requestToProcess.requestType === "renewal" 
                      ? `${requestToProcess.currentPlan} → ${requestToProcess.requestedPlan}`
                      : requestToProcess.planName
                    }
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant="success"
                    size="sm"
                    className="px-3"
                    onClick={() => handleProcessStatus("approved")}
                    style={{
                      backgroundColor: "#28a745",
                      borderColor: "#28a745",
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="px-3"
                    onClick={() => handleProcessStatus("rejected")}
                    style={{
                      backgroundColor: "#dc3545",
                      borderColor: "#dc3545",
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>

        {/* Create Plan Modal */}
        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          centered
          size="lg"
          fullscreen="sm-down"
        >
          <Modal.Header
            closeButton
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: `2px solid ${customColor}`,
            }}
          >
            <Modal.Title style={{ color: "#333", fontWeight: "600" }}>
              Create New {newPlan.type === "group" ? "Group" : "Personal"} Plan
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Plan Type</Form.Label>
                <Form.Select
                  value={newPlan.type}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, type: e.target.value })
                  }
                  style={{ padding: "12px", fontSize: "1rem" }}
                >
                  <option value="personal">Personal Training Plan</option>
                  <option value="group">Group Class Plan</option>
                </Form.Select>
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Plan Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Premium Pack"
                      value={newPlan.name}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, name: e.target.value })
                      }
                      style={{ padding: "12px", fontSize: "1rem" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">
                      Number of Sessions
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 12"
                      value={newPlan.sessions}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, sessions: e.target.value })
                      }
                      style={{ padding: "12px", fontSize: "1rem" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">
                      Validity (Days)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 60"
                      value={newPlan.validity}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, validity: e.target.value })
                      }
                      style={{ padding: "12px", fontSize: "1rem" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 5999"
                      value={newPlan.price}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, price: e.target.value })
                      }
                      style={{ padding: "12px", fontSize: "1rem" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer
            style={{ borderTop: "1px solid #eee" }}
            className="flex-column flex-sm-row"
          >
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="w-100 w-sm-auto"
              style={{ backgroundColor: "#6c757d", borderColor: "#6c757d" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={loading}
              className="w-100 w-sm-auto mt-2 mt-sm-0"
              style={{ backgroundColor: customColor, borderColor: customColor }}
            >
              {loading ? "Creating..." : "Create Plan"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Plan Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
          size="lg"
          fullscreen="sm-down"
        >
          <Modal.Header
            closeButton
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: `2px solid ${customColor}`,
            }}
          >
            <Modal.Title>
              Edit {selectedPlan?.type === "group" ? "Group" : "Personal"} Plan
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Plan Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  style={{ padding: "12px", fontSize: "1rem" }}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Sessions</Form.Label>
                    <Form.Control
                      type="number"
                      value={newPlan.sessions}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, sessions: e.target.value })
                      }
                      style={{ padding: "12px", fontSize: "1rem" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">
                      Validity (Days)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={newPlan.validity}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, validity: e.target.value })
                      }
                      style={{ padding: "12px", fontSize: "1rem" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      value={newPlan.price}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, price: e.target.value })
                      }
                      style={{ padding: "12px", fontSize: "1rem" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer
            style={{ borderTop: "1px solid #eee" }}
            className="flex-column flex-sm-row"
          >
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              className="w-100 w-sm-auto"
              style={{ backgroundColor: "#6c757d", borderColor: "#6c757d" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePlan}
              disabled={loading}
              className="w-100 w-sm-auto mt-2 mt-sm-0"
              style={{
                backgroundColor: customColor,
                borderColor: customColor,
                color: "#fff",
              }}
            >
              {loading ? "Updating..." : "Update Plan"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* View Plan Modal */}
        <Modal
          show={showViewModal}
          onHide={() => setShowViewModal(false)}
          centered
          size="lg"
          fullscreen="sm-down"
        >
          <Modal.Header
            closeButton
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: `2px solid ${customColor}`,
            }}
          >
            <Modal.Title>View Plan Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            {viewLoading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  style={{ color: customColor }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Fetching plan details...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : selectedPlan ? (
              <div className="p-4 bg-light rounded">
                <h5 className="fw-bold mb-4">
                  {selectedPlan.name} (
                  {selectedPlan.type === "group" ? "Group" : "Personal"})
                </h5>
                <div className="row">
                  {[
                    {
                      label: "Sessions",
                      value: selectedPlan.sessions,
                      icon: "🎯",
                    },
                    {
                      label: "Validity",
                      value: `${selectedPlan.validity} days`,
                      icon: "📅",
                    },
                    { label: "Price", value: selectedPlan.price, icon: "💰" },
                    {
                      label: "Status",
                      value: selectedPlan.active ? "Active" : "Inactive",
                      icon: "⚡",
                    },
                    {
                      label: "Created At",
                      value: selectedPlan.createdAt
                        ? new Date(selectedPlan.createdAt).toLocaleString()
                        : "N/A",
                      icon: "🕒",
                    },
                    {
                      label: "Last Updated",
                      value: selectedPlan.updatedAt
                        ? new Date(selectedPlan.updatedAt).toLocaleString()
                        : "N/A",
                      icon: "🔄",
                    },
                  ].map((item, i) => (
                    <div className="col-md-6 mb-3" key={i}>
                      <div className="d-flex align-items-center">
                        <span
                          className="me-3"
                          style={{ color: customColor, fontSize: "1.2rem" }}
                        >
                          {item.icon}
                        </span>
                        <div>
                          <div className="text-muted small">{item.label}</div>
                          <div className="fw-bold">{item.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-5">No plan details available.</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowViewModal(false)}
              style={{ backgroundColor: "#6c757d", borderColor: "#6c757d" }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <p className="text-center fw-medium">
              Are you sure you want to delete this plan?
            </p>
            <p className="text-center text-muted small">
              This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer className="justify-content-center flex-column flex-sm-row">
            <Button
              variant="secondary"
              onClick={handleCancelDelete}
              className="w-100 w-sm-auto"
              style={{ backgroundColor: "#6c757d", borderColor: "#6c757d" }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="w-100 w-sm-auto mt-2 mt-sm-0"
              style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default CreatePlan;