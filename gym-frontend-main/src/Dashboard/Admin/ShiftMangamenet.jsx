import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Check, X
} from 'react-bootstrap-icons';
import BaseUrl from '../../Api/BaseUrl';

const ShiftManagement = () => {
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff data
        const staffResponse = await fetch(`${BaseUrl}staff/all`);
        const staffData = await staffResponse.json();
        
        // Fetch branches data
        const branchesResponse = await fetch(`${BaseUrl}branches`);
        const branchesData = await branchesResponse.json();
        
        // Fetch shifts data
        const shiftsResponse = await fetch(`${BaseUrl}shift/all`);
        const shiftsData = await shiftsResponse.json();
        
        if (staffData.success) {
          setStaffMembers(staffData.staff);
        } else {
          throw new Error('Failed to fetch staff data');
        }
        
        if (branchesData.success) {
          setBranches(branchesData.branches);
        } else {
          throw new Error('Failed to fetch branches data');
        }
        
        // Fix for shifts data - using 'data' instead of 'shifts'
        if (shiftsData.success) {
          setShifts(shiftsData.data || []); // Using 'data' from API response
        } else {
          throw new Error('Failed to fetch shifts data');
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [BaseUrl]);

  const [shiftForm, setShiftForm] = useState({
    staffId: '',
    branchId: '',
    shiftDate: '',
    startTime: '',
    endTime: '',
    shiftType: 'Morning Shift',
    description: ''
  });

  const getStaffName = (id) => {
    // Handle the case where staffIds might be a string or array
    if (typeof id === 'string') {
      id = parseInt(id);
    }
    const staff = staffMembers.find(s => s.staffId === id);
    return staff ? staff.fullName : 'Unknown';
  };

  const getBranchName = (id) => {
    const branch = branches.find(b => b.id === id);
    return branch ? branch.name : 'Unknown';
  };

  const getShiftColor = (type) => {
    switch (type) {
      case 'Morning Shift': 
      case 'Morning': return 'warning';
      case 'Evening Shift': 
      case 'Evening': return 'info';
      case 'Night Shift': 
      case 'Night': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const handleShiftFormChange = (e) => {
    const { name, value } = e.target;
    setShiftForm({ ...shiftForm, [name]: value });
  };

  const handleStaffSelection = (e) => {
    const options = e.target.options;
    const selectedIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedIds.push(parseInt(options[i].value));
      }
    }
    setShiftForm({ ...shiftForm, staffIds: selectedIds });
  };

  const handleCreateShift = async () => {
    try {
      // Validate form
      if (!shiftForm.staffIds.length || !shiftForm.branchId || !shiftForm.shiftDate || 
          !shiftForm.startTime || !shiftForm.endTime || !shiftForm.shiftType) {
        alert('Please fill all required fields');
        return;
      }
      
      // Create shift via API
      const response = await fetch(`${BaseUrl}shift/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiftForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh shifts data
        const shiftsResponse = await fetch(`${BaseUrl}shift/all`);
        const shiftsData = await shiftsResponse.json();
        
        if (shiftsData.success) {
          setShifts(shiftsData.data || []); // Using 'data' from API response
        }
        
        // Reset form and close modal
        setShiftForm({
          staffIds: [],
          branchId: '',
          shiftDate: '',
          startTime: '',
          endTime: '',
          shiftType: 'Morning Shift',
          description: ''
        });
        setShowShiftModal(false);
        alert('Shift created successfully');
      } else {
        throw new Error(data.message || 'Failed to create shift');
      }
    } catch (err) {
      console.error('Error creating shift:', err);
      alert('Error creating shift: ' + err.message);
    }
  };

  const handleApproveShift = async (shiftId) => {
    try {
      const response = await fetch(`${BaseUrl}shift/status/${shiftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Approved' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update shifts in state
        setShifts(shifts.map(shift => 
          shift.id === shiftId ? { ...shift, status: 'Approved' } : shift
        ));
        alert('Shift approved successfully');
      } else {
        throw new Error(data.message || 'Failed to approve shift');
      }
    } catch (err) {
      console.error('Error approving shift:', err);
      alert('Error approving shift: ' + err.message);
    }
  };

  const handleRejectShift = async (shiftId) => {
    try {
      const response = await fetch(`${BaseUrl}shift/status/${shiftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Rejected' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update shifts in state
        setShifts(shifts.map(shift => 
          shift.id === shiftId ? { ...shift, status: 'Rejected' } : shift
        ));
        alert('Shift rejected successfully');
      } else {
        throw new Error(data.message || 'Failed to reject shift');
      }
    } catch (err) {
      console.error('Error rejecting shift:', err);
      alert('Error rejecting shift: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    // Handle the date format from the API
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) return dateString;
      
      // Format as YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  const renderShiftModal = () => {
    if (!showShiftModal) return null;

    return (
      <>
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Shift</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowShiftModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Select Staff</label>
                      <select 
                 
                        className="form-select"
                        name='staffId'
                        value={shiftForm.staffId}
                        onChange={handleShiftFormChange}
                      
                      >
                        {staffMembers.map(staff => (
                          <option key={staff.staffId} value={staff.staffId}>
                            {staff.fullName} - {getBranchName(staff.branchId)}
                          </option>
                        ))}
                      </select>
                  
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Branch</label>
                      <select 
                        className="form-select"
                        name="branchId"
                        value={shiftForm.branchId}
                        onChange={handleShiftFormChange}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Date</label>
                      <input 
                        type="date" 
                        className="form-control"
                        name="shiftDate"
                        value={shiftForm.shiftDate}
                        onChange={handleShiftFormChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Start Time</label>
                      <input 
                        type="time" 
                        className="form-control"
                        name="startTime"
                        value={shiftForm.startTime}
                        onChange={handleShiftFormChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">End Time</label>
                      <input 
                        type="time" 
                        className="form-control"
                        name="endTime"
                        value={shiftForm.endTime}
                        onChange={handleShiftFormChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Shift Type</label>
                    <select 
                      className="form-select"
                      name="shiftType"
                      value={shiftForm.shiftType}
                      onChange={handleShiftFormChange}
                    >
                      <option value="Morning Shift">Morning Shift</option>
                      <option value="Evening Shift">Evening Shift</option>
                      <option value="Night Shift">Night Shift</option>
                      <option value="Custom">Custom Shift</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control"
                      name="description"
                      value={shiftForm.description}
                      onChange={handleShiftFormChange}
                      rows="3"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowShiftModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-outline-light" 
                  style={{ backgroundColor: '#2f6a87', color: '#fff' }} 
                  onClick={handleCreateShift}
                >
                  Create Shift
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop show"></div>
      </>
    );
  };

  if (loading) {
    return <div className="container-fluid py-4">Loading...</div>;
  }

  if (error) {
    return <div className="container-fluid py-4">Error: {error}</div>;
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Staff Management</h2>
      
      {/* Only one heading — no tabs */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Duty Roster</h3>
        <button 
          className="btn btn-outline-light" 
          style={{ backgroundColor: '#2f6a87', color: '#fff' }}
          onClick={() => setShowShiftModal(true)}
        >
          <Plus size={18} className="me-1" /> Create Shift
        </button>
      </div>

      {/* Shift Table */}
      <div className="table-responsive mb-4">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Shift Type</th>
              <th>Branch</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shifts?.map(shift => (
              <tr key={shift.id}>
                <td>
                  {/* Handle staffIds as string from API response */}
                  {shift.staffIds ? getStaffName(shift.staffIds) : 'Not Assigned'}
                </td>
                <td>{formatDate(shift.shiftDate)}</td>
                <td>{shift.startTime}</td>
                <td>{shift.endTime}</td>
                <td>
                  <span className={`badge bg-${getShiftColor(shift.shiftType)}`}>
                    {shift.shiftType || 'Not Specified'}
                  </span>
                </td>
                <td>{getBranchName(shift.branchId)}</td>
                <td>
                  <span className={`badge bg-${getStatusClass(shift.status)}`}>
                    {shift.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shift Approval Section (only for Pending shifts) */}
      <div>
        <h4>Shift Approval</h4>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Shift Date & Time</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts?.filter(shift => shift.status === 'Pending')
                .map(shift => (
                  <tr key={shift.id}>
                    <td>
                      {/* Handle staffIds as string from API response */}
                      {shift.staffIds ? getStaffName(shift.staffIds) : 'Not Assigned'}
                    </td>
                    <td>{formatDate(shift.shiftDate)} {shift.startTime} - {shift.endTime}</td>
                    <td>{getBranchName(shift.branchId)}</td>
                    <td>
                      <span className={`badge bg-${getStatusClass(shift.status)}`}>
                        {shift.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleApproveShift(shift.id)}
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRejectShift(shift.id)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {renderShiftModal()}
    </div>
  );
};

export default ShiftManagement;