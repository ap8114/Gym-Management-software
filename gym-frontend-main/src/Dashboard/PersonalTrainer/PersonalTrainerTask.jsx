import React from 'react';
import { Person, Clock, ClipboardCheck } from 'react-bootstrap-icons';

const PersonalTrainerTask = () => {
  const clients = [
    { id: 1, name: "Rahul Sharma", time: "09:00 - 10:00", plan: "Weight Loss", status: "Upcoming" },
    { id: 2, name: "Priya Mehta", time: "11:00 - 12:00", plan: "Strength", status: "Upcoming" }
  ];

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Personal Trainer Dashboard</h2>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <Person className="me-2" />
              <h5 className="mb-0">My 1-on-1 Sessions (Today)</h5>
            </div>
            <div className="card-body">
              {clients.length === 0 ? (
                <p className="text-muted">No personal sessions today.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Time</th>
                        <th>Plan</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(client => (
                        <tr key={client.id}>
                          <td>{client.name}</td>
                          <td>{client.time}</td>
                          <td><span className="badge bg-info">{client.plan}</span></td>
                          <td>
                            <button className="btn btn-sm btn-primary">
                              <ClipboardCheck size={14} className="me-1" /> Start Session
                            </button>
                          </td>
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

export default PersonalTrainerTask;