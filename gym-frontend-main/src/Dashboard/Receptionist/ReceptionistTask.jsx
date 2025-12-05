import React from 'react';
import { Person, Clock, FileText } from 'react-bootstrap-icons';

const ReceptionistTask = () => {
  const duties = [
    { id: 1, task: "Front Desk Shift", time: "08:00 - 16:00", status: "Active" },
    { id: 2, task: "Handle Walk-ins", time: "All Day", status: "Pending" }
  ];

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Receptionist Dashboard</h2>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <Person className="me-2" />
              <h5 className="mb-0">My Shift & Duties (Today)</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Duty</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duties.map(duty => (
                      <tr key={duty.id}>
                        <td>{duty.task}</td>
                        <td>{duty.time}</td>
                        <td>
                          {duty.status === 'Active' ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-warning">Pending</span>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary me-2">
                            <FileText size={14} /> Log Activity
                          </button>
                          <button className="btn btn-sm btn-primary">
                            <Clock size={14} /> Check-in
                          </button>
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

export default ReceptionistTask;