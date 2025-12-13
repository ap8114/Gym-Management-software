import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Check, X
} from 'react-bootstrap-icons';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';
import GetAdminId from '../../Api/GetAdminId';
import { FaTrash } from 'react-icons/fa';

const AdminTaskManagement = () => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const adminId = GetAdminId();
  const [taskForm, setTaskForm] = useState({
    staffId: '',
    taskTitle: '',
    description: '',
    dueDate: '',
    priority: 'Medium'
  });

  // Fetch staff, branches and tasks data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch staff data
        const staffResponse = await axios.get(`${BaseUrl}staff/all`);
        setStaffMembers(staffResponse.data.staff);

        // Fetch branches data
        const branchesResponse = await axios.get(`${BaseUrl}/branches/by-admin/${adminId}`);
        setBranches(branchesResponse.data.branches);

        // Fetch tasks from API
        const tasksResponse = await axios.get(`${BaseUrl}housekeepingtask/all`);

        if (tasksResponse.data.success) {
          // Transform API data to match component expectations
          const transformedTasks = tasksResponse.data.data.map(task => ({
            id: task.id,
            staffId: task.assignedTo, // Map assignedTo to staffId
            title: task.taskTitle, // Map taskTitle to title
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1), // Capitalize first letter
            status: task.status || 'Pending' // Default to 'Pending' if status is empty
          }));

          setTasks(transformedTasks);
        } else {
          setError('Failed to fetch tasks. Please try again later.');
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const getStaffName = (id) => {
    const staff = staffMembers.find(s => s.staffId === id);
    return staff ? staff.fullName : 'Unknown';
  };

  const getBranchName = (id) => {
    const branch = branches.find(b => b.id === id);
    return branch ? branch.name : 'Unknown';
  };

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
      case 'completed': return 'success';
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

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await axios.delete(`${BaseUrl}housekeepingtask/${taskId}`);

      if (response.data.success) {
        // Remove the task from state
        setTasks(tasks.filter(task => task.id !== taskId));
        alert('Task deleted successfully!');
      } else {
        alert('Failed to delete task. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('An error occurred while deleting the task.');
    }
  };

  const handleApproveTask = async (taskId) => {
    try {
      // Make API call to update task status to 'Completed'
      const response = await axios.put(`${BaseUrl}housekeepingtask/status/${taskId}`, {
        status: 'Approved'
      });

      if (response.data.success) {
        // Remove the task from the pending tasks list
        setTasks(tasks.filter(task => task.id !== taskId));
        alert('Task marked as completed!');
      } else {
        alert('Failed to update task. Please try again.');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('An error occurred while updating the task. Please try again.');
    }
  };

  const handleRejectTask = async (taskId) => {
    console.log('Rejecting task with ID:', taskId);
    try {
      // Make API call to update task status to 'Rejected'
      const response = await axios.put(`${BaseUrl}housekeepingtask/status/${taskId}`, {
        status: 'Rejected'
      });

      if (response.data.success) {
        // Remove the task from the pending tasks list
        setTasks(tasks.filter(task => task.id !== taskId));
        alert('Task rejected!');
      } else {
        alert('Failed to update task. Please try again.');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('An error occurred while updating the task. Please try again.');
    }
  };
  const handleCreateTask = async () => {
    try {
      // Validate form
      if (!taskForm.staffId || !taskForm.taskTitle || !taskForm.dueDate) {
        alert('Please fill in all required fields');
        return;
      }

      // Get current user ID (this should come from your auth context)
      // For now, using a hardcoded value
      const createdById = 4; // This should be replaced with actual user ID

      // Find the selected staff member to get their user ID
      const selectedStaff = staffMembers.find(staff => staff.staffId === parseInt(taskForm.staffId));
      const userId = selectedStaff ? selectedStaff.staffId : null;

      if (!userId) {
        alert('Invalid staff member selected');
        return;
      }

      // Prepare data for API
      const taskData = {
        assignedTo: userId, // Use user ID instead of staff ID
        taskTitle: taskForm.taskTitle,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority.toLowerCase(),
        status: "Pending",
        createdById: createdById
      };

      // Make API call to create task
      const response = await axios.post(`${BaseUrl}housekeepingtask/create`, taskData);

      if (response.data.success) {
        // Add new task to tasks list
        const newTask = {
          id: response.data.data.id,
          staffId: response.data.data.assignedTo,
          title: response.data.data.taskTitle,
          description: response.data.data.description,
          dueDate: response.data.data.dueDate,
          priority: response.data.data.priority.charAt(0).toUpperCase() + response.data.data.priority.slice(1),
          status: response.data.data.status
        };

        setTasks([...tasks, newTask]);

        // Reset form and close modal
        setTaskForm({
          staffId: '',
          taskTitle: '',
          description: '',
          dueDate: '',
          priority: 'Medium'
        });
        setShowTaskModal(false);

        alert('Task created successfully!');
      } else {
        alert('Failed to create task. Please try again.');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      alert('An error occurred while creating task. Please try again.');
    }
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
                          <option key={staff.staffId} value={staff.staffId}>
                            {staff.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* <div className="col-md-6">
                      <label className="form-label">Branch</label>
                      <select
                        className="form-select"
                        name="branchId"
                        value={taskForm.branchId}
                        onChange={handleTaskFormChange}
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div> */}
                     <div className="col-md-6">
                      <label className="form-label">Task Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="taskTitle"
                        value={taskForm.taskTitle}
                        onChange={handleTaskFormChange}
                        placeholder="e.g. Patient follow-up"
                      />
                    </div>
                  </div>

                 

                  <div className="row mb-3">
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={taskForm.description}
                        onChange={handleTaskFormChange}
                        rows="3"
                        placeholder="Task description"
                      ></textarea>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dueDate"
                        value={taskForm.dueDate}
                        onChange={handleTaskFormChange}
                      />
                    </div>
                    <div className="col-md-6">
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
                  onClick={handleCreateTask}
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

  if (loading) {
    return <div className="container-fluid py-4">Loading data...</div>;
  }

  return (
    <div className="container-fluid py-4">
     <div className="d-flex justify-content-between align-items-center mb-4">
  <h2 className="mb-0">Task Management</h2>

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
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{getStaffName(task.staffId)}</td>
                <td>{task.title}</td>
                <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                <td>{task.description}</td>
                <td>
                  <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td>
                  <span className={`badge bg-${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete Task"
                  >
                    <FaTrash size={14} />
                  </button>
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
                <th>Description</th>
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
                    <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td>{task.description}</td>
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