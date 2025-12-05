import React from 'react';
import { ClipboardCheck, Person, BarChart } from 'react-bootstrap-icons';

const ManagerTask = () => {
  const teamTasks = [
    { id: 1, staff: "John (Housekeeping)", task: "Clean Studio 1", status: "Pending" },
    { id: 2, staff: "Jane (Reception)", task: "Update Member Records", status: "In Progress" },
    { id: 3, staff: "Mike (Trainer)", task: "Submit Weekly Report", status: "Completed" }
  ];

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Manager Dashboard</h2>

      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <BarChart className="me-2" />
              <h5 className="mb-0">Team Overview</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <h4>12</h4>
                  <p className="text-muted">Active Staff</p>
                </div>
                <div className="col-md-3 mb-3">
                  <h4>5</h4>
                  <p className="text-muted">Pending Tasks</p>
                </div>
                <div className="col-md-3 mb-3">
                  <h4>8</h4>
                  <p className="text-muted">Classes Today</p>
                </div>
                <div className="col-md-3">
                  <h4>92%</h4>
                  <p className="text-muted">Attendance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <ClipboardCheck className="me-2" />
              <h5 className="mb-0">Team Tasks Requiring Attention</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Assigned To</th>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamTasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.staff}</td>
                        <td>{task.task}</td>
                        <td>
                          {task.status === 'Completed' ? (
                            <span className="badge bg-success">Completed</span>
                          ) : task.status === 'In Progress' ? (
                            <span className="badge bg-primary">In Progress</span>
                          ) : (
                            <span className="badge bg-warning">Pending</span>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary">View Details</button>
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

export default ManagerTask;