import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrashAlt, FaEdit, FaEye, FaSearch, FaFileExport, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import GetAdminId from '../../../Api/GetAdminId';
import axiosInstance from '../../../Api/axiosInstance';
import BaseUrl from '../../../Api/BaseUrl';

const StaffAttendance = () => {
  const adminId = GetAdminId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Add state for branches and staff members
  const [branches, setBranches] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Custom color for all blue elements
  const customColor = "#6EB2CC";

  // Fetch branches and staff data on component mount
  useEffect(() => {
    fetchBranches();
    fetchStaffMembers();
    fetchAttendanceRecords();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}branches/by-admin/${adminId}`);
      console.log('Branches API response:', response.data);
      
      if (response.data.success) {
        setBranches(response.data.branches);
      } else {
        setError('Failed to load branches');
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}staff/all`);
      console.log('Staff API response:', response.data);
      
      if (response.data.success) {
        // Transform API response to match component's expected format
        const transformedStaff = response.data.staff.map(staff => ({
          id: staff.staffId,
          staffId: staff.staffId,
          name: staff.fullName,
          role: getRoleName(staff.roleId),
          branch: getBranchName(staff.branchId),
          email: staff.email,
          phone: staff.phone,
          branchId: staff.branchId,
          roleId: staff.roleId
        }));
        setStaffMembers(transformedStaff);
      } else {
        setError('Failed to load staff data');
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate shift type based on check-in time
  const calculateShiftType = (checkInTime) => {
    if (!checkInTime) return 'Unknown';
    
    try {
      const date = new Date(checkInTime);
      const hours = date.getHours();
      
      // Define shift ranges
      if (hours >= 5 && hours < 12) {
        return 'Morning Shift';
      } else if (hours >= 12 && hours < 17) {
        return 'Day Shift';
      } else if (hours >= 17 && hours < 22) {
        return 'Evening Shift';
      } else {
        return 'Night Shift';
      }
    } catch (err) {
      console.error('Error calculating shift type:', err);
      return 'Unknown';
    }
  };

  // Fetch attendance records from API
  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}memberattendence/admin?adminId=${adminId}`);
      console.log('Attendance API response:', response.data);
      
      if (response.data && response.data.success && Array.isArray(response.data.attendance)) {
        // Transform API response to match component's expected format
        const transformedRecords = response.data.attendance.map(record => {
          // Determine if it's a staff member or member
          const isStaff = record.staffId !== null;
          const name = isStaff ? record.staffName : record.memberName || 'Unknown';
          const role = isStaff ? record.staffRole : record.memberRole || 'Member';
          
          return {
            attendance_id: record.id,
            staff_id: record.staffId,
            staff_name: name,
            role: role,
            branch: getBranchName(record.branchId),
            date: record.checkIn ? record.checkIn.split('T')[0] : '',
            checkin_time: record.checkIn,
            checkout_time: record.checkOut,
            mode: record.mode,
            shift_id: record.shiftId,
            shift_name: record.shiftType || calculateShiftType(record.checkIn), // Use shiftType from API or calculate
            status: record.status,
            notes: record.notes,
            member_id: record.memberId
          };
        });
        setRecords(transformedRecords);
      } else {
        setError('Failed to load attendance records');
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance records by branch
  const fetchAttendanceByBranch = async (branchId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${BaseUrl}admin-staff-attendance/branch/${branchId}`);
      console.log('Attendance by branch API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform API response to match component's expected format
        const transformedRecords = response.data.map(record => ({
          attendance_id: record.id,
          staff_id: record.staffId,
          staff_name: record.staffName,
          role: getRoleNameFromStaff(record.staffId),
          branch: record.branchName,
          date: record.date,
          checkin_time: record.checkInTime,
          checkout_time: record.checkOutTime,
          mode: record.mode,
          shift_id: record.shiftId,
          shift_name: record.shiftType || calculateShiftType(record.checkInTime), // Use shiftType from API or calculate
          status: record.status,
          notes: record.notes
        }));
        setRecords(transformedRecords);
      } else {
        setError('Failed to load attendance records for this branch');
      }
    } catch (err) {
      console.error('Error fetching attendance records by branch:', err);
      setError('Failed to load attendance records for this branch');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get staff name from staffId
  const getStaffName = (staffId) => {
    const staff = staffMembers.find(s => s.staffId === staffId);
    return staff ? staff.name : 'Unknown';
  };

  // Helper function to get role name from roleId - Updated with all role IDs
  const getRoleName = (roleId) => {
    const roles = {
      1: 'Admin',
      2: 'Manager',
      3: 'Trainer',
      4: 'Receptionist',
      5: 'Personal Trainer',
      6: 'General Trainer',
      7: 'Receptionist',
      8: 'Housekeeping'
    };
    return roles[roleId] || 'Unknown';
  };

  // Helper function to get role name from staff ID
  const getRoleNameFromStaff = (staffId) => {
    const staff = staffMembers.find(s => s.staffId === staffId);
    return staff ? staff.role : 'Unknown';
  };

  // Helper function to get branch name from branchId
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown';
  };

  // Helper function to get shift name from shiftId
  const getShiftName = (shiftId) => {
    const shifts = [
      { id: 1, name: "Morning Shift" },
      { id: 2, name: "Day Shift" },
      { id: 3, name: "Evening Shift" },
      { id: 4, name: "Night Shift" }
    ];
    const shift = shifts.find(s => s.id === shiftId);
    return shift ? shift.name : 'Unknown';
  };

  // Set records state
  const [records, setRecords] = useState([]);

  const shifts = [
    { id: 1, name: "Morning Shift" },
    { id: 2, name: "Day Shift" },
    { id: 3, name: "Evening Shift" },
    { id: 4, name: "Night Shift" }
  ];

  // Get unique options for dropdowns
  const allRoles = ['All', ...new Set(staffMembers.map(s => s.role))];
  const allStatuses = ['All', 'Present', 'Late', 'Absent', 'Overtime'];
  const allBranches = ['All', ...new Set(branches.map(b => b.name))];

  // Filter records based on search term AND filters
  const filteredRecords = records.filter(record =>
    (record.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     record.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
     record.status.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'All' || record.role === roleFilter) &&
    (statusFilter === 'All' || record.status === statusFilter)
  );

  const handleAddNew = () => {
    setModalType('add');
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleView = (record) => {
    setModalType('view');
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalType('edit');
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRecord) {
      try {
        // Call Delete API
        await axiosInstance.delete(`${BaseUrl}admin-staff-attendance/${selectedRecord.attendance_id}`);
        
        // Update local state
        setRecords(prev => prev.filter(r => r.attendance_id !== selectedRecord.attendance_id));
        alert(`Deleted attendance record for ${selectedRecord.staff_name} (${selectedRecord.role}).`);
      } catch (err) {
        console.error('Error deleting attendance record:', err);
        alert('Failed to delete attendance record');
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  // Prevent background scroll
  useEffect(() => {
    if (isModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isDeleteModalOpen]);

  const getStatusBadge = (status) => {
    const badgeClasses = {
      Present: "bg-success text-white",
      Late: "bg-warning text-dark",
      Absent: "bg-danger text-white",
      Overtime: "bg-info text-white"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-2 py-1`} style={{ fontSize: '0.7rem' }}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      "Personal Trainer": "bg-primary",
      "Receptionist": "bg-info",
      "Housekeeping": "bg-secondary",
      "General Trainer": "bg-success",
      "Member": "bg-dark",
      "Admin": "bg-danger",
      "Manager": "bg-warning",
      "Trainer": "bg-primary",
      "generaltrainer": "bg-success"
    };
    return (
      <span className={`badge rounded-pill ${colors[role] || 'bg-light'} text-light px-2 py-1`} style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
        {role}
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return 'Add New Staff Attendance Record';
      case 'edit': return 'Edit Staff Attendance Record';
      case 'view':
      default: return 'View Staff Attendance Record';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return <span className="text-muted">—</span>;
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getNextId = () => {
    return records.length > 0 ? Math.max(...records.map(r => r.attendance_id)) + 1 : 1;
  };

  // Handle form submission with API integration
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (modalType === 'add') {
      try {
        const staffId = parseInt(formData.get('staff_id'));
        const staffData = staffMembers.find(s => s.id === staffId);
        if (!staffData) return alert("Invalid staff selection");

        const branchId = parseInt(formData.get('branch_id'));
        const branchData = branches.find(b => b.id === branchId);
        const branchName = branchData ? branchData.name : '';

        const shiftId = formData.get('shift_id');
        const shiftName = shifts.find(s => s.id === shiftId)?.name || '';

        // Create payload for API
        const payload = {
          staffId: staffId,
          branchId: branchId,
          mode: formData.get('mode') || 'QR',
          shiftId: shiftId,
          date: formData.get('date') || new Date().toISOString().split('T')[0],
          checkInTime: formData.get('checkin_time') || null,
          checkOutTime: formData.get('checkout_time') || null,
          status: formData.get('status') || 'Present',
          notes: formData.get('notes') || ''
        };
        
        // Call API to create an attendance record
        const response = await axiosInstance.post(`${BaseUrl}admin-staff-attendance`, payload);
        console.log('Create attendance response:', response.data);
        
        if (response.data) {
          // Refresh attendance records
          if (branchFilter !== 'All') {
            fetchAttendanceByBranch(branchId);
          } else {
            fetchAttendanceRecords();
          }
          closeModal();
          alert('New staff attendance record added successfully!');
        } else {
          throw new Error('Failed to create attendance record');
        }
      } catch (err) {
        console.error('Error creating attendance record:', err);
        alert('Error creating attendance record: ' + err.message);
      }
    } else if (modalType === 'edit') {
      try {
        const staffId = parseInt(formData.get('staff_id'));
        const staffData = staffMembers.find(s => s.id === staffId);
        if (!staffData) return alert("Invalid staff selection");

        const branchId = parseInt(formData.get('branch_id'));
        const branchData = branches.find(b => b.id === branchId);
        const branchName = branchData ? branchData.name : selectedRecord.branch;

        const shiftId = formData.get('shift_id');
        const shiftName = shifts.find(s => s.id === shiftId)?.name || '';

        // Create payload for API
        const payload = {
          staffId: staffId,
          branchId: branchId,
          mode: formData.get('mode') || selectedRecord.mode,
          shiftId: shiftId,
          date: formData.get('date') || selectedRecord.date,
          checkInTime: formData.get('checkin_time') || selectedRecord.checkin_time,
          checkOutTime: formData.get('checkout_time') || selectedRecord.checkout_time,
          status: formData.get('status') || selectedRecord.status,
          notes: formData.get('notes') || selectedRecord.notes
        };
        
        // Call API to update attendance record
        const response = await axiosInstance.put(`${BaseUrl}admin-staff-attendance/${selectedRecord.attendance_id}`, payload);
        console.log('Update attendance response:', response.data);
        
        if (response.data) {
          // Refresh attendance records
          if (branchFilter !== 'All') {
            fetchAttendanceByBranch(branchId);
          } else {
            fetchAttendanceRecords();
          }
          closeModal();
          alert('Staff attendance record updated successfully!');
        } else {
          throw new Error('Failed to update attendance record');
        }
      } catch (err) {
        console.error('Error updating attendance record:', err);
        alert('Error updating attendance record: ' + err.message);
      }
    }
  };

  // Export CSV with Role and Branch
  const exportCSV = () => {
    const header = ["Date", "Staff Name", "Role", "Check-in", "Check-out", "Mode", "Shift", "Status", "Notes"];
    const rows = filteredRecords.map(record => [
      record.date,
      record.staff_name,
      record.role,
      formatTime(record.checkin_time),
      formatTime(record.checkout_time),
      record.mode,
      record.shift_name,
      record.status,
      record.notes
    ]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff_attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setRoleFilter('All');
    setStatusFilter('All');
    setBranchFilter('All');
  };

  // Handle branch filter change
  useEffect(() => {
    if (branchFilter !== 'All') {
      const branch = branches.find(b => b.name === branchFilter);
      if (branch) {
        fetchAttendanceByBranch(branch.id);
      }
    } else {
      fetchAttendanceRecords();
    }
  }, [branchFilter]);

  // Mobile Card View Component - Removed branch badge
  const MobileAttendanceCard = ({ record }) => (
    <div className="card mb-3 shadow-sm" style={{ borderRadius: '0.5rem' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1 fw-bold" style={{ fontSize: '0.95rem' }}>{record.staff_name}</h6>
            <div className="d-flex gap-1 flex-wrap">
              {getRoleBadge(record.role)}
            </div>
          </div>
          {getStatusBadge(record.status)}
        </div>
        
        <div className="row g-2 mb-2">
          <div className="col-6">
            <small className="text-muted d-block">Date</small>
            <span style={{ fontSize: '0.85rem' }}>{formatDate(record.date)}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Shift</small>
            <span style={{ fontSize: '0.85rem' }}>{record.shift_name}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Check-in</small>
            <span style={{ fontSize: '0.85rem' }}>{formatTime(record.checkin_time)}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Check-out</small>
            <span style={{ fontSize: '0.85rem' }}>{formatTime(record.checkout_time)}</span>
          </div>
        </div>
        
        {record.notes && (
          <div className="mb-2">
            <small className="text-muted">Notes:</small>
            <p className="mb-0" style={{ fontSize: '0.85rem' }}>{record.notes}</p>
          </div>
        )}
        
        <div className="d-flex justify-content-end gap-1">
          <button
            className="btn btn-sm action-btn"
            title="View"
            onClick={() => handleView(record)}
            style={{ borderColor: customColor, color: customColor }}
          >
            <FaEye size={12} />
          </button>
          <button
            className="btn btn-sm action-btn"
            title="Edit"
            onClick={() => handleEdit(record)}
            style={{ borderColor: customColor, color: customColor }}
          >
            <FaEdit size={12} />
          </button>
          <button
            className="btn btn-sm btn-outline-danger action-btn"
            title="Delete"
            onClick={() => handleDeleteClick(record)}
          >
            <FaTrashAlt size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-2 p-md-4">
      {/* Header Section */}
      <div className="row mb-3 mb-md-4 align-items-center">
        <div className="col-12 col-md-8 mb-2 mb-md-0">
          <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>Staff Attendance Records</h2>
          <p className="text-muted mb-0 d-none d-md-block">Track staff attendance via QR scan or manual entry.</p>
        </div>
        <div className="col-12 col-md-4">
          <div className="d-flex flex-column flex-md-row gap-2">
            <button 
              className="btn flex-fill" 
              style={{ backgroundColor: 'transparent', border: '1px solid #dee2e6', color: '#6c757d', fontSize: '0.875rem' }}
              onClick={exportCSV}
            >
              <FaFileExport className="me-1" /> 
              <span className="d-none d-sm-inline">Export</span>
            </button>
            <button 
              className="btn flex-fill" 
              style={{ backgroundColor: customColor, borderColor: customColor, color: 'white', fontSize: '0.875rem' }}
              onClick={handleAddNew}
            >
              <FaPlus className="me-1" /> 
              <span className="d-none d-sm-inline">Add Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section - Removed branch filter */}
      <div className="card shadow-sm border-0 mb-3 mb-md-4">
        <div className="card-body p-2 p-md-3">
          {/* Mobile Filter Toggle */}
          <div className="d-md-none mb-2">
            <button 
              className="btn btn-outline-secondary btn-sm w-100 d-flex justify-content-between align-items-center"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <span>Filters</span>
              <FaFilter />
            </button>
          </div>

          <div className={`row g-2 ${showMobileFilters ? 'd-block' : 'd-none d-md-flex'}`}>
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border">
                  <FaSearch className="text-muted" style={{ fontSize: '0.875rem' }} />
                </span>
                <input
                  type="text"
                  className="form-control border"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                {allRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                {allStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-1">
              <button 
                className="btn btn-outline-secondary btn-sm w-100" 
                onClick={clearFilters}
                style={{ fontSize: '0.875rem' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Records Section */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-light py-2 py-md-3">
          <h6 className="mb-0 fw-bold" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
            Attendance Records ({filteredRecords.length})
          </h6>
        </div>
        <div className="card-body p-0">
          {/* Desktop Table View - Removed branch column */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th className="fw-semibold text-nowrap" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>DATE</th>
                    <th className="fw-semibold text-nowrap" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>STAFF NAME</th>
                    <th className="fw-semibold text-nowrap" style={{ fontSize: '0.75rem', padding: '0.5rem', width: '100px' }}>ROLE</th>
                    <th className="fw-semibold text-nowrap" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>CHECK-IN</th>
                    <th className="fw-semibold text-nowrap" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>CHECK-OUT</th>
                    <th className="fw-semibold text-nowrap d-none d-lg-table-cell" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>MODE</th>
                    <th className="fw-semibold text-nowrap d-none d-md-table-cell" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>SHIFT</th>
                    <th className="fw-semibold text-nowrap" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>STATUS</th>
                    <th className="fw-semibold text-center text-nowrap" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.attendance_id}>
                        <td className="text-nowrap" style={{ padding: '0.5rem' }}>
                          <span className="d-none d-lg-inline">{formatDate(record.date)}</span>
                          <span className="d-lg-none">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </td>
                        <td className="text-nowrap" style={{ padding: '0.5rem' }}>
                          <strong>{record.staff_name}</strong>
                        </td>
                        <td className="text-nowrap" style={{ padding: '0.5rem' }}>{getRoleBadge(record.role)}</td>
                        <td className="text-nowrap" style={{ padding: '0.5rem' }}>{formatTime(record.checkin_time)}</td>
                        <td className="text-nowrap" style={{ padding: '0.5rem' }}>{formatTime(record.checkout_time)}</td>
                        <td className="text-nowrap d-none d-lg-table-cell" style={{ padding: '0.5rem' }}>
                          <span className={`badge rounded-pill ${
                            record.mode === 'QR' ? 'bg-info text-white' : 'bg-secondary text-white'
                          } px-2 py-1`} style={{ fontSize: '0.65rem' }}>
                            {record.mode}
                          </span>
                        </td>
                        <td className="text-nowrap d-none d-md-table-cell" style={{ padding: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem' }}>{record.shift_name}</span>
                        </td>
                        <td className="text-nowrap" style={{ padding: '0.5rem' }}>{getStatusBadge(record.status)}</td>
                        <td className="text-center text-nowrap" style={{ padding: '0.5rem' }}>
                          <div className="d-flex justify-content-center gap-1">
                            <button
                              className="btn btn-sm action-btn"
                              title="View"
                              onClick={() => handleView(record)}
                              style={{ borderColor: customColor, color: customColor }}
                            >
                              <FaEye size={12} />
                            </button>
                            <button
                              className="btn btn-sm action-btn"
                              title="Edit"
                              onClick={() => handleEdit(record)}
                              style={{ borderColor: customColor, color: customColor }}
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger action-btn"
                              title="Delete"
                              onClick={() => handleDeleteClick(record)}
                            >
                              <FaTrashAlt size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="text-muted">
                          <FaSearch size={24} className="mb-2" />
                          <p className="mb-0">No attendance records found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none p-3">
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <MobileAttendanceCard key={record.attendance_id} record={record} />
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-muted">
                  <FaSearch size={24} className="mb-2" />
                  <p className="mb-0">No attendance records found matching your criteria.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN MODAL (Add/Edit/View) - Compact Version */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: modalType === 'view' ? '500px' : '550px',
              margin: 'auto',
              position: 'relative',
              transform: 'scale(0.95)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div className="modal-content border-0 shadow" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div className="modal-header py-2 px-3" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title fw-bold m-0" style={{ fontSize: '1rem' }}>{getModalTitle()}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                  style={{ opacity: 0.8 }}
                ></button>
              </div>
              <div className="modal-body p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleFormSubmit}>
                  <div className="row g-2">
                    {/* Staff & Role */}
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Staff Member *</label>
                      <select
                        name="staff_id"
                        className="form-select form-select-sm"
                        defaultValue={selectedRecord?.staff_id || ''}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="">Select Staff Member</option>
                        {staffMembers.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch & Date */}
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Branch *</label>
                      <select
                        name="branch_id"
                        className="form-select form-select-sm"
                        defaultValue={selectedRecord ? branches.find(b => b.name === selectedRecord.branch)?.id || '' : ''}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Date</label>
                      <input
                        name="date"
                        type="date"
                        className="form-control form-control-sm"
                        defaultValue={selectedRecord?.date || new Date().toISOString().split('T')[0]}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>

                    {/* Shift & Mode */}
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Shift</label>
                      <select
                        name="shift_id"
                        className="form-select form-select-sm"
                        defaultValue={selectedRecord?.shift_id || ''}
                        disabled={modalType === 'view'}
                      >
                        <option value="">No Shift</option>
                        {shifts.map(shift => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Mode</label>
                      <select
                        name="mode"
                        className="form-select form-select-sm"
                        defaultValue={selectedRecord?.mode || 'QR'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="QR">QR</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>

                    {/* Status & Check-in */}
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Status</label>
                      <select
                        name="status"
                        className="form-select form-select-sm"
                        defaultValue={selectedRecord?.status || 'Present'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Overtime">Overtime</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Check-in Time</label>
                      <input
                        name="checkin_time"
                        type="datetime-local"
                        className="form-control form-control-sm"
                        defaultValue={selectedRecord?.checkin_time || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>

                    {/* Check-out & Notes */}
                    <div className="col-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Check-out Time</label>
                      <input
                        name="checkout_time"
                        type="datetime-local"
                        className="form-control form-control-sm"
                        defaultValue={selectedRecord?.checkout_time || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Notes</label>
                      <input
                        name="notes"
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Reason for absence or late entry..."
                        defaultValue={selectedRecord?.notes || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm px-3"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    {modalType !== 'view' && (
                      <button
                        type="submit"
                        className="btn btn-sm px-3"
                        style={{
                          backgroundColor: customColor,
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        {modalType === 'add' ? 'Add Record' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL - Compact Version */}
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
            style={{ 
              maxWidth: '400px',
              margin: 'auto',
              position: 'relative',
              transform: 'scale(0.95)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div className="modal-content border-0 shadow" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div className="modal-header py-2 px-3" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title fw-bold m-0" style={{ fontSize: '1rem' }}>Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeDeleteModal}
                  style={{ opacity: 0.8 }}
                ></button>
              </div>
              <div className="modal-body text-center py-3">
                <div className="text-danger mb-2">
                  <FaExclamationTriangle size={24} />
                </div>
                <h5 style={{ fontSize: '1rem' }}>Are you sure?</h5>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  This will permanently delete attendance record for <strong>{selectedRecord?.staff_name}</strong> ({selectedRecord?.role}) on <strong>{selectedRecord ? formatDate(selectedRecord.date) : ''}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-3"
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
          width: 28px;
          height: 28px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        
        @media (max-width: 576px) {
          .action-btn {
            width: 24px;
            height: 24px;
          }
        }
        
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        @media (max-width: 768px) {
          .container-fluid {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }
        
        .card {
          border: none;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }
        
        .table th {
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          white-space: nowrap;
        }
        
        .table td {
          vertical-align: middle;
          white-space: nowrap;
        }
        
        .form-control, .form-select {
          border-radius: 0.375rem !important;
        }
        
        .btn {
          border-radius: 0.375rem;
          font-weight: 500;
        }
        
        .modal-header {
          border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .modal-footer {
          border-radius: 0 0 0.375rem 0.375rem;
        }

        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.25rem;
            max-width: calc(100% - 0.5rem);
          }
          .modal-content {
            border-radius: 0.375rem;
          }
          .modal-body {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffAttendance;