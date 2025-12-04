import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaPlus, FaSearch, FaFilter, FaCaretDown } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from "../../../Api/axiosInstance"; // 🔁 Adjust path if needed

const ManageStaff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilterOpen, setRoleFilterOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [branchFilterOpen, setBranchFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const fileInputRef = useRef(null);

  // State for status
  const [staffStatus, setStaffStatus] = useState('Active');

  // Custom color for all blue elements
  const customColor = '#6EB2CC';

  // DYNAMIC BRANCHES — will be loaded from API
  const [branches, setBranches] = useState([]); // ← Updated: no hardcoded data
  const [branchesLoading, setBranchesLoading] = useState(true);

  // Sample staff data (unchanged)
  const [staff, setStaff] = useState([
    {
      id: 101,
      staff_id: "STAFF001",
      first_name: "Alex",
      last_name: "Martinez",
      gender: "Male",
      dob: "1985-03-15",
      email: "alex.martinez@gym.com",
      phone: "+1 555-123-4567",
      profile_photo: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "Active",
      role_id: "Manager",
      branch_id: 1,
      join_date: "2020-01-15",
      exit_date: null,
      salary_type: "Fixed",
      fixed_salary: 60000,
      login_enabled: true,
      username: "alex.m",
      password: "auto-generated"
    },
    // ... other sample staff
  ]);

  // 🔁 FETCH BRANCHES ON MOUNT USING USER ID FROM LOCAL STORAGE
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("No userId in localStorage");
      setBranchesLoading(false);
      return;
    }

    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get(`/branches/${userId}`);
        let branchList = [];

        // Handle both: { branch: {...} } and { branches: [...] } or direct array
        if (Array.isArray(response.data)) {
          branchList = response.data;
        } else if (response.data?.branch) {
          branchList = [response.data.branch];
        } else if (response.data?.branches && Array.isArray(response.data.branches)) {
          branchList = response.data.branches;
        } else {
          // Fallback: assume the whole response is a single branch object
          branchList = [response.data];
        }

        // Normalize branch objects
        const normalized = branchList.map(b => ({
          id: b.id,
          name: b.name || `Branch ${b.id}`,
        }));

        setBranches(normalized);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        alert("Failed to load branches. Using placeholder.");
        // Optional: set empty or sample branches
        setBranches([{ id: 1, name: "Default Branch" }]);
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Helper function to get branch name by ID
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : "Unknown";
  };

  // Filter staff based on search query and filters
  const filteredStaff = staff.filter(member => 
    (member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (roleFilter === 'All' || member.role_id === roleFilter) &&
    (statusFilter === 'All' || member.status === statusFilter) &&
    (branchFilter === 'All' || member.branch_id === parseInt(branchFilter))
  );

  const handleAddNew = () => {
    setModalType('add');
    setSelectedStaff(null);
    setStaffStatus('Active');
    setIsModalOpen(true);
  };

  const handleView = (staffMember) => {
    setModalType('view');
    setSelectedStaff(staffMember);
    setStaffStatus(staffMember.status || 'Active');
    setIsModalOpen(true);
  };

  const handleEdit = (staffMember) => {
    setModalType('edit');
    setSelectedStaff(staffMember);
    setStaffStatus(staffMember.status || 'Active');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedStaff) {
      setStaff(prev => prev.filter(s => s.id !== selectedStaff.id));
      alert(`Staff member "${selectedStaff.first_name} ${selectedStaff.last_name}" has been deleted.`);
    }
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
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

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleFilterOpen && !event.target.closest('.role-filter-dropdown')) {
        setRoleFilterOpen(false);
      }
      if (statusFilterOpen && !event.target.closest('.status-filter-dropdown')) {
        setStatusFilterOpen(false);
      }
      if (branchFilterOpen && !event.target.closest('.branch-filter-dropdown')) {
        setBranchFilterOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [roleFilterOpen, statusFilterOpen, branchFilterOpen]);

  const getStatusBadge = (status) => {
    const badgeClasses = {
      Active: "bg-success-subtle text-success-emphasis",
      Inactive: "bg-danger-subtle text-danger-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      Admin: "bg-primary-subtle text-primary-emphasis",
      Manager: "bg-info-subtle text-info-emphasis",
      Trainer: "bg-warning-subtle text-warning-emphasis",
      Receptionist: "bg-secondary-subtle text-secondary-emphasis",
      Housekeeping: "bg-success-subtle text-success-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${roleColors[role] || 'bg-light'} px-3 py-1`}>
        {role}
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return 'Add New Staff Member';
      case 'edit': return 'Edit Staff Member';
      case 'view': return 'View Staff Member';
      default: return 'Staff Management';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNextStaffId = () => {
    const prefix = "STAFF";
    const maxId = staff.length > 0 ? Math.max(...staff.map(s => parseInt(s.staff_id.replace(prefix, '')) || 0)) : 0;
    return `${prefix}${String(maxId + 1).padStart(3, '0')}`;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getInitialColor = (initials) => {
    const colors = [customColor, '#F4B400', '#E84A5F', '#4ECDC4', '#96CEB4', '#FFEAA7'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const clearFilters = () => {
    setRoleFilter('All');
    setStatusFilter('All');
    setBranchFilter('All');
  };

  const exportData = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Status', 'Branch'];
    const csvContent = [
      headers.join(','),
      ...filteredStaff.map(member => [
        member.staff_id,
        member.first_name,
        member.last_name,
        member.email,
        member.phone,
        member.role_id,
        member.status,
        getBranchName(member.branch_id)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `staff_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = () => {
    if (modalType === 'add') {
      const newStaff = {
        id: staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 101,
        staff_id: getNextStaffId(),
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        profile_photo: "",
        status: staffStatus,
        role_id: document.getElementById('role').value,
        branch_id: parseInt(document.getElementById('branch').value),
        join_date: document.getElementById('joinDate').value,
        exit_date: document.getElementById('exitDate').value || null,
        salary_type: "Fixed",
        fixed_salary: 0,
        login_enabled: document.getElementById('loginEnabled').checked,
        username: document.getElementById('username').value,
        password: document.getElementById('passwordField').value || 'auto-generated'
      };
      setStaff([...staff, newStaff]);
      alert('New staff member added successfully!');
    } else if (modalType === 'edit') {
      const updatedStaff = staff.map(member => {
        if (member.id === selectedStaff.id) {
          return {
            ...member,
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            gender: document.getElementById('gender').value,
            dob: document.getElementById('dob').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            status: staffStatus,
            role_id: document.getElementById('role').value,
            branch_id: parseInt(document.getElementById('branch').value),
            join_date: document.getElementById('joinDate').value,
            exit_date: document.getElementById('exitDate').value || null,
            login_enabled: document.getElementById('loginEnabled').checked,
            username: document.getElementById('username').value,
            password: document.getElementById('passwordField').value || member.password
          };
        }
        return member;
      });
      setStaff(updatedStaff);
      alert('Staff member updated successfully!');
    }
    closeModal();
  };

  return (
    <div className="container-fluid p-2 p-md-4">
      {/* Header */}
      <div className="row mb-3 mb-md-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold fs-4 fs-md-3">Staff Management</h2>
          <p className="text-muted mb-0 fs-6">Manage all gym staff members, their roles, and compensation.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn w-100 w-lg-auto"
            style={{
              backgroundColor: customColor,
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
            <FaPlus className="me-2" /> Add Staff
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="row mb-3 mb-md-4 g-3 align-items-center">
        <div className="col-12 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-light border">
              <FaSearch style={{ color: customColor }} />
            </span>
            <input
              type="text"
              className="form-control border"
              placeholder="Search staff by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
            <div className="role-filter-dropdown">
              <button 
                className="btn btn-outline-secondary btn-sm dropdown-toggle" 
                type="button" 
                onClick={() => setRoleFilterOpen(!roleFilterOpen)}
              >
                <span>Role</span>
                <FaCaretDown className="ms-1" />
              </button>
              <div className={`dropdown-menu ${roleFilterOpen ? 'show' : ''}`}>
                <button 
                  className={`dropdown-item ${roleFilter === 'All' ? 'active' : ''}`}
                  onClick={() => { setRoleFilter('All'); setRoleFilterOpen(false); }}
                >
                  All Roles
                </button>
                <button className={`dropdown-item ${roleFilter === 'Manager' ? 'active' : ''}`} onClick={() => { setRoleFilter('Manager'); setRoleFilterOpen(false); }}>Manager</button>
                <button className={`dropdown-item ${roleFilter === 'Trainer' ? 'active' : ''}`} onClick={() => { setRoleFilter('Trainer'); setRoleFilterOpen(false); }}>Trainer</button>
                <button className={`dropdown-item ${roleFilter === 'Receptionist' ? 'active' : ''}`} onClick={() => { setRoleFilter('Receptionist'); setRoleFilterOpen(false); }}>Receptionist</button>
              </div>
            </div>

            <div className="status-filter-dropdown">
              <button 
                className="btn btn-outline-secondary btn-sm dropdown-toggle" 
                type="button" 
                onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              >
                <span>Status</span>
                <FaCaretDown className="ms-1" />
              </button>
              <div className={`dropdown-menu ${statusFilterOpen ? 'show' : ''}`}>
                <button className={`dropdown-item ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => { setStatusFilter('All'); setStatusFilterOpen(false); }}>All Status</button>
                <button className={`dropdown-item ${statusFilter === 'Active' ? 'active' : ''}`} onClick={() => { setStatusFilter('Active'); setStatusFilterOpen(false); }}>Active</button>
                <button className={`dropdown-item ${statusFilter === 'Inactive' ? 'active' : ''}`} onClick={() => { setStatusFilter('Inactive'); setStatusFilterOpen(false); }}>Inactive</button>
              </div>
            </div>

            <div className="branch-filter-dropdown">
              <button 
                className="btn btn-outline-secondary btn-sm dropdown-toggle" 
                type="button" 
                onClick={() => setBranchFilterOpen(!branchFilterOpen)}
              >
                <span>Branch</span>
                <FaCaretDown className="ms-1" />
              </button>
              <div className={`dropdown-menu ${branchFilterOpen ? 'show' : ''}`}>
                <button 
                  className={`dropdown-item ${branchFilter === 'All' ? 'active' : ''}`}
                  onClick={() => { setBranchFilter('All'); setBranchFilterOpen(false); }}
                >
                  All Branches
                </button>
                {branches.map(branch => (
                  <button 
                    key={branch.id}
                    className={`dropdown-item ${branchFilter === branch.id.toString() ? 'active' : ''}`}
                    onClick={() => {
                      setBranchFilter(branch.id.toString());
                      setBranchFilterOpen(false);
                    }}
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="d-none d-md-block">
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>PHOTO</th>
                  <th>NAME</th>
                  <th>ROLE</th>
                  <th className="d-none d-lg-table-cell">EMAIL</th>
                  <th className="d-none d-lg-table-cell">PHONE</th>
                  <th>BRANCH</th>
                  <th>STATUS</th>
                  <th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      {member.profile_photo ? (
                        <img src={member.profile_photo} alt={`${member.first_name} ${member.last_name}`} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                      ) : (
                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: getInitialColor(getInitials(member.first_name, member.last_name)) }}>
                          {getInitials(member.first_name, member.last_name)}
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{member.first_name} {member.last_name}</strong>
                      <div><small className="text-muted">{member.staff_id}</small></div>
                    </td>
                    <td>{getRoleBadge(member.role_id)}</td>
                    <td className="d-none d-lg-table-cell">{member.email}</td>
                    <td className="d-none d-lg-table-cell">{member.phone}</td>
                    <td><span className="badge bg-light text-dark">{getBranchName(member.branch_id)}</span></td>
                    <td>{getStatusBadge(member.status)}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center flex-nowrap" style={{ gap: '4px' }}>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleView(member)}><FaEye size={14} /></button>
                        <button className="btn btn-sm" style={{ borderColor: customColor, color: customColor }} onClick={() => handleEdit(member)}><FaEdit size={14} /></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(member)}><FaTrashAlt size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-md-none">
        {filteredStaff.map((member) => (
          <div className="card shadow-sm border-0 mb-3" key={member.id}>
            <div className="card-body p-3">
              <div className="d-flex align-items-start mb-3">
                {member.profile_photo ? (
                  <img src={member.profile_photo} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                ) : (
                  <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px', fontSize: '1.2rem', fontWeight: 'bold', backgroundColor: getInitialColor(getInitials(member.first_name, member.last_name)) }}>
                    {getInitials(member.first_name, member.last_name)}
                  </div>
                )}
                <div className="flex-grow-1">
                  <h5 className="mb-1">{member.first_name} {member.last_name}</h5>
                  <p className="text-muted small mb-2">{member.staff_id}</p>
                  <div className="d-flex gap-2 flex-wrap">{getRoleBadge(member.role_id)} {getStatusBadge(member.status)}</div>
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-12"><small className="text-muted d-block">Email</small><span>{member.email}</span></div>
                <div className="col-12"><small className="text-muted d-block">Phone</small><span>{member.phone}</span></div>
                <div className="col-12"><small className="text-muted d-block">Branch</small><span className="badge bg-light text-dark">{getBranchName(member.branch_id)}</span></div>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleView(member)}><FaEye size={14} /></button>
                <button className="btn btn-sm" style={{ borderColor: customColor, color: customColor }} onClick={() => handleEdit(member)}><FaEdit size={14} /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(member)}><FaTrashAlt size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN MODAL */}
      {isModalOpen && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title fw-bold">{getModalTitle()}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
                  {/* Basic Info */}
                  <h6 className="fw-bold mb-3">Basic Information</h6>
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Profile Photo</label>
                      <input type="file" className="form-control rounded-3" accept="image/*" ref={fileInputRef} disabled={modalType === 'view'} />
                    </div>
                    {/* ... other basic fields unchanged ... */}
                    <div className="col-12">
                      <label className="form-label">Status</label>
                      <select className="form-select rounded-3" value={staffStatus} onChange={(e) => setStaffStatus(e.target.value)} disabled={modalType === 'view'}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Job Details */}
                  <h6 className="fw-bold mb-3">Job Details</h6>
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Role <span className="text-danger">*</span></label>
                      <select className="form-select rounded-3" id="role" defaultValue={selectedStaff?.role_id || 'Receptionist'} disabled={modalType === 'view'} required>
                        <option value="Manager">Manager</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Housekeeping">Housekeeping</option>
                      </select>
                    </div>

                    {/* ✅ DYNAMIC BRANCH DROPDOWN */}
                    <div className="col-12 col-md-6">
                      <label className="form-label">Branch <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        id="branch"
                        value={selectedStaff?.branch_id || (branches.length > 0 ? branches[0].id : '')}
                        disabled={modalType === 'view' || branchesLoading}
                        required
                      >
                        {branchesLoading ? (
                          <option>Loading branches...</option>
                        ) : branches.length > 0 ? (
                          branches.map(branch => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                          ))
                        ) : (
                          <option>No branches available</option>
                        )}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Join Date <span className="text-danger">*</span></label>
                      <input type="date" className="form-control rounded-3" id="joinDate" defaultValue={selectedStaff?.join_date || new Date().toISOString().split('T')[0]} readOnly={modalType === 'view'} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Exit Date</label>
                      <input type="date" className="form-control rounded-3" id="exitDate" defaultValue={selectedStaff?.exit_date || ''} readOnly={modalType === 'view'} />
                    </div>
                  </div>

                  {/* System Access */}
                  <h6 className="fw-bold mb-3">System Access</h6>
                  <div className="row mb-3 g-3">
                    {/* ... unchanged ... */}
                  </div>

                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-outline-secondary px-4 py-2 w-100 w-sm-auto" onClick={closeModal}>Cancel</button>
                    {modalType !== 'view' && (
                      <button type="submit" className="btn w-100 w-sm-auto" style={{ backgroundColor: customColor, color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}>
                        {modalType === 'add' ? 'Add Staff' : 'Update Staff'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeDeleteModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3"><i className="fas fa-exclamation-triangle"></i></div>
                <h5>Are you sure?</h5>
                <p className="text-muted">This will permanently delete <strong>{selectedStaff?.first_name} {selectedStaff?.last_name}</strong>.<br />This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button type="button" className="btn btn-outline-secondary px-4 w-100 w-sm-auto" onClick={closeDeleteModal}>Cancel</button>
                <button type="button" className="btn btn-danger px-4 w-100 w-sm-auto" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Keep your existing global styles */
        .action-btn {
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .action-btn { width: 32px; height: 32px; }
        }
        .role-filter-dropdown, .status-filter-dropdown, .branch-filter-dropdown {
          position: relative;
        }
        .dropdown-menu {
          min-width: 200px;
          z-index: 1050;
        }
        .dropdown-item.active {
          background-color: ${customColor} !important;
          color: white !important;
        }
        /* Add responsive styles as before */
      `}</style>
    </div>
  );
};

export default ManageStaff;