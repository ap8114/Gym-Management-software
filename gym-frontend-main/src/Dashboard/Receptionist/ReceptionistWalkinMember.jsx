import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';

const ReceptionistWalkinMember = () => {
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'add', 'edit', 'view'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Search Term State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Member Data from API
  const [membersData, setMembersData] = useState([]);
  
  // Branch Plans from API
  const [branchPlans, setBranchPlans] = useState([]);
  
  // Form state for controlled inputs
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    membership_plan: '',
    start_date: '',
    expiry_date: '',
    interested_in: '',
    preferred_time: '',
    notes: ''
  });
  
  // API base URL
  const ADMIN_ID = 11; // Hardcoded admin ID as shown in example

  // Fetch branch plans from API
  useEffect(() => {
    const fetchBranchPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get branchId from localStorage
        let branchId = 1; // Default fallback
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.branchId) {
              branchId = user.branchId;
            }
          }
        } catch (err) {
          console.error('Error parsing user from localStorage:', err);
        }
        
        // Using axios to fetch branch plans
        const response = await axios.get(`${BaseUrl}plans/branch/${branchId}`);
        
        if (response.data && response.data.success) {
          setBranchPlans(response.data.plans || []);
        } else {
          setError('Failed to fetch branch plans');
        }
      } catch (err) {
        setError('Error fetching branch plans: ' + err.message);
        console.error('Error fetching branch plans:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchPlans();
  }, []);

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get branchId from localStorage
        let branchId = 1; // Default fallback
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.branchId) {
              branchId = user.branchId;
            }
          }
        } catch (err) {
          console.error('Error parsing user from localStorage:', err);
        }
        
        // Using axios to fetch members
        const response = await axios.get(`${BaseUrl}members/branch/${branchId}`);
        
        if (response.data && response.data.success) {
          // Transform API data to match component structure
          // Note: API returns data in 'items' array, not 'data'
          const transformedData = response.data.items.map(member => ({
            id: member.id,
            name: member.fullName,
            phone: member.phone,
            email: member.email,
            membership_plan: member.planId,
            start_date: member.membershipFrom,
            expiry_date: member.membershipTo,
            status: member.status,
            interested_in: member.interestedIn,
            preferred_time: member.preferredTime,
            notes: member.address,
            adminId: member.adminId,
            gender: member.gender,
            address: member.address,
            branchId: member.branchId,
            planId: member.planId,
            paymentMode: member.paymentMode,
            amountPaid: member.amountPaid,
            dateOfBirth: member.dateOfBirth
          }));
          
          setMembersData(transformedData);
        } else {
          setError('Failed to fetch members');
        }
      } catch (err) {
        setError('Error fetching members: ' + err.message);
        console.error('Error fetching members:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Create a new member
  const createMember = async (memberData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Transform component data to API format
      const apiData = {
        adminId: ADMIN_ID,
        fullName: memberData.name,
        email: memberData.email,
        password: "defaultPassword123", // Default password
        phone: memberData.phone,
        gender: "Not Specified",
        address: memberData.notes || "",
        branchId: 1, // Default branch ID
        planId: memberData.membership_plan,
        membershipFrom: memberData.start_date || new Date().toISOString(),
        membershipTo: memberData.expiry_date || null,
        paymentMode: "Cash",
        interestedIn: memberData.interested_in || "Not Specified",
        amountPaid: 12000,
        dateOfBirth: null,
        status: "Active"
      };

      const response = await axios.post(`${BaseUrl}members/create`, apiData);
      
      if (response.data && response.data.success) {
        await fetchMembers(); // Refresh members list
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Failed to create member' };
      }
    } catch (err) {
      setError('Error creating member: ' + err.message);
      console.error('Error creating member:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update a member
  const updateMember = async (id, memberData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Transform component data to API format
      const apiData = {
        fullName: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        gender: "Not Specified",
        address: memberData.notes || "",
        branchId: 1,
        planId: memberData.membership_plan,
        membershipFrom: memberData.start_date,
        membershipTo: memberData.expiry_date,
        paymentMode: "Cash",
        interestedIn: memberData.interested_in,
        amountPaid: 12000,
        dateOfBirth: null,
        status: "Active"
      };

      const response = await axios.put(`${BaseUrl}members/update/${id}`, apiData);
      
      if (response.data && response.data.success) {
        await fetchMembers(); // Refresh members list
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Failed to update member' };
      }
    } catch (err) {
      setError('Error updating member: ' + err.message);
      console.error('Error updating member:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a member
  const deleteMember = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${BaseUrl}members/delete/${id}`);
      
      if (response.data && response.data.success) {
        await fetchMembers(); // Refresh members list
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Failed to delete member' };
      }
    } catch (err) {
      setError('Error deleting member: ' + err.message);
      console.error('Error deleting member:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered data must be declared BEFORE it's used in pagination
  const filteredMembersData = membersData.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination States
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const totalPages = Math.ceil(filteredMembersData.length / entriesPerPage);

  // Current data to display based on pagination
  const currentData = filteredMembersData.slice(indexOfFirstEntry, indexOfLastEntry);

  // Handle entries per page change
  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when entries per page changes
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handlers
  const handleAddNew = () => {
    setModalType('add');
    setSelectedItem(null);
    // Reset form data
    setFormData({
      name: '',
      phone: '',
      email: '',
      membership_plan: '',
      start_date: '',
      expiry_date: '',
      interested_in: '',
      preferred_time: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleView = (member) => {
    setModalType('view');
    setSelectedItem(member);
    // Set form data with selected member
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      membership_plan: member.membership_plan || '',
      start_date: member.start_date || '',
      expiry_date: member.expiry_date || '',
      interested_in: member.interested_in || '',
      preferred_time: member.preferred_time || '',
      notes: member.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (member) => {
    setModalType('edit');
    setSelectedItem(member);
    // Set form data with selected member
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      membership_plan: member.membership_plan || '',
      start_date: member.start_date || '',
      expiry_date: member.expiry_date || '',
      interested_in: member.interested_in || '',
      preferred_time: member.preferred_time || '',
      notes: member.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (member) => {
    setSelectedItem(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      const result = await deleteMember(selectedItem.id);
      if (result.success) {
        alert(`Member record for ${selectedItem.name} has been deleted.`);
      } else {
        alert(`Failed to delete member: ${result.error}`);
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  // Handle form submission
  const handleSubmit = async (action) => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      alert('Name and email are required fields');
      return;
    }
    
    let result;
    if (modalType === 'add') {
      result = await createMember(formData);
    } else if (modalType === 'edit') {
      result = await updateMember(selectedItem.id, formData);
    }
    
    if (result && result.success) {
      closeModal();
      alert(`Member ${modalType === 'add' ? 'created' : 'updated'} successfully!`);
    } else {
      alert(`Failed to ${modalType} member: ${result?.error || 'Unknown error'}`);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      case 'add': return 'New Member Registration';
      case 'edit': return 'Edit Member Record';
      case 'view': return 'View Member Details';
      default: return 'Member Record';
    }
  };

  // Handle modal background click
  const handleModalBackgroundClick = (e) => {
    // Close modal only if clicked on the background (modal itself), not on its content
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Handle delete modal background click
  const handleDeleteModalBackgroundClick = (e) => {
    // Close modal only if clicked on the background (modal itself), not on its content
    if (e.target === e.currentTarget) {
      closeDeleteModal();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h1 className="h2 fw-bold">Member Management</h1>
          <p className="text-muted">Manage members and their details.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn btn-primary d-flex align-items-center justify-content-center w-100 w-lg-auto"
            onClick={handleAddNew}
          >
            <FaUserPlus className="me-2" /> Add Member
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Search & Actions */}
      <div className="row mb-4 g-3">
        {/* Search Bar */}
        <div className="col-12 col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="input-group-append">
              <span className="input-group-text bg-light">
                <i className="fas fa-search"></i>
              </span>
            </div>
          </div>
        </div>
        
        {/* Filter & Export Buttons */}
        <div className="col-12 col-md-6 d-flex gap-2">
          <button className="btn btn-outline-secondary flex-fill">
            <i className="fas fa-filter me-1"></i> Filter
          </button>
          <button className="btn btn-outline-secondary flex-fill">
            <i className="fas fa-file-export me-1"></i> Export
          </button>
        </div>
      </div>

      {/* Show Entries Dropdown */}
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center">
            <span className="me-2">Show</span>
            <select 
              className="form-select form-select-sm w-auto" 
              value={entriesPerPage}
              onChange={handleEntriesChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ms-2">entries</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold">NAME</th>
                <th className="fw-semibold d-none d-md-table-cell">PHONE</th>
                <th className="fw-semibold d-none d-lg-table-cell">EMAIL</th>
                <th className="fw-semibold d-none d-md-table-cell">PLAN</th>
                <th className="fw-semibold d-none d-md-table-cell">START</th>
                <th className="fw-semibold d-none d-md-table-cell">EXPIRY</th>
                <th className="fw-semibold text-center d-none d-md-table-cell">STATUS</th>
                <th className="fw-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="d-flex flex-column">
                        <strong>{member.name}</strong>
                        <div className="d-flex align-items-center mt-1">
                          <span className={`badge me-2 ${member.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                            {member.status}
                          </span>
                          <small className="text-muted d-none d-md-inline me-2">{member.phone}</small>
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">{member.phone}</td>
                    <td className="d-none d-lg-table-cell">{member.email || <span className="text-muted">—</span>}</td>
                    <td className="d-none d-md-table-cell">{member.membership_plan}</td>
                    <td className="d-none d-md-table-cell">{formatDate(member.start_date)}</td>
                    <td className="d-none d-md-table-cell">{formatDate(member.expiry_date)}</td>
                    <td className="text-center d-none d-md-table-cell">
                      <span className={`badge ${member.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="View"
                          onClick={() => handleView(member)}
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                          onClick={() => handleEdit(member)}
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDeleteClick(member)}
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    {searchTerm ? 'No matching member found.' : 'No member records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="row mt-3">
        <div className="col-12 col-md-5">
          <div className="d-flex align-items-center">
            <span className="text-muted">
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredMembersData.length)} of {filteredMembersData.length} entries
            </span>
          </div>
        </div>
        <div className="col-12 col-md-7">
          <div className="d-flex justify-content-center mt-2 mt-md-0">
            <nav>
              <ul className="pagination mb-0 flex-wrap">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={prevPage}>
                    Previous
                  </button>
                </li>
                
                {/* Simplified pagination for mobile */}
                {totalPages <= 5 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(page)}
                        style={{
                          backgroundColor: currentPage === page ? '#6EB2CC' : 'transparent',
                          borderColor: currentPage === page ? '#6EB2CC' : '#dee2e6',
                          color: currentPage === page ? 'white' : '#6EB2CC'
                        }}
                      >
                        {page}
                      </button>
                    </li>
                  ))
                ) : (
                  <>
                    <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(1)}
                        style={{
                          backgroundColor: currentPage === 1 ? '#6EB2CC' : 'transparent',
                          borderColor: currentPage === 1 ? '#6EB2CC' : '#dee2e6',
                          color: currentPage === 1 ? 'white' : '#6EB2CC'
                        }}
                      >
                        1
                      </button>
                    </li>
                    {currentPage > 3 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(totalPages)}
                        style={{
                          backgroundColor: currentPage === totalPages ? '#6EB2CC' : 'transparent',
                          borderColor: currentPage === totalPages ? '#6EB2CC' : '#dee2e6',
                          color: currentPage === totalPages ? 'white' : '#6EB2CC'
                        }}
                      >
                        {totalPages}
                      </button>
                    </li>
                  </>
                )}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={nextPage}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* MAIN MODAL (Add/Edit/View) */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleModalBackgroundClick}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{getModalTitle()}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form>
                  {/* MEMBER FORM */}
                  <div className="row mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Preferred Membership Plan</label>
                      <select
                        className="form-select"
                        name="membership_plan"
                        value={formData.membership_plan}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Select a plan</option>
                        {branchPlans?.map((plan, index) => (
                          <option key={index} value={plan.id}>{plan.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
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
                              checked={formData.interested_in === option}
                              onChange={handleInputChange}
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
                    <div className="col-12">
                      <label className="form-label">Preferred Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        name="preferred_time"
                        value={formData.preferred_time}
                        onChange={handleInputChange}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="notes"
                        placeholder="Any additional information..."
                        value={formData.notes}
                        onChange={handleInputChange}
                        readOnly={modalType === 'view'}
                      ></textarea>
                    </div>
                  </div>
                  {/* Action Buttons */}
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
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => handleSubmit('save')}
                      >
                        {modalType === 'add' ? 'Register Member' : 'Update Member'}
                      </button>
                    )}
                  </div>
                </form>
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
          onClick={handleDeleteModalBackgroundClick}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  This will permanently delete the member record for <strong>{selectedItem?.name}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 w-100 w-sm-auto"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 py-2 w-100 w-sm-auto"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistWalkinMember;