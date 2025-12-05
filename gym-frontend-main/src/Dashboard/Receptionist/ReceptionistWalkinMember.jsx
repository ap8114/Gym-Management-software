import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';

const ReceptionistWalkinMember = () => {
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'add', 'edit', 'view'
  const [selectedItem, setSelectedItem] = useState(null);
  // Search Term State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Member Data from API
  const [membersData, setMembersData] = useState([]);
  
  // API base URL
  const API_BASE_URL = 'https://gymnew-backend-5-dec-production.up.railway.app/api';
  const ADMIN_ID = 11; // Hardcoded admin ID as shown in the API example

  // Fetch members from API
  const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/members/admin/${ADMIN_ID}`);
      if (response.data.success) {
        // Transform API data to match component structure
        const transformedData = response.data.data.map(member => ({
          id: member.id,
          name: member.fullName,
          phone: member.phone,
          email: member.email,
          membership_plan: getPlanName(member.planId), // Helper function to get plan name
          start_date: formatDate(member.membershipFrom),
          expiry_date: formatDate(member.membershipTo),
          status: member.status,
          interested_in: member.interestedIn,
          preferred_time: member.membershipFrom,
          notes: member.address, // Using address as notes since API doesn't have notes field
          // Additional fields from API that might be needed
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

  // Helper function to get plan name from planId
  const getPlanName = (planId) => {
    // This is a placeholder - you might want to fetch plan names from API or have a mapping
    const plans = {
      1: "Basic Monthly",
      2: "Premium Annual",
      3: "Student Plan",
      4: "Weekend Warrior",
      5: "Corporate Package",
      6: "Premium Annual" // Based on the example payload
    };
    return plans[planId] || "Unknown Plan";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

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
        password: memberData.password || "defaultPassword123", // Default password if not provided
        phone: memberData.phone,
        gender: memberData.gender || "Not Specified",
        address: memberData.notes || "",
        branchId: 23, // Default branch ID from example
        planId: getPlanId(memberData.membership_plan), // Helper function to get plan ID
        membershipFrom: memberData.preferred_time || new Date().toISOString(),
        membershipTo: null, // API example shows null
        paymentMode: memberData.paymentMode || "Cash",
        interestedIn: memberData.interested_in || "Not Specified",
        amountPaid: memberData.amountPaid || 12000, // Default from example
        dateOfBirth: memberData.dateOfBirth || null,
        status: "Active"
      };

      const response = await axios.post(`${API_BASE_URL}/members/create`, apiData);
      if (response.data.success) {
        await fetchMembers(); // Refresh the members list
        return { success: true };
      } else {
        setError('Failed to create member');
        return { success: false, error: 'Failed to create member' };
      }
    } catch (err) {
      setError('Error creating member: ' + err.message);
      console.error('Error creating member:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get plan ID from plan name
  const getPlanId = (planName) => {
    // This is a placeholder - you might want to have a mapping or fetch from API
    const plans = {
      "Basic Monthly": 1,
      "Premium Annual": 2,
      "Student Plan": 3,
      "Weekend Warrior": 4,
      "Corporate Package": 5,
      "Premium Annual": 6 // Based on the example payload
    };
    return plans[planName] || 1; // Default to Basic Monthly if not found
  };

  // Update a member
  const updateMember = async (id, memberData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Transform component data to API format
      const apiData = {
        adminId: ADMIN_ID,
        fullName: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        gender: memberData.gender || "Not Specified",
        address: memberData.notes || "",
        branchId: memberData.branchId || 23,
        planId: getPlanId(memberData.membership_plan),
        membershipFrom: memberData.preferred_time || new Date().toISOString(),
        membershipTo: memberData.expiry_date ? new Date(memberData.expiry_date).toISOString() : null,
        paymentMode: memberData.paymentMode || "Cash",
        interestedIn: memberData.interested_in || "Not Specified",
        amountPaid: memberData.amountPaid || 12000,
        dateOfBirth: memberData.dateOfBirth || null,
        status: memberData.status || "Active"
      };

      const response = await axios.put(`${API_BASE_URL}/members/update/${id}`, apiData);
      if (response.data.success) {
        await fetchMembers(); // Refresh the members list
        return { success: true };
      } else {
        setError('Failed to update member');
        return { success: false, error: 'Failed to update member' };
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
      const response = await axios.delete(`${API_BASE_URL}/members/delete/${id}`);
      if (response.data.success) {
        await fetchMembers(); // Refresh the members list
        return { success: true };
      } else {
        setError('Failed to delete member');
        return { success: false, error: 'Failed to delete member' };
      }
    } catch (err) {
      setError('Error deleting member: ' + err.message);
      console.error('Error deleting member:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

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

  // Mock plans for dropdown (only used in Add/Edit modal)
  const membershipPlans = [
    "Basic Monthly",
    "Premium Annual",
    "Student Plan",
    "Weekend Warrior",
    "Corporate Package"
  ];

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
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    setModalType('view');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setModalType('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
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

  const handleSubmit = async (actionType) => {
    // Member form data collection
    const formData = {
      name: document.querySelector('input[placeholder="Enter full name"]')?.value || '',
      phone: document.querySelector('input[placeholder="+91 98765 43210"]')?.value || '',
      email: document.querySelector('input[placeholder="example@email.com"]')?.value || '',
      membership_plan: document.querySelector('select')?.value || '',
      interested_in: document.querySelector('input[name="interested_in"]:checked')?.value || '',
      preferred_time: document.querySelector('input[type="datetime-local"]')?.value || '',
      notes: document.querySelector('textarea')?.value || '',
      registered_at: new Date().toISOString()
    };

    // For Member-specific fields
    const memberFields = {
      membership_plan: formData.membership_plan,
      start_date: formData.registered_at.split('T')[0],
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Active"
    };

    if (modalType === 'add') {
      const result = await createMember({
        ...formData,
        ...memberFields
      });
      
      if (result.success) {
        alert(`New member ${formData.name} registered successfully!`);
        closeModal();
      } else {
        alert(`Failed to register member: ${result.error}`);
      }
    } else if (modalType === 'edit' && selectedItem) {
      const result = await updateMember(selectedItem.id, {
        ...formData,
        ...memberFields,
        branchId: selectedItem.branchId,
        planId: selectedItem.planId,
        paymentMode: selectedItem.paymentMode,
        amountPaid: selectedItem.amountPaid,
        dateOfBirth: selectedItem.dateOfBirth
      });
      
      if (result.success) {
        alert(`Member record for ${formData.name} updated successfully!`);
        closeModal();
      } else {
        alert(`Failed to update member: ${result.error}`);
      }
    }
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
            className="btn d-flex align-items-center justify-content-center w-100 w-md-auto ms-md-auto px-4 py-2"
            style={{
              backgroundColor: '#6EB2CC',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
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
                <th className="fw-semibold d-none d-lg-table-cell">START</th>
                <th className="fw-semibold d-none d-lg-table-cell">EXPIRY</th>
                <th className="fw-semibold text-center d-none d-md-table-cell">STATUS</th>
                <th className="fw-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {/* Member Data — Filtered and Paginated */}
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
                          <small className="text-muted d-md-none me-2">{member.phone}</small>
                          <span className={`badge ${member.status === 'Active' ? 'bg-success' : 'bg-danger'} d-md-none`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">{member.phone}</td>
                    <td className="d-none d-lg-table-cell">{member.email || <span className="text-muted">—</span>}</td>
                    <td className="d-none d-md-table-cell">{member.membership_plan}</td>
                    <td className="d-none d-lg-table-cell">{member.start_date}</td>
                    <td className="d-none d-lg-table-cell">{member.expiry_date || <span className="text-muted">—</span>}</td>
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
                  <td colSpan="8" className="text-center text-muted py-4">
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
          <div className="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
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
                          color: currentPage === page ? 'white' : '#6EB2CC',
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
                          color: currentPage === 1 ? 'white' : '#6EB2CC',
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
                    {currentPage > 2 && currentPage < totalPages - 1 && (
                      <li className={`page-item active`}>
                        <span className="page-link">{currentPage}</span>
                      </li>
                    )}
                    {currentPage < totalPages - 2 && (
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
                          color: currentPage === totalPages ? 'white' : '#6EB2CC',
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
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
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
                <form>
                  {/* MEMBER FORM */}
                  <>
                    {/* Name & Phone */}
                    <div className="row mb-3 g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Full Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter full name"
                          defaultValue={selectedItem?.name || ''}
                          readOnly={modalType === 'view'}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="+91 98765 43210"
                          defaultValue={selectedItem?.phone || ''}
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
                        className="form-control"
                        placeholder="example@email.com"
                        defaultValue={selectedItem?.email || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                    {/* Preferred Membership Plan */}
                    <div className="mb-3">
                      <label className="form-label">Preferred Membership Plan</label>
                      <select
                        className="form-select"
                        defaultValue={selectedItem?.membership_plan || ''}
                        disabled={modalType === 'view'}
                      >
                        <option value="">Select a plan</option>
                        {membershipPlans.map(plan => (
                          <option key={plan} value={plan}>{plan}</option>
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
                              defaultChecked={selectedItem?.interested_in === option}
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
                        className="form-control"
                        defaultValue={selectedItem?.preferred_time ? selectedItem.preferred_time.slice(0, 16) : ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                    {/* Notes — Optional field */}
                    <div className="mb-4">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Any additional information..."
                        defaultValue={selectedItem?.notes || ''}
                        readOnly={modalType === 'view'}
                      ></textarea>
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
                          }}
                          onClick={() => handleSubmit('save')}
                        >
                          {modalType === 'add' ? 'Register Member' : 'Update Member'}
                        </button>
                      )}
                    </div>
                  </>
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