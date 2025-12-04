import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaUserPlus } from 'react-icons/fa';

const ReceptionistWalkinMember = () => {
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'add', 'edit', 'view'
  const [selectedItem, setSelectedItem] = useState(null);
  // Search Term State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock Member Data
  const [membersData, setMembersData] = useState([
    {
      id: 201,
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      email: "rahul@example.com",
      membership_plan: "Premium Annual",
      start_date: "2025-01-01",
      expiry_date: "2026-01-01",
      status: "Active"
    },
    {
      id: 202,
      name: "Priya Patel",
      phone: "+91 91234 56789",
      email: "priya@example.com",
      membership_plan: "Basic Monthly",
      start_date: "2025-03-01",
      expiry_date: "2025-04-01",
      status: "Active"
    },
    {
      id: 203,
      name: "Ankit Mehta",
      phone: "+91 88888 11111",
      email: "ankit@example.com",
      membership_plan: "Student Plan",
      start_date: "2024-12-01",
      expiry_date: "2025-01-01",
      status: "Expired"
    }
  ]);

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

  const confirmDelete = () => {
    if (selectedItem) {
      setMembersData(prev => prev.filter(m => m.id !== selectedItem.id));
      alert(`Member record for ${selectedItem.name} has been deleted.`);
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

  const getNextId = () => {
    return membersData.length > 0 ? Math.max(...membersData.map(m => m.id)) + 1 : 1;
  };

  const handleSubmit = (actionType) => {
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
      const newItem = {
        id: getNextId(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        membership_plan: formData.membership_plan,
        start_date: memberFields.start_date,
        expiry_date: memberFields.expiry_date,
        status: memberFields.status,
        interested_in: formData.interested_in,
        preferred_time: formData.preferred_time,
        notes: formData.notes
      };
      setMembersData(prev => [...prev, newItem]);
      alert(`New member ${newItem.name} registered successfully!`);
    } else if (modalType === 'edit' && selectedItem) {
      const updatedItem = {
        ...selectedItem,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        membership_plan: formData.membership_plan || selectedItem.membership_plan,
        interested_in: formData.interested_in || selectedItem.interested_in,
        preferred_time: formData.preferred_time || selectedItem.preferred_time,
        notes: formData.notes || selectedItem.notes
      };
      setMembersData(prev => prev.map(m => m.id === selectedItem.id ? updatedItem : m));
      alert(`Member record for ${updatedItem.name} updated successfully!`);
    }
    closeModal();
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
              {currentData.length > 0 ? (
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
                    <td className="d-none d-lg-table-cell">{member.expiry_date}</td>
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