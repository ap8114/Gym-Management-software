import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaPlus, FaSearch, FaFilter, FaCaretDown } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import GetAdminId from '../../../Api/GetAdminId';
import axiosInstance from "../../../Api/axiosInstance"; // 🔁 Adjust path if needed

const ManageStaff = () => {
  const adminId = GetAdminId();
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
  
  // Form state for controlled inputs
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Receptionist',
    // branch: '', // Commented out branch field
    gender: 'Male',
    dateOfBirth: '',
    joinDate: new Date().toISOString().split('T')[0],
    exitDate: ''
  });
  
  // State for status
  const [staffStatus, setStaffStatus] = useState('Active');
  
  // Custom color for all blue elements
  const customColor = '#6EB2CC';
  
  // DYNAMIC BRANCHES — will be loaded from API
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  
  // Staff data from API
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  
  // Role ID mappings - Updated to match API expectations
  const roleIds = {
    'Manager': 2,
    'generaltrainer': 6,
    'personaltrainer': 5,
    'Receptionist': 7,
    'Housekeeping': 8
  };

  // Normalize server staff object to frontend model
  const normalizeStaffItem = (item) => {
    if (!item) return null;
    return {
      id: item.staffId ?? item.id,
      userId: item.userId ?? null,
      fullName: item.fullName ?? item.name ?? '',
      email: item.email ?? '',
      phone: item.phone ?? '',
      roleId: item.roleId ?? null,
      branchId: item.branchId ?? null, // Keep branchId for data consistency but not display
      adminId: item.adminId ?? null,
      gender: item.gender ?? null,
      dateOfBirth: item.dateOfBirth ?? item.dob ?? null,
      joinDate: item.joinDate ?? null,
      exitDate: item.exitDate ?? null,
      profilePhoto: item.profilePhoto ?? item.avatar ?? null,
      status: item.status ?? null,
      _raw: item,
    };
  };
  
  // Get role name from ID
  const getRoleName = (roleId) => {
    const roleEntry = Object.entries(roleIds).find(([name, id]) => id === roleId);
    return roleEntry ? roleEntry[0] : 'Unknown';
  };
  
  // FETCH STAFF ON MOUNT
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axiosInstance.get('/staff/all');
        if (response.data && response.data.success && response.data.staff) {
          const staffArr = Array.isArray(response.data.staff) ? response.data.staff : [response.data.staff];
          const normalized = staffArr.map(normalizeStaffItem);
          setStaff(normalized);
        } else if (response.data && Array.isArray(response.data)) {
          // fallback if API returns array directly
          setStaff(response.data.map(normalizeStaffItem));
        } else {
          console.error("Unexpected API response format:", response.data);
          setStaff([]);
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        alert("Failed to load staff data.");
        setStaff([]);
      } finally {
        setStaffLoading(false);
      }
    };
    
    fetchStaff();
  }, []);
  
  // FETCH BRANCHES ON MOUNT USING USER ID FROM LOCAL STORAGE
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("No userId in localStorage");
      setBranchesLoading(false);
      return;
    }
    
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get(`/branches/by-admin/${adminId}`);
        let branchList = [];
        
        // Handle both: { branch: {...} } and { branches: [...] } or direct array
        if (Array.isArray(response.data)) {
          branchList = response.data;
        } else if (response.data?.branch) {
          branchList = [response.data.branch];
        } else if (response.data?.branches && Array.isArray(response.data.branches)) {
          branchList = response.data.branches;
        } else {
          // Fallback: assume whole response is a single branch object
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
  }, [adminId]);
  
  // Helper function to get branch name by ID
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : "Unknown";
  };
  
  // Filter staff based on search query and filters
  const filteredStaff = staff.filter(member => 
    (member.fullName && member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone && member.phone.includes(searchQuery.toLowerCase())) &&
    (roleFilter === 'All' || member.roleId === roleIds[roleFilter]) &&
    (statusFilter === 'All' || member.status === statusFilter)
    // Removed branch filter: (branchFilter === 'All' || member.branchId === parseInt(branchFilter))
  );
  
  const handleAddNew = () => {
    setModalType('add');
    setSelectedStaff(null);
    setStaffStatus('Active');
    // Reset form data
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'Receptionist',
      // branch: branches.length > 0 ? branches[0].id.toString() : '', // Commented out branch field
      gender: 'Male',
      dateOfBirth: '',
      joinDate: new Date().toISOString().split('T')[0],
      exitDate: ''
    });
    setIsModalOpen(true);
  };
  
  const handleView = (staffMember) => {
    setModalType('view');
    setSelectedStaff(staffMember);
    setStaffStatus(staffMember.status || 'Active');
    // Populate form with staff data
    setFormData({
      fullName: staffMember.fullName || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      password: '',
      role: getRoleName(staffMember.roleId) || 'Receptionist',
      // branch: staffMember.branchId?.toString() || '', // Commented out branch field
      gender: staffMember.gender || 'Male',
      dateOfBirth: staffMember.dateOfBirth ? new Date(staffMember.dateOfBirth).toISOString().split('T')[0] : '',
      joinDate: staffMember.joinDate ? new Date(staffMember.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      exitDate: staffMember.exitDate ? new Date(staffMember.exitDate).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };
  
  const handleEdit = (staffMember) => {
    setModalType('edit');
    setSelectedStaff(staffMember);
    setStaffStatus(staffMember.status || 'Active');
    // Populate form with staff data
    setFormData({
      fullName: staffMember.fullName || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      password: '',
      role: getRoleName(staffMember.roleId) || 'Receptionist',
      // branch: staffMember.branchId?.toString() || '', // Commented out branch field
      gender: staffMember.gender || 'Male',
      dateOfBirth: staffMember.dateOfBirth ? new Date(staffMember.dateOfBirth).toISOString().split('T')[0] : '',
      joinDate: staffMember.joinDate ? new Date(staffMember.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      exitDate: staffMember.exitDate ? new Date(staffMember.exitDate).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (selectedStaff) {
      try {
        const response = await axiosInstance.delete(`/staff/delete/${selectedStaff.id}`);
        if (response.data && response.data.success) {
          setStaff(prev => prev.filter(s => s.id !== selectedStaff.id));
          alert(`Staff member "${selectedStaff.fullName}" has been deleted.`);
        } else {
          console.error('Delete failed:', response.data);
          alert('Failed to delete staff member. Please try again.');
        }
      } catch (error) {
        console.error("Failed to delete staff:", error);
        alert("Failed to delete staff member. Please try again.");
      }
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
  
  const getRoleBadge = (roleId) => {
    const roleName = getRoleName(roleId);
    const roleColors = {
      Manager: "bg-info-subtle text-info-emphasis",
      generaltrainer: "bg-warning-subtle text-warning-emphasis",
      personaltrainer: "bg-primary-subtle text-primary-emphasis",
      Receptionist: "bg-secondary-subtle text-secondary-emphasis",
      Housekeeping: "bg-success-subtle text-success-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${roleColors[roleName] || 'bg-light'} px-3 py-1`}>
        {roleName === 'generaltrainer' ? 'General Trainer' : 
         roleName === 'personaltrainer' ? 'Personal Trainer' : 
         roleName}
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
  
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length-1].charAt(0)}`.toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  };
  
  const getInitialColor = (initials) => {
    const colors = [customColor, '#F4B400', '#E84A5F', '#4ECDC4', '#96CEB4', '#FFEAA7'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  const clearFilters = () => {
    setRoleFilter('All');
    setStatusFilter('All');
    // setBranchFilter('All'); // Commented out branch filter
  };
  
  const exportData = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Role', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredStaff.map(member => [
        member.id,
        member.fullName,
        member.email,
        member.phone,
        getRoleName(member.roleId),
        member.status || 'Active'
        // Removed branch: getBranchName(member.branchId)
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
  
  const handleFormSubmit = async () => {
    if (!adminId) {
      alert("Admin ID not found. Please log in again.");
      return;
    }
    
    try {
      // Create JSON payload instead of FormData
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        roleId: roleIds[formData.role],
        // branchId: parseInt(formData.branch), // Commented out branch field
        adminId: parseInt(adminId),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        joinDate: formData.joinDate,
        exitDate: formData.exitDate || null,
        status: staffStatus,
        profilePhoto: "uploads/staff/default.png" // Default profile photo
      };
      
      // Handle profile photo if provided (this would need to be uploaded separately)
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        // In a real implementation, you would first upload file
        // and then use returned path in payload
        // For now, we'll use a placeholder
        payload.profilePhoto = "uploads/staff/custom.png";
      }
      
      if (modalType === 'add') {
        const response = await axiosInstance.post('/staff/create', payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success) {
          // Add new staff member to list
          const newStaff = normalizeStaffItem(response.data.staff);
          setStaff(prev => [...prev, newStaff]);
          alert("Staff member added successfully!");
          closeModal();
        } else {
          console.error('Add failed:', response.data);
          alert('Failed to add staff member. Please try again.');
        }
      } else if (modalType === 'edit') {
        // For edit, don't include password if it's empty
        if (!payload.password) {
          delete payload.password;
        }
        
        const response = await axiosInstance.put(`/staff/update/${selectedStaff.id}`, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success) {
          // Update staff member in list
          const updatedStaff = normalizeStaffItem(response.data.staff);
          setStaff(prev => prev.map(s => s.id === selectedStaff.id ? updatedStaff : s));
          alert("Staff member updated successfully!");
          closeModal();
        } else {
          console.error('Update failed:', response.data);
          alert('Failed to update staff member. Please try again.');
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      alert(`Failed to ${modalType === 'add' ? 'add' : 'update'} staff member. Please try again.`);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
              placeholder="Search staff by name or email..."
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
                {Object.keys(roleIds).map(role => (
                  <button 
                    key={role}
                    className={`dropdown-item ${roleFilter === role ? 'active' : ''}`} 
                    onClick={() => { setRoleFilter(role); setRoleFilterOpen(false); }}
                  >
                    {role === 'generaltrainer' ? 'General Trainer' : 
                     role === 'personaltrainer' ? 'Personal Trainer' : 
                     role}
                  </button>
                ))}
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
            
            {/* Commented out branch filter
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
            */}
            
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
                  {/* <th>PHOTO</th> */}
                  <th>NAME</th>
                  <th>ROLE</th>
                  <th className="d-none d-lg-table-cell">EMAIL</th>
                  <th className="d-none d-lg-table-cell">PHONE</th>
                  {/* <th>BRANCH</th> Commented out branch column */}
                  <th>STATUS</th>
                  <th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    {/* <td>
                      {member.profilePhoto ? (
                        <img src={member.profilePhoto} alt={member.fullName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                      ) : (
                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: getInitialColor(getInitials(member.fullName)) }}>
                          {getInitials(member.fullName)}
                        </div>
                      )}
                    </td> */}
                    <td>
                      <strong>{member.fullName}</strong>
                     
                    </td>
                    <td>{getRoleBadge(member.roleId)}</td>
                    <td className="d-none d-lg-table-cell">{member.email}</td>
                    <td className="d-none d-lg-table-cell">{member.phone}</td>
                    {/* <td><span className="badge bg-light text-dark">{getBranchName(member.branchId)}</span></td> Commented out branch column */}
                    <td>{getStatusBadge(member.status || 'Active')}</td>
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
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                ) : (
                  <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px', fontSize: '1.2rem', fontWeight: 'bold', backgroundColor: getInitialColor(getInitials(member.fullName)) }}>
                    {getInitials(member.fullName)}
                  </div>
                )}
                <div className="flex-grow-1">
                  <h5 className="mb-1">{member.fullName}</h5>
                  <p className="text-muted small mb-2">ID: {member.id}</p>
                  <div className="d-flex gap-2 flex-wrap">{getRoleBadge(member.roleId)} {getStatusBadge(member.status || 'Active')}</div>
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-12"><small className="text-muted d-block">Email</small><span>{member.email}</span></div>
                <div className="col-12"><small className="text-muted d-block">Phone</small><span>{member.phone}</span></div>
                {/* <div className="col-12"><small className="text-muted d-block">Branch</small><span className="badge bg-light text-dark">{getBranchName(member.branchId)}</span></div> Commented out branch field */}
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
                      <label className="form-label">Full Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        name="fullName"
                        value={formData.fullName} 
                        onChange={handleInputChange}
                        disabled={modalType === 'view'} 
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input 
                        type="email" 
                        className="form-control rounded-3" 
                        name="email"
                        value={formData.email} 
                        onChange={handleInputChange}
                        disabled={modalType === 'view'} 
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone <span className="text-danger">*</span></label>
                      <input 
                        type="tel" 
                        className="form-control rounded-3" 
                        name="phone"
                        value={formData.phone} 
                        onChange={handleInputChange}
                        disabled={modalType === 'view'} 
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Password {modalType === 'add' && <span className="text-danger">*</span>}</label>
                      <input 
                        type="password" 
                        className="form-control rounded-3" 
                        name="password"
                        value={formData.password} 
                        onChange={handleInputChange}
                        placeholder={modalType === 'edit' ? "Leave blank to keep current password" : ""} 
                        disabled={modalType === 'view'} 
                        required={modalType === 'add'} 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Gender <span className="text-danger">*</span></label>
                      <select 
                        className="form-select rounded-3" 
                        name="gender"
                        value={formData.gender} 
                        onChange={handleInputChange}
                        disabled={modalType === 'view'} 
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        name="dateOfBirth"
                        value={formData.dateOfBirth} 
                        onChange={handleInputChange}
                        disabled={modalType === 'view'} 
                        required 
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Profile Photo</label>
                      <input type="file" className="form-control rounded-3" accept="image/*" ref={fileInputRef} disabled={modalType === 'view'} />
                    </div>
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
                      <select 
                        className="form-select rounded-3" 
                        name="role"
                        value={formData.role} 
                        onChange={handleInputChange}
                        disabled={modalType === 'view'} 
                        required
                      >
                        {Object.keys(roleIds).map(role => (
                          <option key={role} value={role}>
                            {role === 'generaltrainer' ? 'General Trainer' : 
                             role === 'personaltrainer' ? 'Personal Trainer' : 
                             role}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Commented out branch field
                    <div className="col-12 col-md-6">
                      <label className="form-label">Branch <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
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
                    */}
                    
                    <div className="col-12 col-md-6">
                      <label className="form-label">Join Date <span className="text-danger">*</span></label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        name="joinDate"
                        value={formData.joinDate} 
                        onChange={handleInputChange}
                        disabled={modalType === 'view'} 
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Exit Date</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        name="exitDate"
                        value={formData.exitDate} 
                        onChange={handleInputChange}
                        disabled={modalType === 'view'} 
                      />
                    </div>
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
                <p className="text-muted">This will permanently delete <strong>{selectedStaff?.fullName}</strong>.<br />This action cannot be undone.</p>
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