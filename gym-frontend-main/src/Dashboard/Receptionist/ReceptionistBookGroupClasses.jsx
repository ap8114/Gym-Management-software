import React, { useState, useEffect, useRef } from 'react';
import {
  FaEye,
  FaEdit,
  FaTimes,
  FaPlus,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaTrash,
} from 'react-icons/fa';
import axiosInstance from '../../Api/axiosInstance';

const ReceptionistBookGroupClasses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [bookingType, setBookingType] = useState('group');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [bookingSearch, setBookingSearch] = useState('');

  // ---------------- SearchableSelect Component ----------------
  const SearchableSelect = ({ name, value, onChange, options, placeholder, disabled, required }) => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
      const onDocClick = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }, []);

    const selected = options.find(o => String(o.value) === String(value));
    const filtered = filter ? options.filter(o => (o.label || '').toLowerCase().includes(filter.toLowerCase())) : options;

    return (
      <div ref={containerRef} className="position-relative" style={{ minWidth: 200 }}>
        <button type="button" className={`form-control text-start ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && setOpen(s => !s)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{selected ? selected.label : placeholder || 'Select'}</span>
          <span style={{ opacity: 0.6 }}>▾</span>
        </button>
        {open && (
          <div className="card shadow-sm" style={{ position: 'absolute', zIndex: 2000, width: '100%', maxHeight: 260, overflow: 'auto' }}>
            <div className="card-body p-2">
              <input className="form-control form-control-sm mb-2" placeholder="Search..." value={filter} onChange={e => setFilter(e.target.value)} />
              <div>
                {filtered.length === 0 && <div className="text-muted small p-2">No results</div>}
                {filtered.map((opt) => (
                  <div key={opt.value} className="py-1 px-2" style={{ cursor: 'pointer' }} onClick={() => { onChange({ target: { name, value: opt.value } }); setOpen(false); setFilter(''); }}>
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for modals (add/edit) — now includes names and end_date
  const [formData, setFormData] = useState({
    member_id: '',
    member_name: '',
    class_schedule_id: '',
    class_name: '',
    trainer_id: '',
    trainer_name: '',
    date: '',
    end_date: '', // Added end_date field
    start_time: '',
    end_time: '',
    booking_status: 'Booked',
    payment_status: 'Pending',
    notes: '',
    price: '',
  });

  // Pagination
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      console.error('Error parsing user:', err);
      return null;
    }
  };

  const user = getUserFromStorage();
  const branchId = user?.branchId || null;
  const adminId = user?.adminId || null;

  console.log(adminId)

  const normalizeBooking = (apiBooking) => {
    const isGroup = apiBooking.bookingType === 'GROUP';
    return {
      id: apiBooking.id,
      member_id: apiBooking.memberId,
      member_name: apiBooking.memberName || 'Unknown Member',
      type: isGroup ? 'group' : 'pt',
      class_schedule_id: isGroup ? apiBooking.classId : null,
      class_name: isGroup ? apiBooking.className || 'Group Class' : null,
      trainer_id: !isGroup ? apiBooking.trainerId : null,
      trainer_name: !isGroup ? apiBooking.trainerName || 'PT Session' : null,
      date: apiBooking.date ? new Date(apiBooking.date).toISOString().split('T')[0] : '',
      end_date: apiBooking.endDate ? new Date(apiBooking.endDate).toISOString().split('T')[0] : '', // Added end_date field
      start_time: apiBooking.startTime?.slice(0, 5) || '',
      end_time: apiBooking.endTime?.slice(0, 5) || '',
      booking_status: apiBooking.bookingStatus || 'Booked',
      payment_status: apiBooking.paymentStatus || 'Pending',
      notes: apiBooking.notes || '',
      branchId: apiBooking.branchId,
      price: apiBooking.price || '', // Added price field
    };
  };

  const fetchData = async () => {
    try {
      const [membersRes, bookingsRes, trainersRes] = await Promise.all([
        axiosInstance.get(`members/admin/${adminId}`),
        axiosInstance.get(`booking/unifiedbybranch/${adminId}`),
        // axiosInstance.get(`class/trainers/personal-general?adminId=${adminId}`),
      ]);

      const membersData = membersRes.data?.data || [];
      const rawBookings = bookingsRes.data?.bookings || [];
      const normalizedBookings = rawBookings.map(normalizeBooking);
      // const trainersData = trainersRes.data?.trainers || [];

      setMembers(membersData);
      // setTrainers(trainersData);
      setBookings(normalizedBookings);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPersonalTrainers = async () => {
      try {
        const response = await axiosInstance.get(`booking/unifiedbyPersonalGeneral/${adminId}`);
        const personalTrainers = response.data.trainers.filter(
          (trainer) => trainer.roleId === 5
        );
        setTrainers(personalTrainers);
      } catch (error) {
        console.error('Failed to fetch personal trainers:', error);
        // Optional: show toast error
      }
    };

    fetchPersonalTrainers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [branchId]);

  // Pagination
  // Apply booking search filter
  const filteredBookings = bookings.filter(b => {
    if (!bookingSearch) return true;
    return b.member_name?.toString().toLowerCase().includes(bookingSearch.toLowerCase());
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredBookings.length / entriesPerPage);

  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // Modal handlers
  const handleAddNew = () => {
    setModalType('add');
    setSelectedBooking(null);
    setBookingType('group');
    setFormData({
      member_id: '',
      member_name: '',
      class_schedule_id: '',
      class_name: '',
      trainer_id: '',
      trainer_name: '',
      date: '',
      end_date: '', // Added end_date field
      start_time: '',
      end_time: '',
      booking_status: 'Booked',
      payment_status: 'Pending',
      notes: '',
      price: '',
    });
    setIsModalOpen(true);
  };

  const handleView = (booking) => {
    setModalType('view');
    setSelectedBooking(booking);
    setBookingType(booking.type);
    setFormData({
      member_id: booking.member_id,
      member_name: booking.member_name,
      class_schedule_id: booking.class_schedule_id || '',
      class_name: booking.class_name || '',
      trainer_id: booking.trainer_id || '',
      trainer_name: booking.trainer_name || '',
      date: booking.date,
      end_date: booking.end_date || '', // Added end_date field
      start_time: booking.start_time,
      end_time: booking.end_time,
      booking_status: booking.booking_status,
      payment_status: booking.payment_status,
      notes: booking.notes,
      price: booking.price || '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (booking) => {
    setModalType('edit');
    setSelectedBooking(booking);
    setBookingType(booking.type);
    setFormData({
      member_id: booking.member_id,
      member_name: booking.member_name,
      class_schedule_id: booking.class_schedule_id || '',
      class_name: booking.class_name || '',
      trainer_id: booking.trainer_id || '',
      trainer_name: booking.trainer_name || '',
      date: booking.date,
      end_date: booking.end_date || '', // Added end_date field
      start_time: booking.start_time,
      end_time: booking.end_time,
      booking_status: booking.booking_status,
      payment_status: booking.payment_status,
      notes: booking.notes,
      price: booking.price || '',
    });
    setIsModalOpen(true);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedBooking) return;
    try {
      await axiosInstance.delete(`booking/deleteunified/${selectedBooking.id}`);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id
            ? { ...b, booking_status: 'Canceled', payment_status: 'Refunded' }
            : b
        )
      );
      alert(`Booking for ${selectedBooking.member_name} has been canceled.`);
    } catch (err) {
      alert('Failed to cancel booking.');
      console.error(err);
    }
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const closeModal = () => setIsModalOpen(false);
  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
  };

  useEffect(() => {
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
    const badgeMap =
      type === 'booking'
        ? {
          Booked: 'bg-primary-subtle text-primary-emphasis',
          Completed: 'bg-success-subtle text-success-emphasis',
          Canceled: 'bg-danger-subtle text-danger-emphasis',
        }
        : {
          Paid: 'bg-success-subtle text-success-emphasis',
          Pending: 'bg-warning-subtle text-warning-emphasis',
          Refunded: 'bg-info-subtle text-info-emphasis',
        };
    return (
      <span className={`badge rounded-pill ${badgeMap[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getModalTitle = () => {
    const typeName = bookingType === 'group' ? 'Group Class' : 'PT Session';
    return modalType === 'add'
      ? `Book New ${typeName}`
      : modalType === 'edit'
        ? `Edit ${typeName} Booking`
        : `View ${typeName} Booking`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      // Auto-fill names
      if (name === 'member_id') {
        const member = members.find(m => m.id == value);
        updated.member_name = member ? member.fullName : '';
      } else if (name === 'class_schedule_id') {
        const cls = groupPlans.find(c => c.id == value);
        updated.class_name = cls ? cls.name : '';
      } else if (name === 'trainer_id') {
        const trainer = trainers.find(t => t.id == value);
        updated.trainer_name = trainer ? trainer.fullName : '';
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!adminId) {
      alert('admin ID missing. Please log in again.');
      return;
    }

    const {
      member_id,
      member_name,
      class_schedule_id,
      class_name,
      trainer_id,
      trainer_name,
      date,
      end_date, // Added end_date field
      start_time,
      end_time,
      booking_status,
      payment_status,
      notes,
      price,
    } = formData;

    // Validation: require member and date. If times are missing, default to 00:00.
    if (!member_id || !date) {
      alert('Please select a member and date. Start/End time will default to 00:00 if left empty.');
      return;
    }

    if (bookingType === 'group' && !class_schedule_id) {
      alert('Please select a group class.');
      return;
    }
    if (bookingType === 'pt' && !trainer_id) {
      alert('Please select a trainer.');
      return;
    }

    const formatTime = (t) => (t.length === 5 ? `${t}:00` : t);

    // Ensure times are present; default to '00:00' which becomes '00:00:00'
    const safeStart = (start_time && start_time.trim()) ? start_time : '00:00';
    const safeEnd = (end_time && end_time.trim()) ? end_time : '00:00';

    try {
      if (modalType === 'add') {
        // Only call API for PT sessions
        if (bookingType === 'pt') {
          const parsedPrice = parseFloat(price);
          if (isNaN(parsedPrice) || parsedPrice <= 0) {
            alert('Please enter a valid price greater than 0.');
            return;
          }
          
          const payload = {
            memberId: parseInt(member_id, 10),
            memberName: member_name,
            bookingType: 'PT',
            trainerId: parseInt(trainer_id, 10),
            trainerName: trainer_name,
            date,
            endDate: end_date, // Added end_date field
            startTime: formatTime(safeStart),
            endTime: formatTime(safeEnd),
            notes: notes || '',
            bookingStatus: booking_status,
            paymentStatus: payment_status,
            price: parsedPrice
          };
          
          await axiosInstance.post('booking/unified/create', payload);
          alert('PT Session booking created successfully!');
        } else {
          // For group classes, you might have a different API endpoint
          // This is just a placeholder - you'll need to implement the actual API call for group classes
          alert('Group class booking functionality would be implemented here.');
        }
      } else if (modalType === 'edit' && selectedBooking) {
        // For edit, only send endTime and price for PT sessions
        if (bookingType === 'pt') {
          // Ensure price is a valid number
          let parsedPrice;
          if (price === '' || price === null || price === undefined) {
            // If price is empty, use the existing price from the booking
            parsedPrice = selectedBooking.price || 0;
          } else {
            parsedPrice = parseFloat(price);
          }
          
          if (isNaN(parsedPrice) || parsedPrice <= 0) {
            alert('Please enter a valid price greater than 0.');
            return;
          }
          
          const payload = {
            endTime: formatTime(safeEnd),
            price: parsedPrice
          };
          
          await axiosInstance.put(`booking/unifiedupdate/${selectedBooking.id}`, payload);
          alert('PT Session booking updated successfully!');
        } else {
          // For group classes, you might have a different API endpoint
          alert('Group class update functionality would be implemented here.');
        }
      }

      fetchData();
      closeModal();
    } catch (err) {
      console.error('API Error:', err);
      alert(`Failed to ${modalType === 'add' ? 'create' : 'update'} booking.`);
    }
  };

  // Inside your component
  const [groupPlans, setGroupPlans] = useState([]);

  useEffect(() => {
    const fetchGroupPlans = async () => {
      try {
        const response = await axiosInstance.get(`/MemberPlan?adminId=${adminId}`);
        const groupPlansOnly = response.data.plans.filter(plan => plan.type === 'GROUP');
        setGroupPlans(groupPlansOnly);
      } catch (error) {
        console.error('Failed to fetch group plans:', error);
        // Optionally show toast error
      }
    };

    fetchGroupPlans();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading bookings...</div>;

  return (
    <div className="">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Book Group Classes & PT Sessions</h2>
          <p className="text-muted mb-0">
            Manage bookings for group classes and personal training sessions.
          </p>
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
            }}
            onClick={handleAddNew}
          >
            <FaPlus className="me-2" /> New Booking
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
              value={bookingSearch}
              onChange={(e) => { setBookingSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Show Entries */}
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center">
            <span className="me-2">Show</span>
            <select
              className="form-select form-select-sm w-auto"
              value={entriesPerPage}
              onChange={handleEntriesChange}
            >
              {[5, 10, 25, 50, 100].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
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
                      <div className="small text-muted">
                        {members.find((m) => m.id === booking.member_id)?.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge rounded-pill ${booking.type === 'group'
                        ? 'bg-info-subtle text-info-emphasis'
                        : 'bg-secondary-subtle text-secondary-emphasis'
                        } px-2 py-1`}
                    >
                      {booking.type === 'group' ? 'Group Class' : 'PT Session'}
                    </span>
                  </td>
                  <td>
                    {booking.type === 'group' ? booking.class_name : booking.trainer_name}
                  </td>
                  <td>
                    {formatDate(booking.date)}
                    {booking.end_date && booking.type === 'pt' && (
                      <div className="small text-muted">to {formatDate(booking.end_date)}</div>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaClock className="text-muted me-1" size={12} />
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </td>
                  <td>{getStatusBadge(booking.booking_status, 'booking')}</td>
                  <td>{getStatusBadge(booking.payment_status, 'payment')}</td>
                  <td className="text-center">
                    <div className="d-flex flex-row gap-1 justify-content-center">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        title="View"
                        onClick={() => handleView(booking)}
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="Edit"
                        onClick={() => handleEdit(booking)}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Cancel"
                        onClick={() => handleCancelClick(booking)}
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
              Showing {Math.min(indexOfFirstEntry + 1, bookings.length)} to{' '}
              {Math.min(indexOfLastEntry, bookings.length)} of {bookings.length} entries
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
                {[...Array(Math.min(3, totalPages))].map((_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                {totalPages > 3 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                {totalPages > 3 && (
                  <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(totalPages)}>
                      {totalPages}
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

      {/* MAIN MODAL */}
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
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-4">
                {modalType === 'add' && (
                  <div className="mb-4">
                    <label className="form-label fw-bold mb-3">Booking Type</label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${bookingType === 'group' ? 'btn-info' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setBookingType('group');
                          setFormData((prev) => ({ 
                            ...prev, 
                            trainer_id: '', 
                            trainer_name: '', 
                            class_schedule_id: '', 
                            class_name: '',
                            end_date: '' // Reset end_date when switching booking type
                          }));
                        }}
                      >
                        Group Class
                      </button>
                      <button
                        type="button"
                        className={`btn ${bookingType === 'pt' ? 'btn-info' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setBookingType('pt');
                          setFormData((prev) => ({ 
                            ...prev, 
                            trainer_id: '', 
                            trainer_name: '', 
                            class_schedule_id: '', 
                            class_name: '',
                            end_date: '' // Reset end_date when switching booking type
                          }));
                        }}
                      >
                        Personal Training
                      </button>
                    </div>
                  </div>
                )}

                <form>
                  <div>
                    <div className="mb-3">
                      <label className="form-label d-flex align-items-center">
                        <FaUser className="me-2 text-muted" /> Member <span className="text-danger">*</span>
                      </label>
                      <SearchableSelect
                        name="member_id"
                        value={formData.member_id}
                        onChange={handleInputChange}
                        options={members.map(m => ({ value: m.id, label: `${m.fullName} (${m.phone || ''})` }))}
                        placeholder="Select a member"
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>

                    {bookingType === 'group' ? (
                      <div className="mb-3">
                        <label className="form-label d-flex align-items-center">
                          <FaChalkboardTeacher className="me-2 text-muted" /> Group Plan{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <SearchableSelect
                          name="class_schedule_id"
                          value={formData.class_schedule_id}
                          onChange={handleInputChange}
                          options={groupPlans.map(p => ({ value: p.id, label: `${p.name} - ₹${p.price} (${p.validityDays} days)` }))}
                          placeholder="Select a group plan"
                          disabled={modalType === 'view'}
                          required
                        />
                      </div>
                    ) : (
                      <div className="mb-3">
                        <label className="form-label d-flex align-items-center">
                          <FaChalkboardTeacher className="me-2 text-muted" /> Trainer{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <SearchableSelect
                          name="trainer_id"
                          value={formData.trainer_id}
                          onChange={handleInputChange}
                          options={trainers.map(t => ({ value: t.id, label: t.fullName }))}
                          placeholder="Select a personal trainer"
                          disabled={modalType === 'view'}
                          required
                        />
                      </div>
                    )}

                    <div className="row mb-3 g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-muted" /> Start Date{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control rounded-3"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          disabled={modalType === 'view'}
                          required
                        />
                      </div>

                      {/* Added End Date field - only show for PT sessions */}
                      {bookingType === 'pt' && (
                        <div className="col-12 col-md-6">
                          <label className="form-label d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-muted" /> End Date{' '}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            className="form-control rounded-3"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            min={formData.date || new Date().toISOString().split('T')[0]}
                            disabled={modalType === 'view'}
                            required
                          />
                        </div>
                      )}

                      <div className="col-6 col-md-6">
                        <label className="form-label d-flex align-items-center">
                          <FaClock className="me-2 text-muted" /> Start Time{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="form-control rounded-3"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleInputChange}
                          disabled={modalType === 'view'}
                          required
                        />
                      </div>

                      <div className="col-6 col-md-6">
                        <label className="form-label d-flex align-items-center">
                          <FaClock className="me-2 text-muted" /> End Time{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="form-control rounded-3"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleInputChange}
                          disabled={modalType === 'view'}
                          required
                        />
                      </div>
                    </div>

                    {/* 💰 PRICE FIELD - Show for both add and edit for PT sessions */}
                    {(modalType === 'add' || (modalType === 'edit' && bookingType === 'pt')) && (
                      <div className="mb-3">
                        <label className="form-label d-flex align-items-center">
                          <FaMoneyBillWave className="me-2 text-muted" /> Price <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control rounded-3"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0.01"
                          step="0.01"
                          placeholder="Enter amount"
                          disabled={modalType === 'view'}
                          required
                        />
                      </div>
                    )}

                    <div className="row mb-3 g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Booking Status <span className="text-danger">*</span></label>
                        <select
                          className="form-select rounded-3"
                          name="booking_status"
                          value={formData.booking_status}
                          onChange={handleInputChange}
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
                          <FaMoneyBillWave className="me-2 text-muted" /> Payment Status{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select rounded-3"
                          name="payment_status"
                          value={formData.payment_status}
                          onChange={handleInputChange}
                          disabled={modalType === 'view'}
                          required
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control rounded-3"
                        name="notes"
                        rows="3"
                        placeholder="Any additional information..."
                        value={formData.notes}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                      ></textarea>
                    </div>

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
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
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
                <button type="button" className="btn-close" onClick={closeCancelModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will cancel the {selectedBooking?.type === 'group' ? 'group class' : 'PT session'}{' '}
                  booking for <strong>{selectedBooking?.member_name}</strong> on{' '}
                  <strong>{selectedBooking ? formatDate(selectedBooking.date) : ''}</strong>.<br />
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