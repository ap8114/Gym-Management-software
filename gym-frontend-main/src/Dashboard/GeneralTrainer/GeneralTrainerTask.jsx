import React from 'react';
import { Users, Clock, ClipboardCheck } from 'react-bootstrap-icons';

const GeneralTrainerTask = () => {
  const sessions = [
    { id: 1, name: "Morning HIIT", time: "07:00 - 08:00", location: "Studio 1", members: 12, status: "Upcoming" },
    { id: 2, name: "Evening Yoga", time: "18:00 - 19:00", location: "Studio 2", members: 8, status: "Upcoming" }
  ];

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">General Trainer Dashboard</h2>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <Users className="me-2" />
              <h5 className="mb-0">My Group Sessions (Today)</h5>
            </div>
            <div className="card-body">
              {sessions.length === 0 ? (
                <p className="text-muted">No sessions scheduled for today.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {sessions.map(session => (
                    <div key={session.id} className="border rounded p-3 d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{session.name}</h6>
                        <p className="mb-1 text-muted">
                          <Clock size={14} className="me-1" /> {session.time} • {session.location}
                        </p>
                        <span className="badge bg-primary">
                          <Users size={12} className="me-1" /> {session.members} Members
                        </span>
                      </div>
                      <button className="btn btn-outline-primary">
                        <ClipboardCheck size={16} className="me-1" /> Mark Attendance
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralTrainerTask;