import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Button, Card, Alert, Modal, Form, Table } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';
import axiosInstance from '../../Api/axiosInstance'; // Import your axios instance
import BaseUrl from '../../Api/BaseUrl'; // Import your base URL

const CreatePlan = () => {
  const [activeTab, setActiveTab] = useState('group');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState({ id: null, type: null });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [requestToProcess, setRequestToProcess] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [newPlan, setNewPlan] = useState({
    name: '',
    sessions: '',
    validity: '',
    price: '',
    type: 'group',
    branch: 'Downtown'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiPlans, setApiPlans] = useState([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);

  // Custom color for all blue elements
  const customColor = '#6EB2CC';

  // Available branches
  const branches = ['Downtown', 'North Branch', 'South Branch', 'East Branch'];

  // Plans (Admin-created only)
  const [groupPlans, setGroupPlans] = useState([]);
  const [personalPlans, setPersonalPlans] = useState([]);

  // Fetch plans from API on component mount
  useEffect(() => {
    fetchPlansFromAPI();
    fetchBookingRequests();
  }, []);

  // Function to fetch plans from API
  const fetchPlansFromAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get adminId from localStorage using "userId" key
      const adminId = localStorage.getItem('userId') || '4'; // Default to '4' if not found
      
      // Make API call to get plans by admin ID
      const response = await axiosInstance.get(`${BaseUrl}/MemberPlan?adminId=${adminId}`);
      
      if (response.data.success) {
        // Format the API response to match our component structure
        const formattedPlans = response.data.plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          sessions: plan.sessions,
          validity: plan.validityDays,
          price: `₹${plan.price.toLocaleString()}`,
          active: true, // Assuming all plans from API are active by default
          branch: 'Downtown', // Default branch since API doesn't provide it
          type: plan.type.toLowerCase() // Convert to lowercase for our component
        }));
        
        setApiPlans(formattedPlans);
        setPlansLoaded(true);
        
        // Separate plans by type
        const newGroupPlans = formattedPlans.filter(plan => plan.type === 'group');
        const newPersonalPlans = formattedPlans.filter(plan => plan.type === 'personal');
        
        setGroupPlans(newGroupPlans);
        setPersonalPlans(newPersonalPlans);
      } else {
        setError("Failed to fetch plans. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.response?.data?.message || "Failed to fetch plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch booking requests from API
  const fetchBookingRequests = async () => {
    try {
      // Get adminId from localStorage using "userId" key
      const adminId = localStorage.getItem('userId') || '4'; // Default to '4' if not found
      
      // Make API call to get booking requests
      // const response = await axiosInstance.get(`${BaseUrl}/BookingRequest?adminId=${adminId}`);
      
      if (response.data.success) {
        // Format the API response to match our component structure
        const formattedRequests = response.data.requests.map(request => ({
          id: request.id,
          memberName: request.memberName,
          planName: request.planName,
          planType: request.planType,
          sessions: request.sessions,
          validity: request.validity,
          sessionsUsed: request.sessionsUsed,
          requestedAt: new Date(request.requestedAt).toLocaleString(),
          status: request.status.toLowerCase()
        }));
        
        setBookingRequests(formattedRequests);
      } else {
        setError("Failed to fetch booking requests. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching booking requests:", err);
      setError(err.response?.data?.message || "Failed to fetch booking requests. Please try again.");
    }
  };

  // Function to fetch a single plan by ID from API
  const fetchPlanById = async (planId) => {
    setViewLoading(true);
    setError(null);
    
    try {
      // Make API call to get plan by ID
      const response = await axiosInstance.get(`${BaseUrl}/MemberPlan/${planId}`);
      
      if (response.data.success) {
        const plan = response.data.plan;
        // Format the API response to match our component structure
        const formattedPlan = {
          id: plan.id,
          name: plan.name,
          sessions: plan.sessions,
          validity: plan.validityDays,
          price: `₹${plan.price.toLocaleString()}`,
          active: true, // Assuming all plans from API are active by default
          branch: 'Downtown', // Default branch since API doesn't provide it
          type: plan.type.toLowerCase(), // Convert to lowercase for our component
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt
        };
        
        setSelectedPlan(formattedPlan);
        setShowViewModal(true);
      } else {
        setError("Failed to fetch plan details. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching plan details:", err);
      setError(err.response?.data?.message || "Failed to fetch plan details. Please try again.");
    } finally {
      setViewLoading(false);
    }
  };

  // Get the appropriate plan list based on type and filter by branch
  const getPlansByType = (type) => {
    const plans = type === 'group' ? groupPlans : personalPlans;
    return selectedBranch === 'all' ? plans : plans.filter(plan => plan.branch === selectedBranch);
  };

  // Update the appropriate plan list based on type
  const updatePlansByType = (type, updatedPlans) => {
    if (type === 'group') {
      setGroupPlans(updatedPlans);
    } else {
      setPersonalPlans(updatedPlans);
    }
  };

  // Handle Plan Creation with API
  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.sessions || !newPlan.validity || !newPlan.price) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get adminId from localStorage using "userId" key
      const adminId = localStorage.getItem('userId') || '4'; // Default to '4' if not found

      // Prepare payload according to API requirements
      const payload = {
        planName: newPlan.name,
        sessions: parseInt(newPlan.sessions),
        validity: parseInt(newPlan.validity),
        price: parseInt(newPlan.price.replace('₹', '').replace(',', '')),
        adminId: parseInt(adminId), // Convert to integer
        type: newPlan.type.toUpperCase() // Convert to uppercase as per API response
      };

      // Make API call
      const response = await axiosInstance.post(`${BaseUrl}/MemberPlan`, payload);
      
      if (response.data.success) {
        // Format the response data to match our component structure
        const plan = {
          id: response.data.plan.id,
          name: response.data.plan.name,
          sessions: response.data.plan.sessions,
          validity: response.data.plan.validityDays,
          price: `₹${response.data.plan.price.toLocaleString()}`,
          active: true,
          branch: newPlan.branch,
          type: newPlan.type
        };

        // Update local state
        const currentPlans = newPlan.type === 'group' ? groupPlans : personalPlans;
        updatePlansByType(newPlan.type, [...currentPlans, plan]);

        // Also update API plans state
        setApiPlans([...apiPlans, plan]);

        // Reset form
        setNewPlan({
          name: '',
          sessions: '',
          validity: '',
          price: '',
          type: activeTab === 'personal' ? 'personal' : 'group',
          branch: 'Downtown'
        });
        setShowCreateModal(false);
        alert(`✅ ${newPlan.type === 'group' ? 'Group' : 'Personal'} Plan Created: ${plan.name}`);
      } else {
        setError("Failed to create plan. Please try again.");
      }
    } catch (err) {
      console.error("Error creating plan:", err);
      setError(err.response?.data?.message || "Failed to create plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Plan Edit
  const handleEditPlan = (plan, planType) => {
    setSelectedPlan({ ...plan, type: planType });
    setNewPlan({
      name: plan.name,
      sessions: plan.sessions.toString(),
      validity: plan.validity.toString(),
      price: plan.price.replace('₹', '').replace(',', ''),
      type: planType,
      branch: plan.branch
    });
    setShowEditModal(true);
  };

  // Handle Plan Update
  const handleUpdatePlan = async () => {
    if (!newPlan.name || !newPlan.sessions || !newPlan.validity || !newPlan.price) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get adminId from localStorage using "userId" key
      const adminId = localStorage.getItem('userId') || '4'; // Default to '4' if not found

      // Prepare payload according to API requirements
      const payload = {
        planName: newPlan.name,
        sessions: parseInt(newPlan.sessions),
        validity: parseInt(newPlan.validity),
        price: parseInt(newPlan.price.replace('₹', '').replace(',', '')),
        adminId: parseInt(adminId), // Convert to integer
        type: newPlan.type.toUpperCase() // Convert to uppercase as per API response
      };

      // Make API call - assuming you have an update endpoint
      const response = await axiosInstance.put(`${BaseUrl}/MemberPlan/${selectedPlan.id}`, payload);
      
      if (response.data.success) {
        // Format the response data to match our component structure
        const updatedPlan = {
          ...selectedPlan,
          name: response.data.plan.name,
          sessions: response.data.plan.sessions,
          validity: response.data.plan.validityDays,
          price: `₹${response.data.plan.price.toLocaleString()}`,
          branch: newPlan.branch
        };

        // Update local state
        const currentPlans = getPlansByType(selectedPlan.type);
        updatePlansByType(
          selectedPlan.type,
          currentPlans.map(p => p.id === selectedPlan.id ? updatedPlan : p)
        );

        // Also update API plans state
        setApiPlans(apiPlans.map(p => p.id === selectedPlan.id ? updatedPlan : p));

        // Reset form
        setNewPlan({ name: '', sessions: '', validity: '', price: '', type: 'group', branch: 'Downtown' });
        setShowEditModal(false);
        setSelectedPlan(null);
        alert(`✅ Plan Updated: ${updatedPlan.name}`);
      } else {
        setError("Failed to update plan. Please try again.");
      }
    } catch (err) {
      console.error("Error updating plan:", err);
      setError(err.response?.data?.message || "Failed to update plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Plan Delete
  const handleDeletePlan = (planId, planType) => {
    setPlanToDelete({ id: planId, type: planType });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Make API call - assuming you have a delete endpoint
      const response = await axiosInstance.delete(`${BaseUrl}/MemberPlan/${planToDelete.id}`);
      
      if (response.data.success) {
        // Update local state
        const { id, type } = planToDelete;
        const currentPlans = getPlansByType(type);
        updatePlansByType(type, currentPlans.filter(p => p.id !== id));
        
        // Also update API plans state
        setApiPlans(apiPlans.filter(p => p.id !== id));
        
        setShowDeleteModal(false);
        alert("✅ Plan Deleted!");
      } else {
        setError("Failed to delete plan. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting plan:", err);
      setError(err.response?.data?.message || "Failed to delete plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlanToDelete({ id: null, type: null });
  };

  // Handle Plan Toggle (Activate/Deactivate)
  const handleTogglePlan = async (planId, planType) => {
    setLoading(true);
    setError(null);

    try {
      // Find the plan to toggle
      const currentPlans = getPlansByType(planType);
      const plan = currentPlans.find(p => p.id === planId);
      
      if (!plan) {
        setError("Plan not found");
        return;
      }

      // Make API call - assuming you have an update endpoint for status
      const response = await axiosInstance.patch(`${BaseUrl}/MemberPlan/${planId}`, {
        active: !plan.active
      });
      
      if (response.data.success) {
        // Update local state
        updatePlansByType(
          planType,
          currentPlans.map(p =>
            p.id === planId ? { ...p, active: !p.active } : p
          )
        );
        
        // Also update API plans state
        setApiPlans(apiPlans.map(p => 
          p.id === planId ? { ...p, active: !p.active } : p
        ));
        
        alert(`✅ Plan ${planType === 'group' ? 'Group' : 'Personal'} updated!`);
      } else {
        setError("Failed to update plan status. Please try again.");
      }
    } catch (err) {
      console.error("Error toggling plan status:", err);
      setError(err.response?.data?.message || "Failed to update plan status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open status change modal
  const handleOpenStatusModal = (request) => {
    setRequestToProcess(request);
    setShowStatusModal(true);
  };

  // Process status change
  const handleProcessStatus = async (status) => {
    if (!requestToProcess) return;

    try {
      // Make API call to update booking request status
      const response = await axiosInstance.patch(`${BaseUrl}/BookingRequest/${requestToProcess.id}`, {
        status: status.toUpperCase()
      });
      
      if (response.data.success) {
        setBookingRequests(
          bookingRequests.map(req =>
            req.id === requestToProcess.id ? { ...req, status } : req
          )
        );

        const statusMessage = status === 'approved' ?
          "✅ Booking Approved! Member will be notified." :
          "❌ Booking Rejected. Member will be notified.";

        alert(statusMessage);
        setShowStatusModal(false);
        setRequestToProcess(null);
      } else {
        setError("Failed to update booking request status. Please try again.");
      }
    } catch (err) {
      console.error("Error updating booking request status:", err);
      setError(err.response?.data?.message || "Failed to update booking request status. Please try again.");
    }
  };

  // Toggle status for approved/rejected requests
  const handleToggleRequestStatus = async (requestId) => {
    const request = bookingRequests.find(req => req.id === requestId);
    if (!request) return;

    // Only toggle between approved and rejected
    if (request.status === 'pending') {
      handleOpenStatusModal(request);
      return;
    }

    const newStatus = request.status === 'approved' ? 'rejected' : 'approved';

    try {
      // Make API call to update booking request status
      const response = await axiosInstance.patch(`${BaseUrl}/BookingRequest/${requestId}`, {
        status: newStatus.toUpperCase()
      });
      
      if (response.data.success) {
        setBookingRequests(
          bookingRequests.map(req =>
            req.id === requestId ? { ...req, status: newStatus } : req
          )
        );

        const statusMessage = newStatus === 'approved' ?
          "✅ Booking Approved! Member will be notified." :
          "❌ Booking Rejected. Member will be notified.";

        alert(statusMessage);
      } else {
        setError("Failed to update booking request status. Please try again.");
      }
    } catch (err) {
      console.error("Error updating booking request status:", err);
      setError(err.response?.data?.message || "Failed to update booking request status. Please try again.");
    }
  };

  // Filter requests by status
  const pendingRequests = bookingRequests.filter(r => r.status === 'pending');
  const approvedRequests = bookingRequests.filter(r => r.status === 'approved');
  const rejectedRequests = bookingRequests.filter(r => r.status === 'rejected');

  // Render plan card component
  const renderPlanCard = (plan, planType) => (
    <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex mb-3">
      <Card className="h-100 shadow-sm border-0 w-100" style={{ borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
        <div style={{
          height: '6px',
          backgroundColor: plan.active ? customColor : '#ccc',
          width: '100%'
        }}></div>
        <Card.Body className="d-flex flex-column p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div className="badge  mb-2 px-2 py-1" style={{ backgroundColor: customColor, color: 'white', fontSize: '0.7rem' }}>
                {planType === 'group' ? 'GROUP' : 'PERSONAL'}
              </div>
              <h5 className="fw-bold mb-0" style={{ color: customColor, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>{plan.name}</h5>
            </div>
            <div className="d-flex gap-1">
              <Button
                variant="link"
                size="sm"
                className="p-1 rounded-circle"
                style={{
                  color: '#6EB2CC',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.2s ease'
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
                  color: '#6EB2CC',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.2s ease'
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
                  color: '#dc3545',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleDeletePlan(plan.id, planType)}
              >
                <FaTrash size={14} />
              </Button>
            </div>
          </div>
          <ul className="list-unstyled mb-3 flex-grow-1">
            <li className="mb-2 d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>🎯</span>
              <strong style={{ fontSize: '0.9rem' }}>{plan.sessions} Sessions</strong>
            </li>
            <li className="mb-2 d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>📅</span>
              <strong style={{ fontSize: '0.9rem' }}>Validity: {plan.validity} Days</strong>
            </li>
            <li className="mb-2 d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>💰</span>
              <strong style={{ fontSize: '0.9rem' }}>Price: {plan.price}</strong>
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
                  color: 'white',
                  transition: 'background-color 0.3s ease',
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.5rem'
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
                  backgroundColor: '#6c757d',
                  borderColor: '#6c757d',
                  color: 'white',
                  transition: 'background-color 0.3s ease',
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.5rem'
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

  return (
    <div className="bg-light min-vh-100">
      <Container fluid className="px-2 px-sm-3 px-md-5 py-3 py-md-4">
        <h1 className="mb-3 mb-md-4 fw-bold text-dark" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>
          Plan & Booking Management
        </h1>

        {/* Button-style Tabs - Responsive Layout */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4 p-3 bg-white rounded shadow-sm border">
          <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
            <Button
              variant={activeTab === 'group' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('group')}
              className="px-3 px-md-4 py-2 fw-medium d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: activeTab === 'group' ? customColor : 'transparent',
                borderColor: customColor,
                color: activeTab === 'group' ? 'white' : customColor,
                transition: 'all 0.3s ease',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              Group Class Plans
            </Button>
            <Button
              variant={activeTab === 'personal' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('personal')}
              className="px-3 px-md-4 py-2 fw-medium d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: activeTab === 'personal' ? customColor : 'transparent',
                borderColor: customColor,
                color: activeTab === 'personal' ? 'white' : customColor,
                transition: 'all 0.3s ease',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              Personal Training Plans
            </Button>
          </div>
          <Button
            onClick={() => {
              setNewPlan(prev => ({
                ...prev,
                type: activeTab === "personal" ? "personal" : "group",
              }));
              setShowCreateModal(true);
            }}
            className="px-3 px-md-4 py-2 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: customColor,
              borderColor: customColor,
              color: 'white',
              transition: "all 0.3s ease",
              width: '100%',
              maxWidth: '200px'
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
                {/* Group Plans Tab */}
                <Tab.Pane eventKey="group">
                  {loading && !plansLoaded ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" style={{ color: customColor }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading plans...</p>
                    </div>
                  ) : groupPlans.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="display-4 mb-3">📋</div>
                      <p className="fs-5">No group plans found. Create your first plan!</p>
                    </div>
                  ) : (
                    <Row className="g-2 g-md-3">
                      {getPlansByType('group').map(plan => renderPlanCard(plan, 'group'))}
                    </Row>
                  )}
                </Tab.Pane>

                {/* Personal Plans Tab */}
                <Tab.Pane eventKey="personal">
                  {loading && !plansLoaded ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" style={{ color: customColor }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading plans...</p>
                    </div>
                  ) : personalPlans.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="display-4 mb-3">📋</div>
                      <p className="fs-5">No personal plans found. Create your first plan!</p>
                    </div>
                  ) : (
                    <Row className="g-2 g-md-3">
                      {getPlansByType('personal').map(plan => renderPlanCard(plan, 'personal'))}
                    </Row>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>

        {/* Booking Requests Section - Responsive */}
        <div className="mt-5 pt-4 border-top" style={{ borderColor: customColor }}>
          <h3 className="fw-bold mb-4 text-dark" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.4rem)' }}>Member Booking Requests</h3>

          {/* Summary Cards - Responsive */}
          <Row className="mb-4 g-3">
            <Col xs={12} sm={6} md={4}>
              <Card className="text-center border-0 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', transition: 'transform 0.3s ease' }}>
                <Card.Body className="py-3 py-md-4">
                  <div className="d-flex justify-content-center align-items-center mb-2" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff3cd', margin: '0 auto' }}>
                    <span className="fw-bold" style={{ color: '#856404', fontSize: '1.5rem' }}>{pendingRequests.length}</span>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: customColor }}>Pending Requests</h5>
                  <p className="mb-0 text-muted">Awaiting your approval</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card className="text-center border-0 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', transition: 'transform 0.3s ease' }}>
                <Card.Body className="py-3 py-md-4">
                  <div className="d-flex justify-content-center align-items-center mb-2" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#d1ecf1', margin: '0 auto' }}>
                    <span className="fw-bold" style={{ color: '#0c5460', fontSize: '1.5rem' }}>{approvedRequests.length}</span>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: customColor }}>Approved Bookings</h5>
                  <p className="mb-0 text-muted">Successfully processed</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card className="text-center border-0 shadow-sm h-100" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', transition: 'transform 0.3s ease' }}>
                <Card.Body className="py-3 py-md-4">
                  <div className="d-flex justify-content-center align-items-center mb-2" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f8d7da', margin: '0 auto' }}>
                    <span className="fw-bold" style={{ color: '#721c24', fontSize: '1.5rem' }}>{rejectedRequests.length}</span>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: customColor }}>Rejected Requests</h5>
                  <p className="mb-0 text-muted">Declined by admin</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Requests Table - Responsive with Card View for Mobile */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <Card.Header className="bg-light border-0 pb-3" style={{ borderBottom: `3px solid ${customColor}`, borderRadius: '12px 12px 0 0' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0 text-dark" style={{ fontWeight: '600' }}>All Booking Requests</h5>
                  <small className="text-muted">Total: {bookingRequests.length} requests</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {bookingRequests.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <div className="display-4 mb-3">📭</div>
                  <p className="fs-5">No booking requests yet.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="table-responsive d-none d-md-block">
                    <Table hover responsive className="align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="py-3">#</th>
                          <th className="py-3">Member</th>
                          <th className="py-3">Plan</th>
                          <th className="py-3">Type</th>
                          <th className="py-3 d-none d-lg-table-cell">Sessions</th>
                          <th className="py-3 d-none d-lg-table-cell">Validity</th>
                          <th className="py-3">Requested At</th>
                          <th className="py-3">Status</th>
                          <th className="py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingRequests.map((req, index) => (
                          <tr key={req.id}>
                            <td className="py-3">{index + 1}</td>
                            <td className="py-3">
                              <strong>{req.memberName}</strong>
                            </td>
                            <td className="py-3">{req.planName}</td>
                            <td className="py-3">
                              {req.planType === 'Group' ? (
                                <span className="badge px-3 py-2" style={{ backgroundColor: customColor, color: 'white', borderRadius: '20px' }}>Group</span>
                              ) : (
                                <span className="badge px-3 py-2" style={{ backgroundColor: customColor, color: 'white', borderRadius: '20px' }}>Personal</span>
                              )}
                            </td>
                            <td className="py-3 d-none d-lg-table-cell">{req.sessions} total</td>
                            <td className="py-3 d-none d-lg-table-cell">{req.validity} days</td>
                            <td className="py-3">{req.requestedAt}</td>
                            <td className="py-3">
                              {req.status === 'pending' && <span className="badge bg-warning text-dark px-3 py-2" style={{ borderRadius: '20px' }}>Pending</span>}
                              {req.status === 'approved' && <span className="badge px-3 py-2" style={{ backgroundColor: customColor, color: 'white', borderRadius: '20px' }}>Approved</span>}
                              {req.status === 'rejected' && <span className="badge bg-danger px-3 py-2" style={{ borderRadius: '20px' }}>Rejected</span>}
                            </td>
                            <td className="py-3">
                              <div className="d-flex gap-2 align-items-center flex-nowrap" style={{ minWidth: 'fit-content' }}>
                                {req.status === 'pending' ? (
                                  <Button
                                    size="sm"
                                    className="d-flex align-items-center gap-1 fw-medium"
                                    onClick={() => handleOpenStatusModal(req)}
                                    style={{
                                      backgroundColor: '#ffc107',
                                      borderColor: '#ffc107',
                                      color: '#212529',
                                      transition: 'background-color 0.3s ease',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <FaToggleOn size={14} /> Process
                                  </Button>
                                ) : req.status === 'approved' ? (
                                  <Button
                                    size="sm"
                                    className="d-flex align-items-center gap-1 fw-medium"
                                    onClick={() => handleToggleRequestStatus(req.id)}
                                    style={{
                                      backgroundColor: customColor,
                                      borderColor: customColor,
                                      color: 'white',
                                      transition: 'background-color 0.3s ease',
                                      whiteSpace: 'nowrap'
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
                                      backgroundColor: '#6c757d',
                                      borderColor: '#6c757d',
                                      color: 'white',
                                      transition: 'background-color 0.3s ease',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <FaToggleOff size={14} /> Inactive
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="d-md-none p-3">
                    {bookingRequests.map((req, index) => (
                      <Card key={req.id} className="mb-3 border shadow-sm" style={{ borderRadius: '10px' }}>
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0 fw-bold">{req.memberName}</h6>
                            <span className="badge bg-secondary rounded-pill">{index + 1}</span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted small">Plan: </span>
                            <span className="fw-medium">{req.planName}</span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted small">Type: </span>
                            {req.planType === 'Group' ? (
                              <span className="badge bg-primary px-2 py-1" style={{ backgroundColor: customColor, color: 'white', borderRadius: '20px' }}>Group</span>
                            ) : (
                              <span className="badge bg-primary px-2 py-1" style={{ backgroundColor: customColor, color: 'white', borderRadius: '20px' }}>Personal</span>
                            )}
                          </div>
                          <div className="row mb-2">
                            <div className="col-6">
                              <span className="text-muted small">Sessions: </span>
                              <span className="fw-medium">{req.sessions}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted small">Validity: </span>
                              <span className="fw-medium">{req.validity} days</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <span className="text-muted small">Requested: </span>
                            <span className="fw-medium">{req.requestedAt}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              {req.status === 'pending' && <span className="badge bg-warning text-dark px-3 py-2" style={{ borderRadius: '20px' }}>Pending</span>}
                              {req.status === 'approved' && <span className="badge px-3 py-2" style={{ backgroundColor: customColor, color: 'white', borderRadius: '20px' }}>Approved</span>}
                              {req.status === 'rejected' && <span className="badge bg-danger px-3 py-2" style={{ borderRadius: '20px' }}>Rejected</span>}
                            </div>
                            {req.status === 'pending' ? (
                              <Button
                                size="sm"
                                className="d-flex align-items-center gap-1 fw-medium"
                                onClick={() => handleOpenStatusModal(req)}
                                style={{
                                  backgroundColor: '#ffc107',
                                  borderColor: '#ffc107',
                                  color: '#212529',
                                  transition: 'background-color 0.3s ease',
                                }}
                              >
                                <FaToggleOn size={14} /> Process
                              </Button>
                            ) : req.status === 'approved' ? (
                              <Button
                                size="sm"
                                className="d-flex align-items-center gap-1 fw-medium"
                                onClick={() => handleToggleRequestStatus(req.id)}
                                style={{
                                  backgroundColor: customColor,
                                  borderColor: customColor,
                                  color: 'white',
                                  transition: 'background-color 0.3s ease',
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
                                  backgroundColor: '#6c757d',
                                  borderColor: '#6c757d',
                                  color: 'white',
                                  transition: 'background-color 0.3s ease',
                                }}
                              >
                                <FaToggleOff size={14} /> Inactive
                              </Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Status Change Modal - Responsive */}
        <Modal
          show={showStatusModal}
          onHide={() => setShowStatusModal(false)}
          centered
          size="sm"
          contentClassName="p-0"
        >
          <Modal.Header className="py-2 px-3" style={{ backgroundColor: '#f8f9fa', borderBottom: `2px solid ${customColor}` }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.1rem' }}>Process Request</Modal.Title>
            <Button variant="link" className="p-0 m-0" onClick={() => setShowStatusModal(false)} style={{ color: '#6c757d' }}>
              <span aria-hidden="true">&times;</span>
            </Button>
          </Modal.Header>
          <Modal.Body className="py-3 px-3">
            {requestToProcess && (
              <div>
                <p className="mb-2 fw-medium text-center">Process request from:</p>
                <div className="text-center mb-3">
                  <strong>{requestToProcess.memberName}</strong>
                  <div className="text-muted small">{requestToProcess.planName}</div>
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant="success"
                    size="sm"
                    className="px-3"
                    onClick={() => handleProcessStatus('approved')}
                    style={{
                      backgroundColor: '#28a745',
                      borderColor: '#28a745',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="px-3"
                    onClick={() => handleProcessStatus('rejected')}
                    style={{
                      backgroundColor: '#dc3545',
                      borderColor: '#dc3545',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>

        {/* Create Plan Modal - Responsive */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg" fullscreen="sm-down">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: `2px solid ${customColor}` }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600' }}>Create New {newPlan.type === 'group' ? 'Group' : 'Personal'} Plan</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium" style={{ color: '#333' }}>Plan Type</Form.Label>
                <Form.Select
                  value={newPlan.type}
                  onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
                  required
                  style={{ padding: '12px', fontSize: '1rem' }}
                >
                  <option value="personal">Personal Training Plan</option>
                  <option value="group">Group Class Plan</option>
                </Form.Select>
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Plan Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Premium Pack"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Number of Sessions</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 12"
                      value={newPlan.sessions}
                      onChange={(e) => setNewPlan({ ...newPlan, sessions: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Validity (Days)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 60"
                      value={newPlan.validity}
                      onChange={(e) => setNewPlan({ ...newPlan, validity: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 5999"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #eee' }} className="flex-column flex-sm-row">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="w-100 w-sm-auto"
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                transition: 'background-color 0.3s ease'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={loading}
              className="w-100 w-sm-auto mt-2 mt-sm-0"
              style={{
                backgroundColor: customColor,
                borderColor: customColor,
                transition: 'background-color 0.3s ease'
              }}
            >
              {loading ? 'Creating...' : <span className="fw-medium">Create Plan</span>}
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Edit Plan Modal - Responsive */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" fullscreen="sm-down">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: `2px solid ${customColor}` }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600' }}>Edit {selectedPlan?.type === 'group' ? 'Group' : 'Personal'} Plan</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium" style={{ color: '#333' }}>Plan Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Premium Pack"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  required
                  style={{ padding: '12px', fontSize: '1rem' }}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Number of Sessions</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 12"
                      value={newPlan.sessions}
                      onChange={(e) => setNewPlan({ ...newPlan, sessions: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Validity (Days)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 60"
                      value={newPlan.validity}
                      onChange={(e) => setNewPlan({ ...newPlan, validity: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 5999"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Branch</Form.Label>
                    <Form.Select
                      value={newPlan.branch}
                      onChange={(e) => setNewPlan({ ...newPlan, branch: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    >
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #eee' }} className="flex-column flex-sm-row">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              className="w-100 w-sm-auto"
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                transition: 'background-color 0.3s ease'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="info"
              onClick={handleUpdatePlan}
              disabled={loading}
              className="w-100 w-sm-auto mt-2 mt-sm-0"
              style={{
                backgroundColor: customColor,
                borderColor: '#fff',
                color: '#fff',
                transition: 'background-color 0.3s ease'
              }}
            >
              {loading ? 'Updating...' : <span className="fw-medium">Update Plan</span>}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* View Plan Modal - Responsive */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg" fullscreen="sm-down">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: `2px solid ${customColor}` }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600' }}>View Plan Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            {viewLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ color: customColor }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Fetching plan details...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : selectedPlan ? (
              <div className="p-4 bg-light rounded">
                <h5 className="fw-bold mb-4" style={{ color: '#333', fontSize: '1.3rem' }}>{selectedPlan.name} ({selectedPlan.type === 'group' ? 'Group' : 'Personal'})</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <span className="me-3" style={{ color: customColor, fontSize: '1.2rem' }}>🎯</span>
                      <div>
                        <div className="text-muted small">Sessions</div>
                        <div className="fw-bold">{selectedPlan.sessions}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <span className="me-3" style={{ color: customColor, fontSize: '1.2rem' }}>📅</span>
                      <div>
                        <div className="text-muted small">Validity</div>
                        <div className="fw-bold">{selectedPlan.validity} days</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <span className="me-3" style={{ color: customColor, fontSize: '1.2rem' }}>💰</span>
                      <div>
                        <div className="text-muted small">Price</div>
                        <div className="fw-bold">{selectedPlan.price}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <span className="me-3" style={{ color: customColor, fontSize: '1.2rem' }}>⚡</span>
                      <div>
                        <div className="text-muted small">Status</div>
                        <div>
                          {selectedPlan.active ? (
                            <span className="badge px-3 py-2" style={{ backgroundColor: customColor, color: 'white', borderRadius: '20px' }}>Active</span>
                          ) : (
                            <span className="badge bg-secondary px-3 py-2" style={{ borderRadius: '20px' }}>Inactive</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedPlan.createdAt && (
                    <div className="col-md-6">
                      <div className="mb-3 d-flex align-items-center">
                        <span className="me-3" style={{ color: customColor, fontSize: '1.2rem' }}>🕒</span>
                        <div>
                          <div className="text-muted small">Created At</div>
                          <div className="fw-bold">{new Date(selectedPlan.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedPlan.updatedAt && (
                    <div className="col-md-6">
                      <div className="mb-3 d-flex align-items-center">
                        <span className="me-3" style={{ color: customColor, fontSize: '1.2rem' }}>🔄</span>
                        <div>
                          <div className="text-muted small">Last Updated</div>
                          <div className="fw-bold">{new Date(selectedPlan.updatedAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-5">
                <p>No plan details available.</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #eee' }}>
            <Button
              variant="secondary"
              onClick={() => setShowViewModal(false)}
              className="w-100 w-sm-auto"
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                transition: 'background-color 0.3s ease'
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal - Responsive */}
        <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#333' }}>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <p className="text-center fw-medium" style={{ fontSize: '1.1rem' }}>
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
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                minWidth: '100px'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="w-100 w-sm-auto mt-2 mt-sm-0"
              style={{
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                minWidth: '100px'
              }}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default CreatePlan;