import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaDumbbell, FaClock, FaStickyNote } from 'react-icons/fa';
import axios from 'axios';

const WalkInRegistration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'add', 'edit', 'view'
  const [selectedWalkIn, setSelectedWalkIn] = useState(null);
  const [walkIns, setWalkIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null); // Debug API responses
  
  // Mock plans for dropdown
  const membershipPlans = [
    { id: 1, name: "Basic Monthly" },
    { id: 2, name: "Premium Annual" },
    { id: 3, name: "Student Plan" },
    { id: 4, name: "Weekend Warrior" },
    { id: 5, name: "Corporate Package" }
  ];

  // Create axios instance with default config
  const api = axios.create({
    baseURL: 'https://84kmwvvs-4000.inc1.devtunnels.ms/api',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000 // 10 seconds timeout
  });

  // Add request interceptor for debugging
  api.interceptors.request.use(
    config => {
      console.log('Making request to:', config.url);
      console.log('Request data:', config.data);
      return config;
    },
    error => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for debugging
  api.interceptors.response.use(
    response => {
      console.log('Response received:', response);
      setApiResponse(JSON.stringify(response.data, null, 2));
      return response;
    },
    error => {
      console.error('Response error:', error);
      const errorMessage = error.response?.data || error.message || 'Unknown error';
      setApiResponse(JSON.stringify(errorMessage, null, 2));
      return Promise.reject(error);
    }
  );

  // Mock data for fallback
  const mockWalkIns = [
    {
      id: 1,
      name: "John Doe",
      phone: "+91 98765 43210",
      email: "john.doe@example.com",
      preferred_membership_plan: "Premium Annual",
      interested_in: "Personal Training",
      preferred_time: "2023-06-15T10:30",
      notes: "Interested in morning slots",
      registered_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "+91 87654 32109",
      email: "jane.smith@example.com",
      preferred_membership_plan: "Basic Monthly",
      interested_in: "Group Classes",
      preferred_time: "2023-06-16T18:00",
      notes: "Prefers evening workouts",
      registered_at: new Date().toISOString()
    }
  ];

  // Fetch all members from API
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get members from the API
      try {
        // Try to get a list of members first
        const response = await api.get('/members');
        
        // Transform API data to our format
        const transformedData = response.data.map(member => ({
          id: member.id,
          name: member.fullName || member.name,
          phone: member.phone,
          email: member.email,
          preferred_membership_plan: membershipPlans.find(p => p.id === member.planId)?.name || "",
          interested_in: member.interestedIn || "",
          preferred_time: member.membershipFrom || "",
          notes: member.address || "",
          registered_at: member.createdAt || new Date().toISOString()
        }));
        
        setWalkIns(transformedData);
      } catch (listError) {
        console.error('Error fetching member list:', listError);
        
        // If list endpoint fails, try to get a single member to test API
        try {
          const response = await api.get('/members/detail/1');
          
          // Transform single member data
          const transformedMember = {
            id: response.data.id,
            name: response.data.fullName || response.data.name,
            phone: response.data.phone,
            email: response.data.email,
            preferred_membership_plan: membershipPlans.find(p => p.id === response.data.planId)?.name || "",
            interested_in: response.data.interestedIn || "",
            preferred_time: response.data.membershipFrom || "",
            notes: response.data.address || "",
            registered_at: response.data.createdAt || new Date().toISOString()
          };
          
          setWalkIns([transformedMember]);
        } catch (detailError) {
          console.error('Error fetching member detail:', detailError);
          
          // If all API calls fail, use mock data
          setWalkIns(mockWalkIns);
          setError('Failed to connect to API. Using mock data.');
        }
      }
    } catch (err) {
      console.error('Error in fetchMembers:', err);
      setWalkIns(mockWalkIns);
      setError('Failed to fetch members. Using mock data.');
    } finally {
      setLoading(false);
    }
  };

  // Create a new member
  const createMember = async (memberData) => {
    try {
      // Transform UI data to API format
      const apiData = {
        fullName: memberData.name,
        email: memberData.email || "",
        password: "123456", // Default password
        phone: memberData.phone,
        planId: membershipPlans.find(p => p.name === memberData.preferred_membership_plan)?.id || 1,
        membershipFrom: memberData.preferred_time ? new Date(memberData.preferred_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dateOfBirth: "1990-01-01", // Default value
        paymentMode: "Cash", // Default value
        amountPaid: 2500, // Default value
        branchId: 2, // Default value
        gender: "Other", // Default value
        interestedIn: memberData.interested_in || "",
        address: memberData.notes || "",
        adminId: 1 // Default value
      };

      console.log('Creating member with data:', apiData);
      const response = await api.post('/members/create', apiData);
      console.log('Create response:', response.data);
      
      // Add the new member to the state
      const newMember = {
        id: response.data.id || getNextId(),
        name: apiData.fullName,
        phone: apiData.phone,
        email: apiData.email,
        preferred_membership_plan: membershipPlans.find(p => p.id === apiData.planId)?.name || "",
        interested_in: apiData.interestedIn || "",
        preferred_time: apiData.membershipFrom || "",
        notes: apiData.address || "",
        registered_at: new Date().toISOString()
      };
      
      setWalkIns(prev => [...prev, newMember]);
      return true;
    } catch (err) {
      console.error('Error creating member:', err);
      setError(`Failed to create member: ${err.response?.data?.message || err.message}`);
      
      // If API fails, add to local state with mock data
      const newMember = {
        id: getNextId(),
        name: memberData.name,
        phone: memberData.phone,
        email: memberData.email,
        preferred_membership_plan: memberData.preferred_membership_plan,
        interested_in: memberData.interested_in,
        preferred_time: memberData.preferred_time,
        notes: memberData.notes,
        registered_at: new Date().toISOString()
      };
      
      setWalkIns(prev => [...prev, newMember]);
      setError('API call failed, but data was saved locally.');
      return true;
    }
  };

  // Update an existing member
  const updateMember = async (id, memberData) => {
    try {
      // Transform UI data to API format
      const apiData = {
        fullName: memberData.name,
        email: memberData.email || "",
        phone: memberData.phone,
        gender: "Other" // Default value
      };

      // Only include these fields if they have values
      if (memberData.preferred_membership_plan) {
        const planId = membershipPlans.find(p => p.name === memberData.preferred_membership_plan)?.id;
        if (planId) apiData.planId = planId;
      }
      
      if (memberData.interested_in) apiData.interestedIn = memberData.interested_in;
      
      if (memberData.preferred_time) {
        apiData.membershipFrom = new Date(memberData.preferred_time).toISOString().split('T')[0];
      }
      
      if (memberData.notes) apiData.address = memberData.notes;

      console.log(`Updating member ${id} with data:`, apiData);
      const response = await api.put(`/members/update/${id}`, apiData);
      console.log('Update response:', response.data);
      
      // Update the member in the state
      setWalkIns(prev => prev.map(member => 
        member.id === id 
          ? {
              ...member,
              name: apiData.fullName,
              phone: apiData.phone,
              email: apiData.email,
              preferred_membership_plan: apiData.planId ? membershipPlans.find(p => p.id === apiData.planId)?.name || "" : member.preferred_membership_plan,
              interested_in: apiData.interestedIn || member.interested_in,
              preferred_time: apiData.membershipFrom || member.preferred_time,
              notes: apiData.address || member.notes
            }
          : member
      ));
      
      return true;
    } catch (err) {
      console.error('Error updating member:', err);
      setError(`Failed to update member: ${err.response?.data?.message || err.message}`);
      
      // If API fails, update local state
      setWalkIns(prev => prev.map(member => 
        member.id === id 
          ? {
              ...member,
              name: memberData.name,
              phone: memberData.phone,
              email: memberData.email,
              preferred_membership_plan: memberData.preferred_membership_plan,
              interested_in: memberData.interested_in,
              preferred_time: memberData.preferred_time,
              notes: memberData.notes
            }
          : member
      ));
      
      setError('API call failed, but data was updated locally.');
      return true;
    }
  };

  // Delete a member
  const deleteMember = async (id) => {
    try {
      console.log(`Deleting member with ID: ${id}`);
      const response = await api.delete(`/members/delete/${id}`);
      console.log('Delete response:', response.data);
      
      // Remove the member from the state
      setWalkIns(prev => prev.filter(member => member.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting member:', err);
      setError(`Failed to delete member: ${err.response?.data?.message || err.message}`);
      
      // If API fails, remove from local state
      setWalkIns(prev => prev.filter(member => member.id !== id));
      setError('API call failed, but data was deleted locally.');
      return true;
    }
  };

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddNew = () => {
    setModalType('add');
    setSelectedWalkIn(null);
    setIsModalOpen(true);
  };

  const handleView = (walkIn) => {
    setModalType('view');
    setSelectedWalkIn(walkIn);
    setIsModalOpen(true);
  };

  const handleEdit = (walkIn) => {
    setModalType('edit');
    setSelectedWalkIn(walkIn);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (walkIn) => {
    setSelectedWalkIn(walkIn);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedWalkIn) {
      const success = await deleteMember(selectedWalkIn.id);
      if (success) {
        alert(`Walk-in record for ${selectedWalkIn.name} has been deleted.`);
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedWalkIn(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWalkIn(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedWalkIn(null);
  };

  // Prevent background scroll
  React.useEffect(() => {
    if (isModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isDeleteModalOpen]);

  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return 'Add New Walk-in Registration';
      case 'edit': return 'Edit Walk-in Registration';
      case 'view': return 'Walk-in Registration Details';
      default: return 'Walk-in Registration';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "—";
    const date = new Date(dateTimeString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getNextId = () => {
    return walkIns.length > 0 ? Math.max(...walkIns.map(w => w.id)) + 1 : 1;
  };

  // Component for the view modal content
  const WalkInViewContent = ({ walkIn }) => {
    if (!walkIn) return null;
    
    return (
      <div className="walkin-view-content">
        {/* Header Section */}
        <div className="text-center mb-4 pb-3 border-bottom">
          <h3 className="mb-1">{walkIn.name}</h3>
          <p className="text-muted mb-2">Walk-in Registration</p>
          <div className="mt-2">
            <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-1">
              Registered on {formatDateTime(walkIn.registered_at)}
            </span>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-light p-3 me-3">
                  <FaPhone className="text-success fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">Phone Number</h6>
                  <p className="mb-0 fw-bold">{walkIn.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-light p-3 me-3">
                  <FaEnvelope className="text-info fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">Email Address</h6>
                  <p className="mb-0 fw-bold">{walkIn.email || <span className="text-muted">Not provided</span>}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Membership Information */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-light p-3 me-3">
                  <FaDumbbell className="text-warning fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">Preferred Membership Plan</h6>
                  <p className="mb-0 fw-bold">{walkIn.preferred_membership_plan || <span className="text-muted">Not specified</span>}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-light p-3 me-3">
                  <FaUser className="text-primary fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">Interested In</h6>
                  <p className="mb-0 fw-bold">{walkIn.interested_in || <span className="text-muted">Not specified</span>}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Preferred Time */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center mb-3">
              <FaClock className="text-primary me-2" /> Preferred Time
            </h5>
            <div className="p-3 bg-light rounded">
              <p className="mb-0 fs-5 fw-bold">
                {walkIn.preferred_time ? formatDateTime(walkIn.preferred_time) : <span className="text-muted">Not specified</span>}
              </p>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center mb-3">
              <FaStickyNote className="text-warning me-2" /> Additional Notes
            </h5>
            <div className="p-3 bg-light rounded">
              <p className="mb-0">
                {walkIn.notes || <span className="text-muted">No additional notes</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Walk-in Registration</h2>
          <p className="text-muted mb-0">Manage walk-in visitors and their registration details.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn w-100 w-lg-auto"
            style={{
              backgroundColor: '#6EB2CC',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onClick={handleAddNew}
          >
            <i className="fas fa-plus me-2"></i> Add Walk-in
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {/* API Response Debug Panel */}
      {apiResponse && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">API Response (Debug)</h5>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={() => setApiResponse(null)}
            >
              Close
            </button>
          </div>
          <div className="card-body">
            <pre className="bg-light p-3 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
              {apiResponse}
            </pre>
          </div>
        </div>
      )}

      {/* Search & Actions */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group">
            <span className="input-group-text bg-light border">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border"
              placeholder="Search by name or phone..."
            />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-filter me-1"></i> <span className="">Filter</span>
          </button>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-file-export me-1"></i> <span className="">Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold">NAME</th>
                  <th className="fw-semibold">PHONE</th>
                  <th className="fw-semibold">EMAIL</th>
                  <th className="fw-semibold">PREFERRED PLAN</th>
                  <th className="fw-semibold">INTERESTED IN</th>
                  <th className="fw-semibold">PREFERRED TIME</th>
                  <th className="fw-semibold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {walkIns.map((walkIn) => (
                  <tr key={walkIn.id}>
                    <td><strong>{walkIn.name}</strong></td>
                    <td>{walkIn.phone}</td>
                    <td>{walkIn.email || <span className="text-muted">—</span>}</td>
                    <td>{walkIn.preferred_membership_plan || <span className="text-muted">—</span>}</td>
                    <td>{walkIn.interested_in || <span className="text-muted">—</span>}</td>
                    <td>{formatDateTime(walkIn.preferred_time)}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center flex-nowrap" style={{ gap: '4px' }}>
                        <button
                          className="btn btn-sm btn-outline-secondary action-btn"
                          title="View"
                          onClick={() => handleView(walkIn)}
                          style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary action-btn"
                          title="Edit"
                          onClick={() => handleEdit(walkIn)}
                          style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger action-btn"
                          title="Delete"
                          onClick={() => handleDeleteClick(walkIn)}
                          style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MAIN MODAL (Add/Edit/View) */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{getModalTitle()}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                {modalType === 'view' ? (
                  <WalkInViewContent walkIn={selectedWalkIn} />
                ) : (
                  <form>
                    {/* Name & Phone */}
                    <div className="row mb-3 g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Full Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          placeholder="Enter full name"
                          defaultValue={selectedWalkIn?.name || ''}
                          readOnly={modalType === 'view'}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                        <input
                          type="tel"
                          className="form-control rounded-3"
                          placeholder="+91 98765 43210"
                          defaultValue={selectedWalkIn?.phone || ''}
                          readOnly={modalType === 'view'}
                          required
                        />
                      </div>
                    </div>
                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        placeholder="example@email.com"
                        defaultValue={selectedWalkIn?.email || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                    {/* Preferred Plan */}
                    <div className="mb-3">
                      <label className="form-label">Preferred Membership Plan</label>
                      <select
                        className="form-select rounded-3"
                        defaultValue={selectedWalkIn?.preferred_membership_plan || ''}
                        disabled={modalType === 'view'}
                      >
                        <option value="">Select a plan</option>
                        {membershipPlans.map(plan => (
                          <option key={plan.id} value={plan.name}>{plan.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Interested In */}
                    <div className="mb-3">
                      <label className="form-label">Interested In</label>
                      <div className="d-flex flex-wrap gap-3">
                        {['Personal Training', 'Group Classes', 'Both'].map(option => (
                          <div className="form-check" key={option}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name="interested_in"
                              id={`interested_${option.replace(/\s+/g, '_')}`}
                              value={option}
                              defaultChecked={selectedWalkIn?.interested_in === option}
                              disabled={modalType === 'view'}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`interested_${option.replace(/\s+/g, '_')}`}
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Preferred Time */}
                    <div className="mb-3">
                      <label className="form-label">Preferred Time</label>
                      <input
                        type="datetime-local"
                        className="form-control rounded-3"
                        defaultValue={selectedWalkIn?.preferred_time ? selectedWalkIn.preferred_time.slice(0, 16) : ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                    {/* Notes */}
                    <div className="mb-4">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="3"
                        placeholder="Any additional information..."
                        defaultValue={selectedWalkIn?.notes || ''}
                        readOnly={modalType === 'view'}
                      ></textarea>
                    </div>
                    {/* Buttons */}
                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2 w-100 w-sm-auto"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      {modalType !== 'view' && (
                        <button
                          type="button"
                          className="btn w-100 w-sm-auto"
                          style={{
                            backgroundColor: '#6EB2CC',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: '500',
                          }}
                          onClick={async () => {
                            const formData = {
                              name: document.querySelector('input[placeholder="Enter full name"]').value,
                              phone: document.querySelector('input[placeholder="+91 98765 43210"]').value,
                              email: document.querySelector('input[placeholder="example@email.com"]').value,
                              preferred_membership_plan: document.querySelector('select').value,
                              interested_in: document.querySelector('input[name="interested_in"]:checked')?.value || '',
                              preferred_time: document.querySelector('input[type="datetime-local"]').value,
                              notes: document.querySelector('textarea').value
                            };
                            
                            let success = false;
                            if (modalType === 'add') {
                              success = await createMember(formData);
                              if (success) {
                                alert('New walk-in registration added successfully!');
                              }
                            } else if (modalType === 'edit' && selectedWalkIn) {
                              success = await updateMember(selectedWalkIn.id, formData);
                              if (success) {
                                alert('Walk-in registration updated successfully!');
                              }
                            }
                            
                            if (success) {
                              closeModal();
                            }
                          }}
                        >
                          {modalType === 'add' ? 'Register Walk-in' : 'Update Registration'}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeDeleteModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will permanently delete the walk-in registration for <strong>{selectedWalkIn?.name}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 w-100 w-sm-auto"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 w-100 w-sm-auto"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .action-btn {
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .action-btn {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default WalkInRegistration;