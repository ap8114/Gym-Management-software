import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ClipboardCheck, PlayFill } from 'react-bootstrap-icons';
import BaseUrl from '../../Api/BaseUrl';

const HousekeepingTask = () => {
  const [tasks, setTasks] = useState([]);

  const userId = localStorage.getItem('userId'); // assignedTo = userId

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/housekeepingtask/asignedto/${userId}`);
        setTasks(response.data.data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  // Format dueDate to show time like "08:00"
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // "08:00"
  };

  // Format date for display if needed
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // "04/12/2025"
  };

  const getStatusBadge = (status) => {
    // Your API returns "Approved", but you might have other statuses like "Pending", "Completed"
    // Adjust logic based on actual possible statuses
    switch (status?.toLowerCase()) {
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'approved':
        return <span className="badge bg-info">Approved</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      default:
        return <span className="badge bg-secondary">{status || 'Unknown'}</span>;
    }
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Task Checklist</h2>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <ClipboardCheck className="me-2" /> My Cleaning Tasks (Today)
              </h5>
              <span className="badge bg-info">{tasks.length} Task{tasks.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="card-body">
              {tasks.length === 0 ? (
                <p className="text-muted text-center">No tasks assigned.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Task Title</th>
                        <th>Description</th>
                        <th>Due Time</th>
                        <th>Status</th>
                        {/* <th>Action</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td>{task.taskTitle || '—'}</td>
                          <td>{task.description || '—'}</td>
                          <td className="text-nowrap">
                            {formatDate(task.dueDate)} {formatTime(task.dueDate)}
                          </td>
                          <td>{getStatusBadge(task.status)}</td>
                          {/* <td>
                            {task.status?.toLowerCase() !== 'completed' ? (
                              <button className="btn btn-sm btn-success">
                                <PlayFill size={12} className="me-1" /> Start
                              </button>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingTask;