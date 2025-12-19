import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaClock, FaUser, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';
import axiosInstance from '../../Api/axiosInstance';

const ClassSchedule = () => {
  const [groupClasses, setGroupClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      return null;
    }
  };

  const user = getUserFromStorage();
  const memberId = user?.id || null;

  // Fetch classes (includes isBooked)
  useEffect(() => {
    const fetchClasses = async () => {
      if (!memberId) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`class/classes/member/${memberId}`);

        if (response.data.success && Array.isArray(response.data.data)) {
          const transformedClasses = response.data.data.map(cls => {
            const timeParts = cls.time.split(' - ');
            const startTime = timeParts[0] || '';
            const endTime = timeParts[1] || '';

            // const generatePrice = (className) => {
            //   if (className.toLowerCase().includes('yoga')) return 350;
            //   if (className.toLowerCase().includes('pilates')) return 450;
            //   if (className.toLowerCase().includes('hiit') || className.toLowerCase().includes('hit')) return 400;
            //   if (className.toLowerCase().includes('zumba')) return 250;
            //   return 300;
            // };

            // Use real capacity if available, else fallback
            const capacity = cls.capacity || Math.floor(Math.random() * 15) + 10;
            const bookedSeats = cls.membersCount || 0;

            return {
              id: cls.id,
              name: cls.className,
              trainer_name: cls.trainer,
              date: cls.date.split('T')[0],
              start_time: startTime,
              end_time: endTime,
              day: cls.day,
              branch: cls.branch || 'Main Branch',
              status: cls.status,
              capacity,
              booked_seats: bookedSeats,
              // price: generatePrice(cls.className),
              isBooked: cls.isBooked, // ✅ Direct from API
              bookingId: cls.bookingId
            };
          });

          setGroupClasses(transformedClasses);
          setError(null);
        } else {
          setError('Failed to fetch classes');
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [memberId]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // const formatPrice = (price) => {
  //   return new Intl.NumberFormat('en-IN', {
  //     style: 'currency',
  //     currency: 'INR',
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(price);
  // };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const openBookingModal = (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
    setBookingError(null);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    setBookingError(null);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleConfirmBooking = async () => {
    if (!memberId || !selectedClass) {
      alert('User not logged in or class not selected.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const payload = {
        memberId: memberId,
        scheduleId: selectedClass.id
      };

      const response = await axiosInstance.post('class/book', payload);

      if (response.data.success) {
        alert(`✅ Successfully booked ${selectedClass.name}!`);

        // ✅ Update UI: mark as booked without refetching
        setGroupClasses(prev =>
          prev.map(cls =>
            cls.id === selectedClass.id ? { ...cls, isBooked: true } : cls
          )
        );

        closeBookingModal();
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to book class. Please try again.';
      setBookingError(errorMsg);
      alert(`❌ ${errorMsg}`);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-2">
        <div className="row mb-3">
          <div className="col-12 text-center text-md-start">
            <h1 className="fw-bold">Weekly Class Schedule</h1>
            <p className="text-muted mb-0">Book your favorite classes for the week</p>
          </div>
        </div>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2">
        <div className="row mb-3">
          <div className="col-12 text-center text-md-start">
            <h1 className="fw-bold">Weekly Class Schedule</h1>
            <p className="text-muted mb-0">Book your favorite classes for the week</p>
          </div>
        </div>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <div className="text-center">
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="row mb-3">
        <div className="col-12 text-center text-md-start">
          <h1 className="fw-bold">Weekly Class Schedule</h1>
          <p className="text-muted mb-0">Book your favorite classes for the week</p>
        </div>
      </div>

      <div className="row g-4">
        {groupClasses.map(cls => {
          const isFull = cls.booked_seats >= cls.capacity;
          const isActive = cls.status === 'Active';
          const isBooked = cls.isBooked; // ✅ Use directly from API

          let buttonText = 'Book Now';
          let buttonDisabled = false;
          let buttonStyle = '#2f6a87';

          if (isBooked) {
            buttonText = 'Booked';
            buttonDisabled = true;
            buttonStyle = '#2f6e34ff';
          } else if (isFull) {
            buttonText = 'Class Full';
            buttonDisabled = true;
            buttonStyle = '#6b3730ff';
          } else if (!isActive) {
            buttonText = 'Inactive';
            buttonDisabled = true;
            buttonStyle = '#6c757d';
          }

          return (
            <div key={cls.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div
                  className="p-4"
                  style={{
                    color: '#2f6a87',
                    minHeight: '60px'
                  }}
                >
                  <h5 className="mb-0 fw-bold">{cls.name}</h5>
                  <small className="text-muted">{cls.branch}</small>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <FaClock size={16} className="me-2 text-primary" />
                    <small>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</small>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FaUser size={16} className="me-2 text-primary" />
                    <small>{cls.trainer_name}</small>
                  </div>
                  {/* <div className="d-flex align-items-center mb-3">
                    <FaRupeeSign size={16} className="me-2 text-success" />
                    <strong className="text-success">{formatPrice(cls.price)}</strong>
                  </div> */}
                  <div className="d-flex align-items-center mb-3">
                    <span className={`badge ${cls.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                      {cls.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <button
                      className="btn w-100 py-2 fw-medium"
                      style={{
                        backgroundColor: buttonStyle,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={buttonDisabled}
                      onClick={() => !buttonDisabled && openBookingModal(cls)}
                    >
                      {buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKING MODAL */}
      {isModalOpen && selectedClass && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeBookingModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h3 className="modal-title fw-bold">Book Your Class</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeBookingModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="card border-0 shadow-sm mb-4">
                  <div
                    className="card-header p-4 text-white"
                    style={{
                      background: '#2f6a87',
                      borderRadius: '12px 12px 0 0'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4 className="mb-2 fw-bold">{selectedClass.name}</h4>
                        <div className="d-flex align-items-center mb-2">
                          <FaCalendarAlt size={16} className="me-2" />
                          <small>{formatDate(selectedClass.date)}</small>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <FaClock size={16} className="me-2" />
                          <small>{formatTime(selectedClass.start_time)} - {formatTime(selectedClass.end_time)}</small>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaUser size={16} className="me-2" />
                          <small>{selectedClass.trainer_name}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Class Details</h5>
                    <div className="row g-4 mb-4">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <FaUser size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">Trainer</div>
                            <div>{selectedClass.trainer_name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <FaClock size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">Duration</div>
                            <div>
                              {selectedClass.start_time && selectedClass.end_time ?
                                Math.round((new Date(`2024-01-01T${selectedClass.end_time}:00`) - new Date(`2024-01-01T${selectedClass.start_time}:00`)) / 60000) + ' minutes'
                                : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <FaRupeeSign size={16} className="text-success" />
                          </div>
                          <div>
                            <div className="fw-medium">Price</div>
                            <div className="text-success fw-bold">{formatPrice(selectedClass.price)}</div>
                          </div>
                        </div>
                      </div> */}
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <span className="text-primary">📍</span>
                          </div>
                          <div>
                            <div className="fw-medium">Branch</div>
                            <div>{selectedClass.branch}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {bookingError && (
                      <div className="alert alert-danger mb-4">
                        {bookingError}
                      </div>
                    )}

                    <div className="text-center">
                      <button
                        className="btn btn-lg px-5 py-3 fw-bold"
                        style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '1.1rem'
                        }}
                        onClick={handleConfirmBooking}
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          'Confirm Booking'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSchedule;