import React, { useState } from 'react';
import {
  Calendar, Plus, Check, X
} from 'react-bootstrap-icons';

const ShiftManagement = () => {
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Sample data
  const staffMembers = [
    { id: 1, name: "John Doe", role: "Trainer", branch: "Main Branch" },
    { id: 2, name: "Jane Smith", role: "Receptionist", branch: "Downtown Branch" },
    { id: 3, name: "Mike Johnson", role: "Manager", branch: "Main Branch" },
    { id: 4, name: "Sarah Wilson", role: "Cleaner", branch: "West Branch" },
    { id: 5, name: "David Brown", role: "Trainer", branch: "Downtown Branch" }
  ];

  const branches = ["Main Branch", "Downtown Branch", "West Branch"];

  const shifts = [
    {
      id: 1,
      staffId: 1,
      date: "2023-10-15",
      startTime: "09:00",
      endTime: "17:00",
      type: "Morning",
      branch: "Main Branch",
      status: "Approved"
    },
    {
      id: 2,
      staffId: 2,
      date: "2023-10-15",
      startTime: "12:00",
      endTime: "20:00",
      type: "Evening",
      branch: "Downtown Branch",
      status: "Pending"
    },
    {
      id: 3,
      staffId: 3,
      date: "2023-10-16",
      startTime: "14:00",
      endTime: "22:00",
      type: "Evening",
      branch: "Main Branch",
      status: "Approved"
    },
    {
      id: 4,
      staffId: 4,
      date: "2023-10-16",
      startTime: "22:00",
      endTime: "06:00",
      type: "Night",
      branch: "West Branch",
      status: "Rejected"
    },
    {
      id: 5,
      staffId: 5,
      date: "2023-10-17",
      startTime: "06:00",
      endTime: "14:00",
      type: "Morning",
      branch: "Downtown Branch",
      status: "Pending"
    }
  ];

  const [shiftForm, setShiftForm] = useState({
    staffIds: [],
    date: '',
    startTime: '',
    endTime: '',
    type: 'Morning',
    branch: ''
  });

  const getStaffName = (id) => {
    const staff = staffMembers.find(s => s.id === id);
    return staff ? staff.name : 'Unknown';
  };

  const getShiftColor = (type) => {
    switch (type) {
      case 'Morning': return 'warning';
      case 'Evening': return 'info';
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

  const handleApproveShift = (shiftId) => {
    console.log(`Approving shift ${shiftId}`);
  };

  const handleRejectShift = (shiftId) => {
    console.log(`Rejecting shift ${shiftId}`);
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
                        multiple 
                        className="form-select"
                        onChange={handleStaffSelection}
                        size="5"
                      >
                        {staffMembers.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role}) - {staff.branch}
                          </option>
                        ))}
                      </select>
                      <div className="form-text">Hold Ctrl to select multiple staff</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Branch</label>
                      <select 
                        className="form-select"
                        name="branch"
                        value={shiftForm.branch}
                        onChange={handleShiftFormChange}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
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
                        name="date"
                        value={shiftForm.date}
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
                      name="type"
                      value={shiftForm.type}
                      onChange={handleShiftFormChange}
                    >
                      <option value="Morning">Morning Shift</option>
                      <option value="Evening">Evening Shift</option>
                      <option value="Night">Night Shift</option>
                      <option value="Custom">Custom Shift</option>
                    </select>
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
                  onClick={() => {
                    console.log("Creating shift:", shiftForm);
                    setShowShiftModal(false);
                  }}
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
            {shifts.map(shift => (
              <tr key={shift.id}>
                <td>{getStaffName(shift.staffId)}</td>
                <td>{shift.date}</td>
                <td>{shift.startTime}</td>
                <td>{shift.endTime}</td>
                <td>
                  <span className={`badge bg-${getShiftColor(shift.type)}`}>
                    {shift.type}
                  </span>
                </td>
                <td>{shift.branch}</td>
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
              {shifts
                .filter(shift => shift.status === 'Pending')
                .map(shift => (
                  <tr key={shift.id}>
                    <td>{getStaffName(shift.staffId)}</td>
                    <td>{shift.date} {shift.startTime} - {shift.endTime}</td>
                    <td>{shift.branch}</td>
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