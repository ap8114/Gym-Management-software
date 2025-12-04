import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaUserPlus, FaTimes } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClassesSchedule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedClass, setSelectedClass] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');

  // Classes data - each class has a members array for counting
  const [classes, setClasses] = useState([
    {
      id: 101,
      class_name: "Strength Training",
      trainer_name: "John Smith",
      date: "2023-06-20",
      time: "10:00 - 11:00",
      schedule_day: "Tuesday",
      status: "Active",
      branch: "Downtown",
      members: ["Alice", "Bob"]  // 2 members here - count = 2
    },
    {
      id: 102,
      class_name: "Cardio & HIIT",
      trainer_name: "Mike Williams",
      date: "2023-06-22",
      time: "14:00 - 15:00",
      schedule_day: "Thursday",
      status: "Active",
      branch: "North Branch",
      members: ["Charlie"]  // 1 member here - count = 1
    }
  ]);

  const handleAddNew = () => {
    setModalType('add');
    setSelectedClass({ members: [], branch: "Downtown" });  // New class with 0 members and default branch
    setMemberSearch('');
    setIsModalOpen(true);
  };

  const handleView = (gymClass) => {
    setModalType('view');
    setSelectedClass(gymClass);
    setMemberSearch('');
    setIsModalOpen(true);
  };

  const handleEdit = (gymClass) => {
    setModalType('edit');
    setSelectedClass({ ...gymClass });
    setMemberSearch('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (gymClass) => {
    setSelectedClass(gymClass);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClass) {
      setClasses(prev => prev.filter(c => c.id !== selectedClass.id));
      alert(`Class "${selectedClass.class_name}" has been deleted.`);
    }
    setIsDeleteModalOpen(false);
    setSelectedClass(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    setMemberSearch('');
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedClass(null);
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      Active: "bg-success-subtle text-success-emphasis",
      Inactive: "bg-danger-subtle text-danger-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getBranchBadge = (branch) => {
    return (
      <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-1">
        {branch}
      </span>
    );
  };

  const getNextClassId = () => {
    const maxId = classes.length > 0 ? Math.max(...classes.map(c => parseInt(c.id))) : 0;
    return `CLASS${String(maxId + 1).padStart(3, '0')}`;
  };

  // Function to add a member - adds name to members array
  const addMember = () => {
    if (!memberSearch.trim()) return;
    
    // Check if member already exists
    if (selectedClass?.members?.includes(memberSearch.trim())) {
      alert(`"${memberSearch}" is already in this class.`);
      return;
    }
    
    // Add new member to the members array
    setSelectedClass({
      ...selectedClass,
      members: [...(selectedClass.members || []), memberSearch.trim()]
    });
    setMemberSearch('');
  };

  // Function to remove a member - removes name from members array
  const removeMember = (member) => {
    if (!selectedClass) return;
    setSelectedClass({
      ...selectedClass,
      members: selectedClass.members.filter(m => m !== member)
    });
  };

  const saveClass = () => {
    if (!selectedClass.class_name || !selectedClass.trainer_name) {
      alert("Please fill class name and trainer.");
      return;
    }

    if (modalType === 'add') {
      const newClass = { 
        ...selectedClass, 
        id: getNextClassId(),
        date: selectedClass.date || new Date().toISOString().split('T')[0],
        schedule_day: selectedClass.schedule_day || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        time: selectedClass.time || "10:00 - 11:00",
        status: selectedClass.status || "Active",
        branch: selectedClass.branch || "Downtown",
        members: selectedClass.members || []  // Members are being saved
      };
      setClasses(prev => [...prev, newClass]);
      alert('New class added successfully!');
    } else if (modalType === 'edit') {
      setClasses(prev => prev.map(c => c.id === selectedClass.id ? selectedClass : c));
      alert('Class updated successfully!');
    }
    closeModal();
  };

  // Mobile card view for classes
  const MobileClassCard = ({ gymClass }) => (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">{gymClass.class_name}</h5>
          <div className="d-flex gap-1">
            <button 
              className="btn btn-sm btn-outline-secondary action-btn" 
              title="View"
              onClick={() => handleView(gymClass)}
            >
              <FaEye size={14} />
            </button>
            <button 
              className="btn btn-sm" 
              title="Edit"
              onClick={() => handleEdit(gymClass)}
              style={{ 
                borderColor: '#6EB2CC',
                color: '#6EB2CC'
              }}
            >
              <FaEdit size={14} />
            </button>
            <button 
              className="btn btn-sm btn-outline-danger action-btn" 
              title="Delete"
              onClick={() => handleDeleteClick(gymClass)}
            >
              <FaTrashAlt size={14} />
            </button>
          </div>
        </div>
        
        <div className="row mb-2">
          <div className="col-6">
            <p className="mb-1"><strong>Trainer:</strong> {gymClass.trainer_name}</p>
            <p className="mb-1"><strong>Branch:</strong> {getBranchBadge(gymClass.branch)}</p>
          </div>
          <div className="col-6">
            <p className="mb-1"><strong>Date:</strong> {gymClass.date}</p>
            <p className="mb-1"><strong>Time:</strong> {gymClass.time}</p>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="me-2"><strong>Day:</strong> {gymClass.schedule_day}</span>
            <span><strong>Status:</strong> {getStatusBadge(gymClass.status)}</span>
          </div>
          <div>
            {/* Member count from members array length */}
            {(gymClass.members || []).length > 0 ? (
              <span className="badge bg-light text-dark">
                {(gymClass.members || []).length} {(gymClass.members || []).length === 1 ? 'Member' : 'Members'}
              </span>
            ) : (
              <span className="text-muted">No members</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">All Class Scheduled</h2>
          <p className="text-muted mb-0">Manage all gym classes, trainers, and member assignments.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn w-100 w-lg-auto"
            style={{ 
              backgroundColor: '#6EB2CC', 
              color: 'white', 
              borderRadius: '8px', 
              padding: '10px 20px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onClick={handleAddNew}
          >
            <FaUserPlus className="me-2" /> Add Class
          </button>
        </div>
      </div>

      {/* Desktop Table View - Hidden on Mobile */}
      <div className="d-none d-md-block">
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold">CLASS NAME</th>
                  <th className="fw-semibold">TRAINER</th>
                  <th className="fw-semibold">BRANCH</th>
                  <th className="fw-semibold">DATE</th>
                  <th className="fw-semibold">TIME</th>
                  <th className="fw-semibold">DAY</th>
                  <th className="fw-semibold">STATUS</th>
                  <th className="fw-semibold">MEMBERS</th>
                  <th className="fw-semibold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(c => (
                  <tr key={c.id}>
                    <td>{c.class_name}</td>
                    <td>{c.trainer_name}</td>
                    <td>{getBranchBadge(c.branch)}</td>
                    <td>{c.date}</td>
                    <td>{c.time}</td>
                    <td>{c.schedule_day}</td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>
                      {/* Member count from members array length */}
                      {(c.members || []).length > 0 ? (
                        <span className="badge bg-light text-dark">
                          {(c.members || []).length} {(c.members || []).length === 1 ? 'Member' : 'Members'}
                        </span>
                      ) : (
                        <span className="text-muted">No members</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button 
                          className="btn btn-sm btn-outline-secondary action-btn" 
                          title="View"
                          onClick={() => handleView(c)}
                        >
                          <FaEye size={14} />
                        </button>
                        <button 
                          className="btn btn-sm" 
                          title="Edit"
                          onClick={() => handleEdit(c)}
                          style={{ 
                            borderColor: '#6EB2CC',
                            color: '#6EB2CC'
                          }}
                        >
                          <FaEdit size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger action-btn" 
                          title="Delete"
                          onClick={() => handleDeleteClick(c)}
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Card View - Hidden on Desktop */}
      <div className="d-md-none">
        {classes.map(c => (
          <MobileClassCard key={c.id} gymClass={c} />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          // onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0" style={{ backgroundColor: '#6EB2CC', color: 'white' }}>
                <h5 className="modal-title fw-bold">
                  {modalType === 'add' ? 'Add New Class' : modalType === 'edit' ? 'Edit Class' : 'View Class'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Class Name <span className="text-danger">*</span></label>
                    <input 
                      className="form-control rounded-3" 
                      defaultValue={selectedClass?.class_name || ''} 
                      readOnly={modalType==='view'} 
                      onChange={e=>setSelectedClass({...selectedClass,class_name:e.target.value})}
                      placeholder="Enter class name"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Trainer Name <span className="text-danger">*</span></label>
                    <input 
                      className="form-control rounded-3" 
                      defaultValue={selectedClass?.trainer_name || ''} 
                      readOnly={modalType==='view'} 
                      onChange={e=>setSelectedClass({...selectedClass,trainer_name:e.target.value})}
                      placeholder="Enter trainer name"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Branch <span className="text-danger">*</span></label>
                    <select 
                      className="form-select rounded-3" 
                      defaultValue={selectedClass?.branch || 'Downtown'} 
                      disabled={modalType==='view'} 
                      onChange={e=>setSelectedClass({...selectedClass,branch:e.target.value})}
                    >
                      <option value="Downtown">Downtown</option>
                      <option value="North Branch">North Branch</option>
                      <option value="South Branch">South Branch</option>
                      <option value="East Branch">East Branch</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Date</label>
                    <input 
                      type="date"
                      className="form-control rounded-3" 
                      defaultValue={selectedClass?.date || ''} 
                      readOnly={modalType==='view'} 
                      onChange={e=>setSelectedClass({...selectedClass,date:e.target.value})}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Time</label>
                    <input 
                      className="form-control rounded-3" 
                      defaultValue={selectedClass?.time || ''} 
                      readOnly={modalType==='view'} 
                      onChange={e=>setSelectedClass({...selectedClass,time:e.target.value})}
                      placeholder="e.g., 10:00 - 11:00"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Day</label>
                    <select 
                      className="form-select rounded-3" 
                      defaultValue={selectedClass?.schedule_day || 'Monday'} 
                      disabled={modalType==='view'} 
                      onChange={e=>setSelectedClass({...selectedClass,schedule_day:e.target.value})}
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <select 
                      className="form-select rounded-3" 
                      defaultValue={selectedClass?.status || 'Active'} 
                      disabled={modalType==='view'} 
                      onChange={e=>setSelectedClass({...selectedClass,status:e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                {/* Members section */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Members 
                    {modalType !== 'view' && <span className="text-muted ms-2">Add members by typing their name</span>}
                  </label>
                  
                  {modalType === 'view' ? (
                    <div className="border rounded-3 p-3 bg-light">
                      {/* View mode - showing members */}
                      {(selectedClass?.members || []).length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {(selectedClass?.members || []).map(member => (
                            <span key={member} className="badge bg-light text-dark px-3 py-1">
                              {member}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">No members assigned to this class</p>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-3 p-3 bg-light">
                      <div className="d-flex flex-column flex-sm-row mb-3 gap-2">
                        <input
                          type="text"
                          className="form-control rounded-3"
                          placeholder="Type member name and click Add..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addMember()}
                        />
                        <button
                          className="btn btn-primary rounded-3"
                          onClick={addMember}
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Add/Edit mode - member count and list */}
                      {(selectedClass?.members || []).length > 0 && (
                        <div>
                          <small className="text-muted d-block mb-2">
                            {/* Member count from members array */}
                            {selectedClass.members.length} member{selectedClass.members.length > 1 ? 's' : ''} in this class:
                          </small>
                          <div className="d-flex flex-wrap gap-2">
                            {(selectedClass?.members || []).map(member => (
                              <span key={member} className="badge bg-light text-dark px-3 py-1 d-flex align-items-center">
                                {member}
                                <FaTimes
                                  className="ms-2"
                                  style={{ cursor: 'pointer', fontSize: '12px' }}
                                  onClick={() => removeMember(member)}
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {modalType !== 'view' && (
                  <div className="d-flex justify-content-end mt-4">
                    <button 
                      className="btn btn-outline-secondary me-2 px-4" 
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn px-4" 
                      style={{background:'#6EB2CC',color:'white'}} 
                      onClick={saveClass}
                    >
                      {modalType==='add'?'Add Class':'Update Class'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeDeleteModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0" style={{ backgroundColor: '#6EB2CC', color: 'white' }}>
                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will permanently delete <strong>{selectedClass?.class_name}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .action-btn {
            width: 28px;
            height: 28px;
          }
          
          .modal-dialog {
            max-width: 95%;
            margin: 1rem auto;
          }
        }
        
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.5rem;
          }
          .modal-content {
            border-radius: 0.5rem;
          }
          
          .table-responsive {
            border-radius: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ClassesSchedule;