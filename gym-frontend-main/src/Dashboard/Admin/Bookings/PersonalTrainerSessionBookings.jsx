import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEdit, FaTrash, FaSearch, FaFilter, FaUser, FaPlus, FaEye } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../../Api/axiosInstance';
import BaseUrl from '../../../Api/BaseUrl';
import GetAdminId from '../../../Api/GetAdminId';

const SessionBookingPage = () => {
  const adminId = GetAdminId();
  const [sessions, setSessions] = useState([]);
  const [branches, setBranches] = useState([]);
  // Static trainer options instead of fetching from API
  const [trainers] = useState([
    { id: 'general', fullName: 'General Trainer' },
    { id: 'personal', fullName: 'Personal Trainer' }
  ]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showViewSessionModal, setShowViewSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Use trainerId, not trainerName
  const [newSession, setNewSession] = useState({
    sessionName: '',
    trainerId: '', // ← ID
    branchId: '',
    date: '',
    time: '',
    duration: 60,
    description: '',
    status: 'Upcoming'
  });

  const customColor = '#6EB2CC';

  useEffect(() => {
    if (!adminId) {
      setError('Admin ID not found. Please log in.');
      return;
    }
    fetchBranches();
    // Removed fetchTrainers() call since we're using static data
  }, [adminId]);

  // Re-fetch sessions when branches load
  useEffect(() => {
    if (branches.length > 0) {
      fetchSessions();
    }
  }, [branches]);

  // ✅ FIX: Fetch Sessions using branchId instead of adminId
  const fetchSessions = async () => {
    setLoading(true);
    try {
      let allSessions = [];
      
      // Fetch sessions for each branch
      for (const branch of branches) {
        try {
          const res = await axiosInstance.get(`${BaseUrl}sessions/${branch.id}`);
          if (res.data.success && res.data.sessions) {
            allSessions = [...allSessions, ...res.data.sessions];
          }
        } catch (err) {
          console.error(`Error fetching sessions for branch ${branch.id}:`, err);
        }
      }
      
      // Enrich with branchName and trainerName
      const enrichedSessions = allSessions.map(sess => {
        const branch = branches.find(b => b.id === sess.branchId);
        const trainer = trainers.find(t => t.id === sess.trainerId);
        return {
          ...sess,
          branchName: branch?.name || '—',
          trainerName: trainer?.fullName || '—' // ✅ Fixed: Use fullName instead of name
        };
      });
      
      setSessions(enrichedSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Unable to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Fetch Branches with correct URL
  const fetchBranches = async () => {
    try {
      const res = await axiosInstance.get(`${BaseUrl}branches/by-admin/${adminId}`);
      let branchList = [];
      if (res.data.success) {
        if (res.data.branches && Array.isArray(res.data.branches)) {
          branchList = res.data.branches;
        }
      }
      setBranches(branchList);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setBranches([]);
    }
  };

  // Removed fetchTrainers function since we're using static data

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
    const matchesBranch = branchFilter === 'All' || session.branchName === branchFilter;
    const matchesSearch =
      !searchQuery ||
      session.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.trainerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesBranch && matchesSearch;
  });

  const formatDate = (isoStr) => isoStr ? isoStr.split('T')[0] : '';
  const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setShowViewSessionModal(true);
  };

  const handleAddSession = async () => {
    const { sessionName, trainerId, branchId, date, time, duration, description } = newSession;

    if (!sessionName || !trainerId || !branchId || !date || !time || !description) {
      setError('Please fill all required fields');
      return;
    }

    // Validate numbers
    const numTrainerId = trainerId; // Keep as string since we're using static options
    const numBranchId = Number(branchId);
    const numDuration = Number(duration);

    if (isNaN(numBranchId) || isNaN(numDuration) || numDuration <= 0) {
      setError('Please fill valid values for branch and duration.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        sessionName: sessionName.trim(),
        trainerId: numTrainerId,   // ✅ Send ID (string for static options)
        branchId: numBranchId,     // ✅ Send ID
        date,                      // "YYYY-MM-DD"
        time,                      // "HH:mm"
        duration: numDuration,
        description: description.trim(),
        status: 'Upcoming'
      };

      const res = await axiosInstance.post(`${BaseUrl}sessions/create`, payload);
      if (res.data.success) {
        await fetchSessions();
        setNewSession({
          sessionName: '',
          trainerId: '',
          branchId: '',
          date: '',
          time: '',
          duration: 60,
          description: '',
          status: 'Upcoming'
        });
        setShowAddSessionModal(false);
        alert('✅ Session created successfully!');
      } else {
        setError(res.data.message || 'Failed to create session');
      }
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axiosInstance.put(`${BaseUrl}sessions/status/${id}`, { status: newStatus });
      if (res.data.success) {
        setSessions(sessions.map(s => (s.id === id ? { ...s, status: newStatus } : s)));
        if (selectedSession && selectedSession.id === id) {
          setSelectedSession({ ...selectedSession, status: newStatus });
        }
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Error updating session status');
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;
    setLoading(true);
    try {
      const res = await axiosInstance.delete(`${BaseUrl}sessions/delete/${selectedSession.id}`);
      if (res.data.success) {
        setSessions(sessions.filter(s => s.id !== selectedSession.id));
        setShowDeleteModal(false);
        setShowViewSessionModal(false);
        setSelectedSession(null);
        alert('✅ Session deleted!');
      } else {
        setError('Failed to delete session');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (session) => {
    setSelectedSession(session);
    setShowDeleteModal(true);
  };

  const uniqueBranchNames = [...new Set(sessions.map(s => s.branchName).filter(Boolean))];

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      timeOptions.push(`${h}:${m}`);
    }
  }

  const SessionCard = ({ session }) => (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">{session.sessionName}</h5>
          <span className={`badge ${
            session.status === 'Completed' ? 'bg-success' :
            session.status === 'Cancelled' ? 'bg-danger' : ''
          }`} style={session.status === 'Upcoming' ? { backgroundColor: customColor } : {}}>
            {session.status}
          </span>
        </div>
        <div className="row mb-2">
          <div className="col-6">
            <p className="mb-1"><FaUser className="me-1" style={{ color: customColor }} /> {session.trainerName || '—'}</p>
            <p className="mb-1"><strong>Date:</strong> {formatDate(session.date)}</p>
          </div>
          <div className="col-6">
            <p className="mb-1"><strong>Time:</strong> {formatTimeDisplay(session.time)}</p>
            <p className="mb-1"><strong>Duration:</strong> {session.duration} min</p>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-light text-dark">{session.branchName || '—'}</span>
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
                  {uniqueBranchNames.map(branch => (
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
          {loading && sessions.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ color: customColor }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading sessions...</p>
            </div>
          ) : filteredSessions.length > 0 ? (
            <>
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
                      {filteredSessions.map(s => (
                        <tr key={s.id}>
                          <td>{s.sessionName}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaUser className="me-2" style={{ color: customColor }} />
                              <span>{s.trainerName || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <div>{formatDate(s.date)}</div>
                            <div className="text-muted small">{formatTimeDisplay(s.time)}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">{s.branchName || '—'}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              s.status === 'Completed' ? 'bg-success' :
                              s.status === 'Cancelled' ? 'bg-danger' : ''
                            }`} style={s.status === 'Upcoming' ? { backgroundColor: customColor } : {}}>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="d-md-none p-3">
                {filteredSessions.map(s => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p>No sessions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Session Modal */}
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
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Session Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newSession.sessionName}
                        onChange={(e) => setNewSession({ ...newSession, sessionName: e.target.value.trim() })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Trainer *</label>
                      <select
                        className="form-select"
                        value={newSession.trainerId}
                        onChange={(e) => setNewSession({ ...newSession, trainerId: e.target.value })}
                        required
                      >
                        <option value="">Select trainer</option>
                        {trainers.map(t => (
                          <option key={t.id} value={t.id}>{t.fullName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Branch *</label>
                      <select
                        className="form-select"
                        value={newSession.branchId}
                        onChange={(e) => setNewSession({ ...newSession, branchId: e.target.value })}
                        required
                      >
                        <option value="">Select branch</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newSession.date}
                        onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Time *</label>
                      <select
                        className="form-select"
                        value={newSession.time}
                        onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                        required
                      >
                        <option value="">Select time</option>
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{formatTimeDisplay(time)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Duration (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={newSession.duration}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewSession({ ...newSession, duration: val === '' ? '' : Number(val) });
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newSession.description}
                        onChange={(e) => setNewSession({ ...newSession, description: e.target.value.trim() })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowAddSessionModal(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn text-white"
                    style={{ backgroundColor: customColor }}
                    onClick={handleAddSession}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Add Session'}
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
                        <p><strong>Trainer:</strong> {selectedSession.trainerName || '—'}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p><strong>Date:</strong> {formatDate(selectedSession.date)}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p><strong>Time:</strong> {formatTimeDisplay(selectedSession.time)}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p><strong>Duration:</strong> {selectedSession.duration} minutes</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p><strong>Branch:</strong> {selectedSession.branchName || '—'}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className={`badge ${
                            selectedSession.status === 'Completed' ? 'bg-success' :
                            selectedSession.status === 'Cancelled' ? 'bg-danger' : ''
                          }`} style={selectedSession.status === 'Upcoming' ? { backgroundColor: customColor } : {}}>
                            {selectedSession.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted">Description</h6>
                    <p>{selectedSession.description || '—'}</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex flex-wrap gap-2 w-100">
                    {selectedSession.status === 'Upcoming' && (
                      <>
                        <button
                          className="btn btn-success flex-fill flex-md-grow-0"
                          onClick={() => handleStatusChange(selectedSession.id, 'Completed')}
                        >
                          <FaCheck className="me-1" /> Complete
                        </button>
                        <button
                          className="btn btn-danger flex-fill flex-md-grow-0"
                          onClick={() => handleStatusChange(selectedSession.id, 'Cancelled')}
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

      {/* Delete Confirmation */}
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
                      <div className="col-12"><strong>Session:</strong> {selectedSession.sessionName}</div>
                      <div className="col-12"><strong>Trainer:</strong> {selectedSession.trainerName}</div>
                      <div className="col-12"><strong>Branch:</strong> {selectedSession.branchName}</div>
                      <div className="col-12"><strong>Date & Time:</strong> {formatDate(selectedSession.date)} at {formatTimeDisplay(selectedSession.time)}</div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={handleDeleteSession} disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete'}
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