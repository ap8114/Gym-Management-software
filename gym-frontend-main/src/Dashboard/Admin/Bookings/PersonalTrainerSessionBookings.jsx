import React, { useState } from 'react';
import { FaCheck, FaTimes, FaEdit, FaTrash, FaSearch, FaFilter, FaUser, FaPlus, FaEye } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';

const SessionBookingPage = () => {
  const [sessions, setSessions] = useState([
    { 
      id: 1, 
      sessionName: "Morning Strength Training",
      trainer: "John Smith", 
      date: "2023-11-15", 
      time: "10:00 AM", 
      duration: 60, 
      status: "Upcoming", 
      description: "Focus on upper body strength and core stability. We'll work on bench press, rows, and various core exercises.",
      branchName: "Downtown"
    },
    { 
      id: 2, 
      sessionName: "Cardio Blast",
      trainer: "Jane Doe", 
      date: "2023-11-15", 
      time: "2:00 PM", 
      duration: 45, 
      status: "Upcoming", 
      description: "High intensity interval training with a focus on cardiovascular endurance. Bring water and a towel!",
      branchName: "North Branch"
    },
    { 
      id: 3, 
      sessionName: "Flexibility & Recovery",
      trainer: "Mike Johnson", 
      date: "2023-11-16", 
      time: "9:00 AM", 
      duration: 60, 
      status: "Completed", 
      description: "Gentle stretching and mobility exercises to improve flexibility and aid recovery.",
      branchName: "South Branch"
    },
    { 
      id: 4, 
      sessionName: "Evening Yoga",
      trainer: "Sarah Williams", 
      date: "2023-11-17", 
      time: "6:00 PM", 
      duration: 60, 
      status: "Upcoming", 
      description: "Relaxing yoga session to unwind after a long day. Suitable for all levels.",
      branchName: "East Branch"
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showViewSessionModal, setShowViewSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [newSession, setNewSession] = useState({
    sessionName: '',
    trainer: '',
    date: '',
    time: '',
    duration: 60,
    description: '',
    branchName: ''
  });

  const customColor = '#6EB2CC';
  
  // Get unique branches from sessions
  const branches = [...new Set(sessions.map(session => session.branchName))];

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
    const matchesBranch = branchFilter === 'All' || session.branchName === branchFilter;
    const matchesSearch =
      searchQuery === '' ||
      session.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.trainer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesBranch && matchesSearch;
  });

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setShowViewSessionModal(true);
  };

  const handleAddSession = () => {
    // Validation
    if (!newSession.sessionName || !newSession.trainer || 
        !newSession.date || !newSession.time || !newSession.description || !newSession.branchName) {
      alert('Please fill in all required fields');
      return;
    }

    // Create new session
    const newId = Math.max(...sessions.map(s => s.id), 0) + 1;
    const sessionToAdd = {
      ...newSession,
      id: newId,
      status: "Upcoming"
    };

    // Add to sessions
    setSessions([...sessions, sessionToAdd]);
    
    // Reset form and close modal
    setNewSession({
      sessionName: '',
      trainer: '',
      date: '',
      time: '',
      duration: 60,
      description: '',
      branchName: ''
    });
    setShowAddSessionModal(false);
  };

  const handleDeleteSession = () => {
    if (selectedSession) {
      setSessions(sessions.filter(s => s.id !== selectedSession.id));
      setShowDeleteModal(false);
      setShowViewSessionModal(false);
      setSelectedSession(null);
    }
  };

  const openDeleteModal = (session) => {
    setSelectedSession(session);
    setShowDeleteModal(true);
  };

  const handleStatusChange = (id, newStatus) => {
    setSessions(sessions.map(s => 
      s.id === id ? { ...s, status: newStatus } : s
    ));
    
    if (selectedSession && selectedSession.id === id) {
      setSelectedSession({ ...selectedSession, status: newStatus });
    }
  };

  // Time options for dropdown
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const minuteStr = minute === 0 ? '00' : minute.toString();
      timeOptions.push(`${hour12}:${minuteStr} ${ampm}`);
    }
  }

  // Mobile card component for displaying session
  const SessionCard = ({ session }) => (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">{session.sessionName}</h5>
          <span className={`badge 
            ${session.status === 'Completed' ? 'bg-success' :
              session.status === 'Cancelled' ? 'bg-danger' : ''}`}
            style={session.status === 'Upcoming' ? { backgroundColor: customColor } : {}}>
            {session.status}
          </span>
        </div>
        
        <div className="row mb-2">
          <div className="col-6">
            <p className="mb-1"><FaUser className="me-1" style={{ color: customColor }} /> {session.trainer}</p>
            <p className="mb-1"><strong>Date:</strong> {session.date}</p>
          </div>
          <div className="col-6">
            <p className="mb-1"><strong>Time:</strong> {session.time}</p>
            <p className="mb-1"><strong>Duration:</strong> {session.duration} min</p>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-light text-dark">{session.branchName}</span>
          <div className="btn-group btn-group-sm" role="group">
            <button 
              className="btn" 
              style={{ borderColor: customColor, color: customColor }}
              title="View"
              onClick={() => handleViewSession(session)}
            >
              <FaEye />
            </button>
            {session.status === 'Upcoming' && (
              <>
                <button 
                  className="btn btn-outline-success" 
                  title="Complete"
                  onClick={() => handleStatusChange(session.id, 'Completed')}
                >
                  <FaCheck />
                </button>
                <button 
                  className="btn btn-outline-danger" 
                  title="Cancel"
                  onClick={() => handleStatusChange(session.id, 'Cancelled')}
                >
                  <FaTimes />
                </button>
              </>
            )}
            <button 
              className="btn btn-outline-danger" 
              title="Delete"
              onClick={() => openDeleteModal(session)}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Session Bookings</h2>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4 col-lg-3">
              <div className="input-group">
                <span className="input-group-text"><FaSearch /></span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search sessions..."
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <div className="input-group">
                <span className="input-group-text"><FaFilter /></span>
                <select 
                  className="form-select" 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <div className="input-group">
                <span className="input-group-text"><FaFilter /></span>
                <select 
                  className="form-select" 
                  value={branchFilter} 
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="All">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-12 col-md-2 col-lg-5 d-flex justify-content-end mt-2 mt-md-0">
              <button 
                className="btn text-white w-100 w-md-auto" 
                style={{ backgroundColor: customColor }} 
                onClick={() => setShowAddSessionModal(true)}
              >
                <FaPlus className="me-1" /> Add Session
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {/* Desktop Table View */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Session Name</th>
                    <th>Trainer</th>
                    <th>Date & Time</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.length > 0 ? filteredSessions.map(s => (
                    <tr key={s.id}>
                      <td>{s.sessionName}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUser className="me-2" style={{ color: customColor }} />
                          <span>{s.trainer}</span>
                        </div>
                      </td>
                      <td>
                        <div>{s.date}</div>
                        <div className="text-muted small">{s.time}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {s.branchName}
                        </span>
                      </td>
                      <td>
                        <span className={`badge 
                          ${s.status === 'Completed' ? 'bg-success' :
                            s.status === 'Cancelled' ? 'bg-danger' : ''}`}
                          style={s.status === 'Upcoming' ? { backgroundColor: customColor } : {}}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm" 
                            style={{ borderColor: customColor, color: customColor }}
                            title="View"
                            onClick={() => handleViewSession(s)}
                          >
                            <FaEye />
                          </button>
                          {s.status === 'Upcoming' && (
                            <>
                              <button 
                                className="btn btn-sm btn-outline-success" 
                                title="Complete"
                                onClick={() => handleStatusChange(s.id, 'Completed')}
                              >
                                <FaCheck />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                title="Cancel"
                                onClick={() => handleStatusChange(s.id, 'Cancelled')}
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Delete"
                            onClick={() => openDeleteModal(s)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No sessions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none p-3">
            {filteredSessions.length > 0 ? filteredSessions.map(s => (
              <SessionCard key={s.id} session={s} />
            )) : (
              <div className="text-center py-4">
                No sessions found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Session Modal - Increased width and responsive */}
      {showAddSessionModal && (
        <>
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header" style={{ backgroundColor: customColor, color: 'white' }}>
                  <h5 className="modal-title">Add New Session</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowAddSessionModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Session Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={newSession.sessionName} 
                        onChange={(e) => setNewSession({...newSession, sessionName: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Session Trainer *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={newSession.trainer} 
                        onChange={(e) => setNewSession({...newSession, trainer: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Date *</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={newSession.date} 
                        onChange={(e) => setNewSession({...newSession, date: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Time *</label>
                      <select 
                        className="form-select" 
                        value={newSession.time} 
                        onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                        required
                      >
                        <option value="">Select time</option>
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Duration (minutes)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={newSession.duration} 
                        onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value) || 60})} 
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Branch Name *</label>
                      <select 
                        className="form-select" 
                        value={newSession.branchName} 
                        onChange={(e) => setNewSession({...newSession, branchName: e.target.value})}
                        required
                      >
                        <option value="">Select branch</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        value={newSession.description} 
                        onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddSessionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn text-white" 
                    style={{ backgroundColor: customColor }} 
                    onClick={handleAddSession}
                  >
                    Add Session
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* View Session Modal */}
      {showViewSessionModal && selectedSession && (
        <>
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header" style={{ backgroundColor: customColor, color: 'white' }}>
                  <h5 className="modal-title">{selectedSession.sessionName}</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowViewSessionModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <h6 className="text-muted">Session Information</h6>
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <p><strong>Trainer:</strong> {selectedSession.trainer}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p><strong>Date:</strong> {selectedSession.date}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p><strong>Time:</strong> {selectedSession.time}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p><strong>Duration:</strong> {selectedSession.duration} minutes</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p><strong>Branch:</strong> {selectedSession.branchName}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className={`badge 
                            ${selectedSession.status === 'Completed' ? 'bg-success' :
                              selectedSession.status === 'Cancelled' ? 'bg-danger' : ''}`}
                            style={selectedSession.status === 'Upcoming' ? { backgroundColor: customColor } : {}}>
                            {selectedSession.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted">Description</h6>
                    <p>{selectedSession.description}</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex flex-wrap gap-2 w-100">
                    {selectedSession.status === 'Upcoming' && (
                      <>
                        <button 
                          className="btn btn-success flex-fill flex-md-grow-0" 
                          onClick={() => {
                            handleStatusChange(selectedSession.id, 'Completed');
                          }}
                        >
                          <FaCheck className="me-1" /> Complete
                        </button>
                        <button 
                          className="btn btn-danger flex-fill flex-md-grow-0" 
                          onClick={() => {
                            handleStatusChange(selectedSession.id, 'Cancelled');
                          }}
                        >
                          <FaTimes className="me-1" /> Cancel
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-outline-danger flex-fill flex-md-grow-0" 
                      onClick={() => openDeleteModal(selectedSession)}
                    >
                      <FaTrash className="me-1" /> Delete
                    </button>
                    <button 
                      className="btn btn-secondary flex-fill flex-md-grow-0" 
                      onClick={() => setShowViewSessionModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSession && (
        <>
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header" style={{ backgroundColor: customColor, color: 'white' }}>
                  <h5 className="modal-title">Delete Session</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this session?</p>
                  <div className="alert alert-light">
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <strong>Session:</strong> {selectedSession.sessionName}
                      </div>
                      <div className="col-12 col-md-6">
                        <strong>Trainer:</strong> {selectedSession.trainer}
                      </div>
                      <div className="col-12 col-md-6">
                        <strong>Date:</strong> {selectedSession.date}
                      </div>
                      <div className="col-12 col-md-6">
                        <strong>Time:</strong> {selectedSession.time}
                      </div>
                      <div className="col-12">
                        <strong>Branch:</strong> {selectedSession.branchName}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary flex-fill flex-md-grow-0" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger flex-fill flex-md-grow-0" 
                    onClick={handleDeleteSession}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default SessionBookingPage;