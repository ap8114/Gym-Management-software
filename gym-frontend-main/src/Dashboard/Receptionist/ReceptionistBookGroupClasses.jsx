import React, { useState } from 'react';
import { FaEye, FaEdit, FaTimes, FaPlus, FaCalendarAlt, FaClock, FaUser, FaChalkboardTeacher, FaMoneyBillWave, FaTrash } from 'react-icons/fa';

const ReceptionistBookGroupClasses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'add', 'edit', 'view', 'cancel'
  const [bookingType, setBookingType] = useState('group'); // 'group' or 'pt'
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Pagination states
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sample data
  const [members] = useState([
    { id: 1, name: "Alex Johnson", phone: "+91 98765 43210" },
    { id: 2, name: "Priya Patel", phone: "+91 91234 56789" },
    { id: 3, name: "Amit Verma", phone: "+91 88888 77777" },
    { id: 4, name: "Sarah Kim", phone: "+91 77777 66666" },
    { id: 5, name: "Michael Brown", phone: "+91 66666 55555" }
  ]);

  const [trainers] = useState([
    { id: 1, name: "John Smith", specialty: "Strength Training" },
    { id: 2, name: "Emma Wilson", specialty: "Yoga & Pilates" },
    { id: 3, name: "David Lee", specialty: "Cardio & HIIT" },
    { id: 4, name: "Lisa Chen", specialty: "Weight Loss" }
  ]);

  const [groupClasses] = useState([
    { id: 1, name: "Morning Yoga", start_time: "07:00", end_time: "08:00", max_capacity: 15 },
    { id: 2, name: "HIIT Workout", start_time: "18:00", end_time: "19:00", max_capacity: 20 },
    { id: 3, name: "Zumba Dance", start_time: "19:30", end_time: "20:30", max_capacity: 25 },
    { id: 4, name: "Pilates Class", start_time: "10:00", end_time: "11:00", max_capacity: 12 }
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 1,
      member_id: 1,
      member_name: "Alex Johnson",
      type: "group",
      class_schedule_id: 1,
      class_name: "Morning Yoga",
      trainer_id: null,
      trainer_name: null,
      date: "2025-04-10",
      start_time: "07:00",
      end_time: "08:00",
      booking_status: "Booked",
      payment_status: "Paid",
      notes: "Prefers front row position"
    },
    {
      id: 2,
      member_id: 3,
      member_name: "Amit Verma",
      type: "pt",
      class_schedule_id: null,
      class_name: null,
      trainer_id: 2,
      trainer_name: "Emma Wilson",
      date: "2025-04-11",
      start_time: "17:00",
      end_time: "18:00",
      booking_status: "Booked",
      payment_status: "Pending",
      notes: "Focus on flexibility and core strength"
    },
    {
      id: 3,
      member_id: 2,
      member_name: "Priya Patel",
      type: "group",
      class_schedule_id: 3,
      class_name: "Zumba Dance",
      trainer_id: null,
      trainer_name: null,
      date: "2025-04-12",
      start_time: "19:30",
      end_time: "20:30",
      booking_status: "Completed",
      payment_status: "Paid",
      notes: "First time trying Zumba"
    },
    {
      id: 4,
      member_id: 4,
      member_name: "Sarah Kim",
      type: "pt",
      class_schedule_id: null,
      class_name: null,
      trainer_id: 1,
      trainer_name: "John Smith",
      date: "2025-04-09",
      start_time: "16:00",
      end_time: "17:00",
      booking_status: "Canceled",
      payment_status: "Refunded",
      notes: "Had to reschedule due to work conflict"
    }
  ]);

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentBookings = bookings.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(bookings.length / entriesPerPage);
  
  // Handle entries per page change
  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when entries per page changes
  };
  
  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAddNew = () => {
    setModalType('add');
    setSelectedBooking(null);
    setBookingType('group'); // Default to group classes
    setIsModalOpen(true);
  };

  const handleView = (booking) => {
    setModalType('view');
    setSelectedBooking(booking);
    setBookingType(booking.type);
    setIsModalOpen(true);
  };

  const handleEdit = (booking) => {
    setModalType('edit');
    setSelectedBooking(booking);
    setBookingType(booking.type);
    setIsModalOpen(true);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (selectedBooking) {
      setBookings(prev => 
        prev.map(b => 
          b.id === selectedBooking.id 
            ? { ...b, booking_status: "Canceled", payment_status: "Refunded" } 
            : b
        )
      );
      alert(`Booking for ${selectedBooking.member_name} has been canceled.`);
    }
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
  };

  // Prevent background scroll
  React.useEffect(() => {
    if (isModalOpen || isCancelModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isCancelModalOpen]);

  const getStatusBadge = (status, type) => {
    let badgeClasses = "";
    
    if (type === 'booking') {
      badgeClasses = {
        Booked: "bg-primary-subtle text-primary-emphasis",
        Completed: "bg-success-subtle text-success-emphasis",
        Canceled: "bg-danger-subtle text-danger-emphasis"
      };
    } else {
      badgeClasses = {
        Paid: "bg-success-subtle text-success-emphasis",
        Pending: "bg-warning-subtle text-warning-emphasis",
        Refunded: "bg-info-subtle text-info-emphasis"
      };
    }
    
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return `Book New ${bookingType === 'group' ? 'Group Class' : 'PT Session'}`;
      case 'edit': return `Edit ${bookingType === 'group' ? 'Group Class' : 'PT Session'} Booking`;
      case 'view':
      default: return `View ${bookingType === 'group' ? 'Group Class' : 'PT Session'} Booking`;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Generate next ID for new booking
  const getNextId = () => {
    return bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
  };

  // Handle form submission
  const handleSubmit = () => {
    const formData = {
      member_id: parseInt(document.querySelector('[name="member_id"]').value),
      member_name: members.find(m => m.id === parseInt(document.querySelector('[name="member_id"]').value))?.name || '',
      type: bookingType,
      date: document.querySelector('[name="date"]').value,
      start_time: document.querySelector('[name="start_time"]').value,
      end_time: document.querySelector('[name="end_time"]').value,
      booking_status: document.querySelector('[name="booking_status"]').value,
      payment_status: document.querySelector('[name="payment_status"]').value,
      notes: document.querySelector('[name="notes"]').value
    };

    if (bookingType === 'group') {
      formData.class_schedule_id = parseInt(document.querySelector('[name="class_schedule_id"]').value);
      formData.class_name = groupClasses.find(c => c.id === parseInt(document.querySelector('[name="class_schedule_id"]').value))?.name || '';
      formData.trainer_id = null;
      formData.trainer_name = null;
    } else {
      formData.trainer_id = parseInt(document.querySelector('[name="trainer_id"]').value);
      formData.trainer_name = trainers.find(t => t.id === parseInt(document.querySelector('[name="trainer_id"]').value))?.name || '';
      formData.class_schedule_id = null;
      formData.class_name = null;
    }

    if (modalType === 'add') {
      const newBooking = {
        id: getNextId(),
        ...formData
      };
      setBookings(prev => [...prev, newBooking]);
      alert(`${bookingType === 'group' ? 'Group class' : 'PT session'} booked successfully!`);
    } else if (modalType === 'edit' && selectedBooking) {
      const updatedBooking = {
        ...selectedBooking,
        ...formData
      };
      setBookings(prev =>
        prev.map(b => b.id === selectedBooking.id ? updatedBooking : b)
      );
      alert(`${bookingType === 'group' ? 'Group class' : 'PT session'} booking updated successfully!`);
    }
    closeModal();
  };

  return (
    <div className="">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Book Group Classes & PT Sessions</h2>
          <p className="text-muted mb-0">Manage bookings for group classes and personal training sessions.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn d-flex align-items-center ms-auto col-lg-6 col-12"
            style={{
              backgroundColor: '#6EB2CC',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onClick={handleAddNew}
          >
            <FaPlus className="me-2 " /> New Booking
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group">
            <input
              type="text"
              className="form-control border"
              placeholder="Search by member name..."
            />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-filter me-1"></i> Filter
          </button>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-file-export me-1"></i> Export
          </button>
        </div>
      </div>

      {/* Show Entries Dropdown */}
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center">
            <span className="me-2">Show</span>
            <select 
              className="form-select form-select-sm w-auto" 
              value={entriesPerPage}
              onChange={handleEntriesChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ms-2">entries</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold">MEMBER</th>
                <th className="fw-semibold">TYPE</th>
                <th className="fw-semibold">CLASS/TRAINER</th>
                <th className="fw-semibold">DATE</th>
                <th className="fw-semibold">TIME</th>
                <th className="fw-semibold">BOOKING STATUS</th>
                <th className="fw-semibold">PAYMENT STATUS</th>
                <th className="fw-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div>
                      <strong>{booking.member_name}</strong>
                      <div className="small text-muted">{members.find(m => m.id === booking.member_id)?.phone}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${
                      booking.type === 'group' ? 'bg-info-subtle text-info-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'
                    } px-2 py-1`}>
                      {booking.type === 'group' ? 'Group Class' : 'PT Session'}
                    </span>
                  </td>
                  <td>
                    {booking.type === 'group' ? booking.class_name : booking.trainer_name}
                  </td>
                  <td>{formatDate(booking.date)}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaClock className="text-muted me-1" size={12} />
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </td>
                  <td>{getStatusBadge(booking.booking_status, 'booking')}</td>
                  <td>{getStatusBadge(booking.payment_status, 'payment')}</td>
                  <td className="text-center">
                    <div className="d-flex flex-row gap-1 justify-content-center align-items-center">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        title="View"
                        onClick={() => handleView(booking)}
                        // disabled={modalType === 'view'}
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="Edit"
                        onClick={() => handleEdit(booking)}
                        // disabled={booking.booking_status === 'Completed' || booking.booking_status === 'Canceled'}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Cancel"
                        onClick={() => handleCancelClick(booking)}
                        // disabled={booking.booking_status === 'Completed' || booking.booking_status === 'Canceled'}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="row mt-3">
        <div className="col-12 col-md-5">
          <div className="d-flex align-items-center">
            <span>
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, bookings.length)} of {bookings.length} entries
            </span>
          </div>
        </div>
        <div className="col-12 col-md-7">
          <div className="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={prevPage}>
                    Previous
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(1)}>
                    1
                  </button>
                </li>
                {totalPages > 1 && (
                  <li className={`page-item ${currentPage === 2 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(2)}>
                      2
                    </button>
                  </li>
                )}
                {totalPages > 2 && (
                  <li className={`page-item ${currentPage === 3 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(3)}>
                      3
                    </button>
                  </li>
                )}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={nextPage}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* MAIN MODAL (Add/Edit/View) */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{getModalTitle()}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                {modalType === 'add' && (
                  <div className="mb-4">
                    <label className="form-label fw-bold mb-3">Booking Type</label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${bookingType === 'group' ? 'btn-info' : 'btn-outline-secondary'}`}
                        onClick={() => setBookingType('group')}
                      >
                        Group Class
                      </button>
                      <button
                        type="button"
                        className={`btn ${bookingType === 'pt' ? 'btn-info' : 'btn-outline-secondary'}`}
                        onClick={() => setBookingType('pt')}
                      >
                        Personal Training
                      </button>
                    </div>
                  </div>
                )}

                <form>
                  {/* Member Selection */}
                  <div className="mb-3">
                    <label className="form-label d-flex align-items-center">
                      <FaUser className="me-2 text-muted" /> Member <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select rounded-3"
                      name="member_id"
                      defaultValue={selectedBooking?.member_id || ''}
                      disabled={modalType === 'view'}
                      required
                    >
                      <option value="">Select a member</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class/Trainer Selection */}
                  {bookingType === 'group' ? (
                    <div className="mb-3">
                      <label className="form-label d-flex align-items-center">
                        <FaChalkboardTeacher className="me-2 text-muted" /> Group Class <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        name="class_schedule_id"
                        defaultValue={selectedBooking?.class_schedule_id || ''}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="">Select a class</option>
                        {groupClasses.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.start_time} - {cls.end_time})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label d-flex align-items-center">
                        <FaChalkboardTeacher className="me-2 text-muted" /> Trainer <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        name="trainer_id"
                        defaultValue={selectedBooking?.trainer_id || ''}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="">Select a trainer</option>
                        {trainers.map(trainer => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.name} ({trainer.specialty})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label d-flex align-items-center">
                        <FaCalendarAlt className="me-2 text-muted" /> Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        name="date"
                        defaultValue={selectedBooking?.date || ''}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label d-flex align-items-center">
                        <FaClock className="me-2 text-muted" /> Start Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className="form-control rounded-3"
                        name="start_time"
                        defaultValue={selectedBooking?.start_time || ''}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label d-flex align-items-center">
                        <FaClock className="me-2 text-muted" /> End Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className="form-control rounded-3"
                        name="end_time"
                        defaultValue={selectedBooking?.end_time || ''}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                  </div>

                  {/* Status Fields */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Booking Status <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        name="booking_status"
                        defaultValue={selectedBooking?.booking_status || 'Booked'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="Booked">Booked</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label d-flex align-items-center">
                        <FaMoneyBillWave className="me-2 text-muted" /> Payment Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        name="payment_status"
                        defaultValue={selectedBooking?.payment_status || 'Pending'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control rounded-3"
                      name="notes"
                      rows="3"
                      placeholder="Any additional information..."
                      defaultValue={selectedBooking?.notes || ''}
                      disabled={modalType === 'view'}
                    ></textarea>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    {modalType !== 'view' && (
                      <button
                        type="button"
                        className="btn"
                        style={{
                          backgroundColor: '#2598c5ff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: '500',
                        }}
                        onClick={handleSubmit}
                      >
                        {modalType === 'add' ? 'Book Now' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {isCancelModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeCancelModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirm Cancellation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeCancelModal}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will cancel the {selectedBooking?.type === 'group' ? 'group class' : 'PT session'} booking for <strong>{selectedBooking?.member_name}</strong> on <strong>{selectedBooking ? formatDate(selectedBooking.date) : ''}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={closeCancelModal}
                >
                  Don't Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={confirmCancel}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistBookGroupClasses;



// import React, { useState, useEffect } from 'react';
// import { FaEye, FaEdit, FaTrashAlt, FaUserPlus, FaTimes } from 'react-icons/fa';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import GetAdminId from '../../Api/GetAdminId';
// import axiosInstance from '../../Api/axiosInstance';

// const ReceptionistBookGroupClasses = () => {
//   const userId = GetAdminId();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [modalType, setModalType] = useState('add');
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [memberSearch, setMemberSearch] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [classes, setClasses] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [trainers, setTrainers] = useState([]);
//   const [members, setMembers] = useState([]); // For member dropdown

//      const getUserFromStorage = () => {
//     try {
//       const userStr = localStorage.getItem('user');
//       return userStr ? JSON.parse(userStr) : null;
//     } catch (err) {
//       console.error('Error parsing user from localStorage:', err);
//       return null;
//     }
//   };

//   const user = getUserFromStorage();
//   const memberId = user?.id || null;
//   const adminId = user?.adminId || null;
//   const branchId = user?.branchId || null;

//   console.log('Member ID:', memberId);
//   console.log('Admin ID:', adminId);
//   console.log('Branch ID:', branchId);


//   useEffect(() => {
//     if (!userId) {
//       setError('Admin ID not found. Please log in.');
//       return;
//     }
//     fetchAllData();
//   }, [userId]);

//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       // Fetch branches
//       const branchesRes = await axiosInstance.get(`branches/by-admin/${adminId}`);
//       let branchList = [];
//       console.log('Branches API response:', branchesRes.data);
      
//       if (branchesRes.data.success) {
//         // Handle different response structures
//         if (branchesRes.data.branch) {
//           branchList = Array.isArray(branchesRes.data.branch) ? branchesRes.data.branch : [branchesRes.data.branch];
//         } else if (branchesRes.data.branches) {
//           branchList = Array.isArray(branchesRes.data.branches) ? branchesRes.data.branches : [];
//         } else if (Array.isArray(branchesRes.data)) {
//           branchList = branchesRes.data;
//         }
//       }
//       setBranches(branchList);
//       console.log('Processed branches:', branchList);

//       // Fetch trainers
//       const trainersRes = await axiosInstance.get(`class/trainers`);
//       let trainerList = [];
//       console.log('Trainers API response:', trainersRes.data);
      
//       if (trainersRes.data.success) {
//         // Handle different response structures
//         if (trainersRes.data.trainers) {
//           trainerList = Array.isArray(trainersRes.data.trainers) ? trainersRes.data.trainers : [];
//         } else if (trainersRes.data.trainer) {
//           trainerList = Array.isArray(trainersRes.data.trainer) ? trainersRes.data.trainer : [trainersRes.data.trainer];
//         } else if (Array.isArray(trainersRes.data)) {
//           trainerList = trainersRes.data;
//         }
//       }
//       setTrainers(trainerList);
//       console.log('Processed trainers:', trainerList);

//       // Fetch members (plans = members)
//       const membersRes = await axiosInstance.get(`members/branch/${branchId}`);
//       let memberList = [];
//       console.log('Members API response:', membersRes.data);
      
//       if (membersRes.data.success) {
//         // Handle different response structures
//         let plans = [];
//         if (membersRes.data.plans) {
//           plans = Array.isArray(membersRes.data.plans) ? membersRes.data.plans : [];
//         } else if (membersRes.data.plan) {
//           plans = Array.isArray(membersRes.data.plan) ? membersRes.data.plan : [membersRes.data.plan];
//         } else if (Array.isArray(membersRes.data)) {
//           plans = membersRes.data;
//         }
        
//         memberList = plans.map(plan => ({
//           id: plan.id,
//           name: plan.name || plan.fullName || `Member ${plan.id}`
//         }));
//       }
//       setMembers(memberList);
//       console.log('Processed members:', memberList);

//       // Fetch classes
//       const classesRes = await axiosInstance.get(`class/scheduled/all`);
//       if (classesRes.data.success) {
//         setClasses(classesRes.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to load data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to add a member
//   const addMember = () => {
//     if (!memberSearch.trim()) return;

//     // Check if already added
//     if (selectedClass?.members?.some(m => m.name === memberSearch.trim())) {
//       alert(`"${memberSearch}" is already in this class.`);
//       return;
//     }

//     const newMember = {
//       id: Date.now(), // Temporary ID
//       name: memberSearch.trim()
//     };

//     setSelectedClass({
//       ...selectedClass,
//       members: [...(selectedClass.members || []), newMember]
//     });
//     setMemberSearch('');
//   };

//   // Function to remove a member
//   const removeMember = (memberToRemove) => {
//     if (!selectedClass) return;
//     setSelectedClass({
//       ...selectedClass,
//       members: selectedClass.members.filter(m => m.id !== memberToRemove.id)
//     });
//   };

//   const handleAddNew = () => {
//     setModalType('add');
//     setSelectedClass({
//       className: '',
//       trainerId: '',
//       branchId: branches.length > 0 ? branches[0].id : '',
//       date: '',
//       day: '',
//       startTime: '',
//       endTime: '',
//       capacity: 20,
//       status: 'Active',
//       members: []
//     });
//     setMemberSearch('');
//     setIsModalOpen(true);
//   };

//   const handleView = (gymClass) => {
//     setModalType('view');
//     // Parse the time string to get start and end times
//     const timeString = gymClass.time || '';
//     let startTime = '';
//     let endTime = '';
    
//     if (timeString.includes(' - ')) {
//       const [start, end] = timeString.split(' - ');
//       startTime = start.trim();
//       endTime = end.trim();
//     }
    
//     // Find trainer and branch IDs from names
//     const trainer = trainers.find(t => (t.fullName || t.name) === gymClass.trainer);
//     const branch = branches.find(b => b.name === gymClass.branch);
    
//     setSelectedClass({ 
//       ...gymClass, 
//       members: [], // API doesn't return members, so leave empty
//       trainerId: trainer?.id || '',
//       branchId: branch?.id || '',
//       startTime,
//       endTime
//     });
//     setMemberSearch('');
//     setIsModalOpen(true);
//   };

//   const handleEdit = (gymClass) => {
//     setModalType('edit');
//     // Parse the time string to get start and end times
//     const timeString = gymClass.time || '';
//     let startTime = '';
//     let endTime = '';
    
//     if (timeString.includes(' - ')) {
//       const [start, end] = timeString.split(' - ');
//       startTime = start.trim();
//       endTime = end.trim();
//     }
    
//     // Find trainer and branch IDs from names
//     const trainer = trainers.find(t => (t.fullName || t.name) === gymClass.trainer);
//     const branch = branches.find(b => b.name === gymClass.branch);
    
//     setSelectedClass({ 
//       ...gymClass, 
//       members: [], // No member editing from list
//       trainerId: trainer?.id || '',
//       branchId: branch?.id || '',
//       startTime,
//       endTime
//     });
//     setMemberSearch('');
//     setIsModalOpen(true);
//   };

//   const handleDeleteClick = (gymClass) => {
//     setSelectedClass(gymClass);
//     setIsDeleteModalOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedClass) return;
//     setLoading(true);
//     try {
//       // Assuming delete endpoint exists
//       await axiosInstance.delete(`class/scheduled/delete/${selectedClass.id}`);
//       setClasses(prev => prev.filter(c => c.id !== selectedClass.id));
//       alert(`Class "${selectedClass.className}" has been deleted.`);
//     } catch (err) {
//       console.error('Delete error:', err);
//       alert('Failed to delete class.');
//     } finally {
//       setIsDeleteModalOpen(false);
//       setSelectedClass(null);
//       setLoading(false);
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedClass(null);
//     setMemberSearch('');
//   };

//   const closeDeleteModal = () => {
//     setIsDeleteModalOpen(false);
//     setSelectedClass(null);
//   };

//   const getStatusBadge = (status) => {
//     const badgeClasses = {
//       Active: "bg-success-subtle text-success-emphasis",
//       Inactive: "bg-danger-subtle text-danger-emphasis"
//     };
//     return (
//       <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
//         {status}
//       </span>
//     );
//   };

//   const getBranchName = (branchId) => {
//     const branch = branches.find(b => b.id === branchId);
//     return branch?.name || '—';
//   };

//   const getTrainerName = (trainerId) => {
//     const trainer = trainers.find(t => t.id === trainerId);
//     return trainer?.fullName || trainer?.name || '—';
//   };

//   const saveClass = async () => {
//     const {
//       className,
//       trainerId,
//       branchId,
//       date,
//       day,
//       startTime,
//       endTime,
//       capacity,
//       status
//     } = selectedClass;

//     if (!className || !trainerId || !branchId || !date || !startTime || !endTime) {
//       alert("Please fill all required fields.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         className,
//         trainerId: Number(trainerId),
//         branchId: Number(branchId),
//         date,
//         day,
//         startTime,
//         endTime,
//         capacity: Number(capacity),
//         status
//       };

//       if (modalType === 'add') {
//         const res = await axiosInstance.post(`class/schedule/create`, payload);
//         if (res.data.success) {
//           await fetchAllData();
//           alert('New class added successfully!');
//         } else {
//           throw new Error(res.data.message || 'Failed to create class');
//         }
//       } else if (modalType === 'edit') {
//         const res = await axiosInstance.put(`class/scheduled/update/${selectedClass.id}`, payload);
//         if (res.data.success) {
//           await fetchAllData();
//           alert('Class updated successfully!');
//         } else {
//           throw new Error(res.data.message || 'Failed to update class');
//         }
//       }
//       closeModal();
//     } catch (err) {
//       console.error('Save error:', err);
//       alert(err.response?.data?.message || 'Operation failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const MobileClassCard = ({ gymClass }) => (
//     <div className="card mb-3 shadow-sm">
//       <div className="card-body">
//         <div className="d-flex justify-content-between align-items-start mb-2">
//           <h5 className="card-title mb-0">{gymClass.className}</h5>
//           <div className="d-flex gap-1">
//             <button className="btn btn-sm btn-outline-secondary" title="View" onClick={() => handleView(gymClass)}>
//               <FaEye size={14} />
//             </button>
//             <button className="btn btn-sm" title="Edit" onClick={() => handleEdit(gymClass)} style={{ borderColor: '#6EB2CC', color: '#6EB2CC' }}>
//               <FaEdit size={14} />
//             </button>
//             <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeleteClick(gymClass)}>
//               <FaTrashAlt size={14} />
//             </button>
//           </div>
//         </div>
//         <div className="row mb-2">
//           <div className="col-6">
//             <p className="mb-1"><strong>Trainer:</strong> {gymClass.trainer}</p>
//             <p className="mb-1"><strong>Branch:</strong> {gymClass.branch}</p>
//           </div>
//           <div className="col-6">
//             <p className="mb-1"><strong>Date:</strong> {gymClass.date ? gymClass.date.split('T')[0] : ''}</p>
//             <p className="mb-1"><strong>Time:</strong> {gymClass.time}</p>
//           </div>
//         </div>
//         <div className="d-flex justify-content-between align-items-center">
//           <div>
//             <span className="me-2"><strong>Day:</strong> {gymClass.day}</span>
//             <span><strong>Status:</strong> {getStatusBadge(gymClass.status)}</span>
//           </div>
//           <div>
//             {gymClass.membersCount !== undefined && gymClass.membersCount > 0 ? (
//               <span className="badge bg-light text-dark">
//                 {gymClass.membersCount} {gymClass.membersCount === 1 ? 'Member' : 'Members'}
//               </span>
//             ) : (
//               <span className="text-muted">No members</span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : '';

//   return (
//     <div className="container-fluid py-4">
//       <div className="row mb-4 align-items-center">
//         <div className="col-12 col-lg-8">
//           <h2 className="fw-bold">All Class Scheduled</h2>
//           <p className="text-muted mb-0">Manage all gym classes, trainers, and member assignments.</p>
//         </div>
//         <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
//           <button
//             className="btn w-100 w-lg-auto"
//             style={{
//               backgroundColor: '#6EB2CC',
//               color: 'white',
//               borderRadius: '8px',
//               padding: '10px 20px',
//               fontWeight: '500'
//             }}
//             onClick={handleAddNew}
//             disabled={loading}
//           >
//             <FaUserPlus className="me-2" /> Add Class
//           </button>
//         </div>
//       </div>

//       {loading && classes.length === 0 ? (
//         <div className="text-center py-5">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="mt-3">Loading classes...</p>
//         </div>
//       ) : (
//         <>
//           <div className="d-none d-md-block">
//             <div className="card shadow-sm border-0">
//               <div className="table-responsive">
//                 <table className="table table-hover align-middle mb-0">
//                   <thead className="bg-light">
//                     <tr>
//                       <th>CLASS NAME</th>
//                       <th>TRAINER</th>
//                       <th>BRANCH</th>
//                       <th>DATE</th>
//                       <th>TIME</th>
//                       <th>DAY</th>
//                       <th>STATUS</th>
//                       {/* <th>MEMBERS</th> */}
//                       <th className="text-center">ACTIONS</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {classes.map(c => (
//                       <tr key={c.id}>
//                         <td>{c.className}</td>
//                         <td>{c.trainer}</td>
//                         <td><span className="badge bg-primary-subtle text-primary-emphasis px-3 py-1">{c.branch}</span></td>
//                         <td>{c.date ? c.date.split('T')[0] : ''}</td>
//                         <td>{c.time}</td>
//                         <td>{c.day}</td>
//                         <td>{getStatusBadge(c.status)}</td>
//                         {/* <td>
//                           {c.membersCount !== undefined && c.membersCount > 0 ? (
//                             <span className="badge bg-light text-dark">
//                               {c.membersCount} {c.membersCount === 1 ? 'Member' : 'Members'}
//                             </span>
//                           ) : (
//                             <span className="text-muted">No members</span>
//                           )}
//                         </td> */}
//                         <td className="text-center">
//                           <div className="d-flex justify-content-center gap-1">
//                             <button className="btn btn-sm btn-outline-secondary" title="View" onClick={() => handleView(c)}>
//                               <FaEye size={14} />
//                             </button>
//                             <button className="btn btn-sm" title="Edit" onClick={() => handleEdit(c)} style={{ borderColor: '#6EB2CC', color: '#6EB2CC' }}>
//                               <FaEdit size={14} />
//                             </button>
//                             <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeleteClick(c)}>
//                               <FaTrashAlt size={14} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 {classes.length === 0 && (
//                   <div className="text-center py-4 text-muted">No classes scheduled.</div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="d-md-none">
//             {classes.length > 0 ? (
//               classes.map(c => <MobileClassCard key={c.id} gymClass={c} />)
//             ) : (
//               <div className="text-center py-4 text-muted">No classes scheduled.</div>
//             )}
//           </div>
//         </>
//       )}

//       {/* Modal */}
//       {isModalOpen && selectedClass && (
//         <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
//           <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
//             <div className="modal-content">
//               <div className="modal-header border-0 pb-0" style={{ backgroundColor: '#6EB2CC', color: 'white' }}>
//                 <h5 className="modal-title fw-bold">
//                   {modalType === 'add' ? 'Add New Class' : modalType === 'view' ? 'Class Details' : 'Edit Class'}
//                 </h5>
//                 <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
//               </div>
//               <div className="modal-body p-4">
//                 {branches.length === 0 && (
//                   <div className="alert alert-warning">
//                     No branches found. Please add branches first before creating classes.
//                   </div>
//                 )}
//                 {trainers.length === 0 && (
//                   <div className="alert alert-warning">
//                     No trainers found. Please add trainers first before creating classes.
//                   </div>
//                 )}
//                 <div className="row mb-3">
//                   <div className="col-md-6 mb-3">
//                     <label className="form-label fw-semibold">Class Name <span className="text-danger">*</span></label>
//                     <input
//                       className="form-control rounded-3"
//                       value={selectedClass.className || ''}
//                       readOnly={modalType === 'view'}
//                       onChange={e => setSelectedClass({ ...selectedClass, className: e.target.value })}
//                       placeholder="Enter class name"
//                     />
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label className="form-label fw-semibold">Trainer <span className="text-danger">*</span></label>
//                     {modalType === 'view' ? (
//                       <input
//                         className="form-control rounded-3"
//                         value={selectedClass.trainer || ''}
//                         readOnly
//                       />
//                     ) : (
//                       <select
//                         className="form-select rounded-3"
//                         value={selectedClass.trainerId || ''}
//                         onChange={e => setSelectedClass({ ...selectedClass, trainerId: e.target.value })}
//                         disabled={modalType === 'view' || trainers.length === 0}
//                       >
//                         <option value="">Select trainer</option>
//                         {trainers.map(t => (
//                           <option key={t.id} value={t.id}>{t.fullName || t.name}</option>
//                         ))}
//                       </select>
//                     )}
//                   </div>
//                 </div>
//                 <div className="row mb-3">
//                   <div className="col-md-6 mb-3">
//                     <label className="form-label fw-semibold">Branch <span className="text-danger">*</span></label>
//                     {modalType === 'view' ? (
//                       <input
//                         className="form-control rounded-3"
//                         value={selectedClass.branch || ''}
//                         readOnly
//                       />
//                     ) : (
//                       <select
//                         className="form-select rounded-3"
//                         value={selectedClass.branchId || ''}
//                         onChange={e => setSelectedClass({ ...selectedClass, branchId: e.target.value })}
//                         disabled={modalType === 'view' || branches.length === 0}
//                       >
//                         <option value="">Select branch</option>
//                         {branches.map(b => (
//                           <option key={b.id} value={b.id}>{b.name}</option>
//                         ))}
//                       </select>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label className="form-label fw-semibold">Date <span className="text-danger">*</span></label>
//                     <input
//                       type="date"
//                       className="form-control rounded-3"
//                       value={selectedClass.date ? selectedClass.date.split('T')[0] : ''}
//                       onChange={e => setSelectedClass({ ...selectedClass, date: e.target.value })}
//                       disabled={modalType === 'view'}
//                     />
//                   </div>
//                 </div>
//                 <div className="row mb-3">
//                   <div className="col-md-6 mb-3">
//                     <label className="form-label fw-semibold">Start Time <span className="text-danger">*</span></label>
//                     <input
//                       type="time"
//                       className="form-control rounded-3"
//                       value={formatTime(selectedClass.startTime)}
//                       onChange={e => setSelectedClass({ ...selectedClass, startTime: e.target.value })}
//                       disabled={modalType === 'view'}
//                     />
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label className="form-label fw-semibold">End Time <span className="text-danger">*</span></label>
//                     <input
//                       type="time"
//                       className="form-control rounded-3"
//                       value={formatTime(selectedClass.endTime)}
//                       onChange={e => setSelectedClass({ ...selectedClass, endTime: e.target.value })}
//                       disabled={modalType === 'view'}
//                     />
//                   </div>
//                 </div>
//                 <div className="row mb-3">
//                   <div className="col-md-6 mb-3">
//                     <label className="form-label fw-semibold">Day</label>
//                     <select
//                       className="form-select rounded-3"
//                       value={selectedClass.day || ''}
//                       onChange={e => setSelectedClass({ ...selectedClass, day: e.target.value })}
//                       disabled={modalType === 'view'}
//                     >
//                       <option value="">Auto</option>
//                       <option value="Monday">Monday</option>
//                       <option value="Tuesday">Tuesday</option>
//                       <option value="Wednesday">Wednesday</option>
//                       <option value="Thursday">Thursday</option>
//                       <option value="Friday">Friday</option>
//                       <option value="Saturday">Saturday</option>
//                       <option value="Sunday">Sunday</option>
//                     </select>
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label className="form-label fw-semibold">Capacity</label>
//                     <input
//                       type="number"
//                       className="form-control rounded-3"
//                       value={selectedClass.capacity || 20}
//                       onChange={e => setSelectedClass({ ...selectedClass, capacity: Number(e.target.value) })}
//                       disabled={modalType === 'view'}
//                     />
//                   </div>
//                 </div>
//                 <div className="row mb-3">
//                   <div className={modalType === 'view' ? "col-md-6 mb-3" : "col-md-12 mb-3"}>
//                     <label className="form-label fw-semibold">Status</label>
//                     <select
//                       className="form-select rounded-3"
//                       value={selectedClass.status || 'Active'}
//                       onChange={e => setSelectedClass({ ...selectedClass, status: e.target.value })}
//                       disabled={modalType === 'view'}
//                     >
//                       <option value="Active">Active</option>
//                       <option value="Inactive">Inactive</option>
//                     </select>
//                   </div>
//                   {modalType === 'view' && (
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label fw-semibold">Members Count</label>
//                       <input
//                         type="text"
//                         className="form-control rounded-3"
//                         value={selectedClass.membersCount !== undefined ? selectedClass.membersCount : 0}
//                         readOnly
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Members section */}
//                 {modalType !== 'view' && (
//                   <div className="mb-3">
//                     <label className="form-label fw-semibold">
//                       Members
//                       <span className="text-muted ms-2">Add members from plan list</span>
//                     </label>
//                     <div className="border rounded-3 p-3 bg-light">
//                       <div className="d-flex flex-column flex-sm-row mb-3 gap-2">
//                         <select
//                           className="form-select rounded-3"
//                           value={memberSearch}
//                           onChange={(e) => setMemberSearch(e.target.value)}
//                         >
//                           <option value="">Select a member</option>
//                           {members.map(m => (
//                             <option key={m.id} value={m.name}>{m.name}</option>
//                           ))}
//                         </select>
//                         <button
//                           className="btn btn-primary rounded-3"
//                           onClick={addMember}
//                           disabled={!memberSearch}
//                         >
//                           Add
//                         </button>
//                       </div>

//                       {/* Added members list */}
//                       {(selectedClass?.members || []).length > 0 && (
//                         <div>
//                           <small className="text-muted d-block mb-2">
//                             {selectedClass.members.length} member{selectedClass.members.length > 1 ? 's' : ''} in this class:
//                           </small>
//                           <div className="d-flex flex-wrap gap-2">
//                             {(selectedClass?.members || []).map(member => (
//                               <span key={member.id} className="badge bg-light text-dark px-3 py-1 d-flex align-items-center">
//                                 {member.name}
//                                 <FaTimes
//                                   className="ms-2"
//                                   style={{ cursor: 'pointer', fontSize: '12px' }}
//                                   onClick={() => removeMember(member)}
//                                 />
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {modalType !== 'view' && (
//                   <div className="d-flex justify-content-end mt-4">
//                     <button className="btn btn-outline-secondary me-2 px-4" onClick={closeModal}>
//                       Cancel
//                     </button>
//                     <button
//                       className="btn px-4"
//                       style={{ background: '#6EB2CC', color: 'white' }}
//                       onClick={saveClass}
//                       disabled={loading || branches.length === 0 || trainers.length === 0}
//                     >
//                       {loading ? 'Saving...' : modalType === 'add' ? 'Add Class' : 'Update Class'}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {isDeleteModalOpen && selectedClass && (
//         <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeDeleteModal}>
//           <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
//             <div className="modal-content">
//               <div className="modal-header border-0 pb-0" style={{ backgroundColor: '#6EB2CC', color: 'white' }}>
//                 <h5 className="modal-title fw-bold">Confirm Deletion</h5>
//                 <button type="button" className="btn-close btn-close-white" onClick={closeDeleteModal}></button>
//               </div>
//               <div className="modal-body text-center py-4">
//                 <div className="display-6 text-danger mb-3">
//                   <i className="fas fa-exclamation-triangle"></i>
//                 </div>
//                 <h5>Are you sure?</h5>
//                 <p className="text-muted">
//                   This will permanently delete <strong>{selectedClass.className}</strong>.<br />
//                   This action cannot be undone.
//                 </p>
//               </div>
//               <div className="modal-footer border-0 justify-content-center pb-4">
//                 <button className="btn btn-outline-secondary px-4" onClick={closeDeleteModal}>
//                   Cancel
//                 </button>
//                 <button className="btn btn-danger px-4" onClick={confirmDelete} disabled={loading}>
//                   {loading ? 'Deleting...' : 'Delete'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ReceptionistBookGroupClasses;