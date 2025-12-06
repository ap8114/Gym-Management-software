import axios from 'axios';
import React, { useEffect } from 'react';
import { ClipboardCheck, Clock, CheckCircle, PlayFill } from 'react-bootstrap-icons';
import BaseUrl from '../../Api/BaseUrl';

const HousekeepingTask = () => {
  const [tasks, setTasks] = React.useState([]);


  const taskId = localStorage.getItem('userId');
  useEffect(() => {
    // Fetch tasks from API (mocked here)
    const fetchTasks = async () => {
      // Simulate API call
      const fetchedTasks = await axios.get(`${BaseUrl}housekeepingtask/${taskId}`);
      setTasks(fetchedTasks.data.data);
    };

    fetchTasks();
  }, []);
  // const tasks = [
  //   { id: 1, area: "Gym Floor", task: "Mop & Disinfect", time: "08:00 - 09:00", status: "Pending" },
  //   { id: 2, area: "Locker Room", task: "Restock Towels", time: "10:00 - 10:30", status: "Completed" },
  //   { id: 3, area: "Reception", task: "Clean Counters", time: "14:00 - 14:30", status: "Pending" }
  // ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="badge bg-success">Completed</span>;
      case 'Pending': return <span className="badge bg-warning">Pending</span>;
      default: return <span className="badge bg-secondary">Unknown</span>;
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
              <span className="badge bg-info">3 Tasks</span>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Task</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.area}</td>
                        <td>{task.task}</td>
                        <td className="text-nowrap">{task.time}</td>
                        <td>{getStatusBadge(task.status)}</td>
                        <td>
                          {task.status === 'Pending' ? (
                            <button className="btn btn-sm btn-success">
                              <PlayFill size={12} className="me-1" /> Start
                            </button>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingTask;