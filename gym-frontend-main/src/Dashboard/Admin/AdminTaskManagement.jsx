import React, { useState } from 'react';
import {
  Calendar, Plus, Check, X
} from 'react-bootstrap-icons';

const AdminTaskManagement = () => {
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Sample staff data (same)
  const staffMembers = [
    { id: 1, name: "John Doe", role: "Trainer", branch: "Main Branch" },
    { id: 2, name: "Jane Smith", role: "Receptionist", branch: "Downtown Branch" },
    { id: 3, name: "Mike Johnson", role: "Manager", branch: "Main Branch" },
    { id: 4, name: "Sarah Wilson", role: "Cleaner", branch: "West Branch" },
    { id: 5, name: "David Brown", role: "Trainer", branch: "Downtown Branch" }
  ];

  const branches = ["Main Branch", "Downtown Branch", "West Branch"];

  // Renamed: shifts → tasks
  const tasks = [
    {
      id: 1,
      staffId: 1,
      dueDate: "2025-12-10",
      title: "Patient follow-up calls",
      priority: "High",
      branch: "Main Branch",
      status: "Completed"
    },
    {
      id: 2,
      staffId: 2,
      dueDate: "2025-12-10",
      title: "Update appointment records",
      priority: "Medium",
      branch: "Downtown Branch",
      status: "Pending"
    },
    {
      id: 3,
      staffId: 3,
      dueDate: "2025-12-11",
      title: "Inventory check",
      priority: "Medium",
      branch: "Main Branch",
      status: "In Progress"
    },
    {
      id: 4,
      staffId: 4,
      dueDate: "2025-12-11",
      title: "Sanitization schedule",
      priority: "Low",
      branch: "West Branch",
      status: "Rejected"
    },
    {
      id: 5,
      staffId: 5,
      dueDate: "2025-12-12",
      title: "Training session prep",
      priority: "High",
      branch: "Downtown Branch",
      status: "Pending"
    }
  ];

  const [taskForm, setTaskForm] = useState({
    staffId: '',
    dueDate: '',
    title: '',
    priority: 'Medium',
    branch: ''
  });

  const getStaffName = (id) => {
    const staff = staffMembers.find(s => s.id === id);
    return staff ? staff.name : 'Unknown';
  };

  // Updated: shift type → task priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({ ...taskForm, [name]: value });
  };

  const handleApproveTask = (taskId) => {
    console.log(`Marking task ${taskId} as Completed`);
  };

  const handleRejectTask = (taskId) => {
    console.log(`Rejecting task ${taskId}`);
  };

  const renderTaskModal = () => {
    if (!showTaskModal) return null;

    return (
      <>
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Task</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowTaskModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Assign To</label>
                      <select 
                        className="form-select"
                        name="staffId"
                        value={taskForm.staffId}
                        onChange={handleTaskFormChange}
                      >
                        <option value="">Select Staff</option>
                        {staffMembers.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role}) - {staff.branch}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Branch</label>
                      <select 
                        className="form-select"
                        name="branch"
                        value={taskForm.branch}
                        onChange={handleTaskFormChange}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-8">
                      <label className="form-label">Task Title</label>
                      <input 
                        type="text" 
                        className="form-control"
                        name="title"
                        value={taskForm.title}
                        onChange={handleTaskFormChange}
                        placeholder="e.g. Patient follow-up"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Due Date</label>
                      <input 
                        type="date" 
                        className="form-control"
                        name="dueDate"
                        value={taskForm.dueDate}
                        onChange={handleTaskFormChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select"
                      name="priority"
                      value={taskForm.priority}
                      onChange={handleTaskFormChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowTaskModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-outline-light" 
                  style={{ backgroundColor: '#2f6a87', color: '#fff' }} 
                  onClick={() => {
                    console.log("Creating task:", taskForm);
                    setShowTaskModal(false);
                  }}
                >
                  Create Task
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
      <h2 className="mb-4">Task Management</h2>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Task List</h3>
        <button 
          className="btn btn-outline-light" 
          style={{ backgroundColor: '#2f6a87', color: '#fff' }}
          onClick={() => setShowTaskModal(true)}
        >
          <Plus size={18} className="me-1" /> Create Task
        </button>
      </div>

      {/* Task Table */}
      <div className="table-responsive mb-4">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Assigned To</th>
              <th>Task</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Branch</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{getStaffName(task.staffId)}</td>
                <td>{task.title}</td>
                <td>{task.dueDate}</td>
                <td>
                  <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td>{task.branch}</td>
                <td>
                  <span className={`badge bg-${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Task Approval / Action Section (for Pending tasks) */}
      <div>
        <h4>Pending Tasks</h4>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Assigned To</th>
                <th>Task</th>
                <th>Due Date</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks
                .filter(task => task.status === 'Pending')
                .map(task => (
                  <tr key={task.id}>
                    <td>{getStaffName(task.staffId)}</td>
                    <td>{task.title}</td>
                    <td>{task.dueDate}</td>
                    <td>{task.branch}</td>
                    <td>
                      <span className={`badge bg-${getStatusClass(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleApproveTask(task.id)}
                          title="Mark as Completed"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRejectTask(task.id)}
                          title="Reject Task"
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

      {renderTaskModal()}
    </div>
  );
};

export default AdminTaskManagement;