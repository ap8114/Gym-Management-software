import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaClock, FaUser, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';
import axiosInstance from '../../Api/axiosInstance'; // Import your axios instance

const ClassSchedule = () => {
  // State for group classes
  const [groupClasses, setGroupClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('class/scheduled/all');
        
        if (response.data.success && response.data.data) {
          // Transform API data to match component structure
          const transformedClasses = response.data.data.map(cls => {
            // Extract start and end times from the time string
            const timeParts = cls.time.split(' - ');
            const startTime = timeParts[0] || '';
            const endTime = timeParts[1] || '';
            
            // Generate a random price based on class type
            const generatePrice = (className) => {
              if (className.toLowerCase().includes('yoga')) return 350;
              if (className.toLowerCase().includes('pilates')) return 450;
              if (className.toLowerCase().includes('hiit') || className.toLowerCase().includes('hit')) return 400;
              if (className.toLowerCase().includes('zumba')) return 250;
              return 300; // Default price
            };
            
            // Generate random capacity and booked seats
            const capacity = Math.floor(Math.random() * 15) + 10; // Random between 10-25
            const bookedSeats = Math.floor(Math.random() * capacity);
            
            return {
              id: cls.id,
              name: cls.className,
              trainer_name: cls.trainer,
              trainer_id: 1, // Default trainer ID since API doesn't provide it
              date: cls.date.split('T')[0], // Extract date part
              start_time: startTime,
              end_time: endTime,
              day: cls.day,
              branch: cls.branch,
              status: cls.status,
              capacity: capacity,
              booked_seats: bookedSeats,
              price: generatePrice(cls.className),
              membersCount: cls.membersCount
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
  }, []);

  // Mock data for trainers (since API doesn't provide trainer details)
  const trainers = [
    { id: 1, name: 'John Smith', specialty: 'Strength Training' },
    { id: 2, name: 'Sarah Johnson', specialty: 'Yoga & Pilates' },
    { id: 3, name: 'Mike Williams', specialty: 'Cardio & HIIT' },
    { id: 4, name: 'Emily Davis', specialty: 'Weight Loss' },
  ];

  // Helper functions
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTrainer = (trainerId) => {
    return trainers.find(t => t.id === trainerId) || { name: 'Unknown', specialty: '' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Modal handlers
  const openBookingModal = (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  // Prevent background scroll when modal open
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

  // Loading state
  if (loading) {
    return (
      <div className="mt-3" style={{ backgroundColor: '#f8f9fa' }}>
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

  // Error state
  if (error) {
    return (
      <div className="mt-3" style={{ backgroundColor: '#f8f9fa' }}>
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
    <div className="mt-3" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="row mb-3">
        <div className="col-12 text-center text-md-start">
          <h1 className="fw-bold">Weekly Class Schedule</h1>
          <p className="text-muted mb-0">Book your favorite classes for the week</p>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="row g-4">
        {groupClasses.map(cls => {
          const trainer = getTrainer(cls.trainer_id);
          const isFull = cls.booked_seats >= cls.capacity;

          return (
            <div key={cls.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                {/* Card Header */}
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

                {/* Card Body */}
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <FaClock size={16} className="me-2 text-primary" />
                    <small>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</small>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FaUser size={16} className="me-2 text-primary" />
                    <small>{cls.trainer_name}</small>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FaRupeeSign size={16} className="me-2 text-success" />
                    <strong className="text-success">{formatPrice(cls.price)}</strong>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <span className={`badge ${cls.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                      {cls.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <button
                      className="btn w-100 py-2 fw-medium"
                      style={{
                        backgroundColor: isFull || cls.status !== 'Active' ? '#6c757d' : '#2f6a87',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={isFull || cls.status !== 'Active'}
                      onClick={() => (!isFull && cls.status === 'Active') && openBookingModal(cls)}
                    >
                      {isFull ? 'Class Full' : cls.status !== 'Active' ? 'Inactive' : 'Book Now'}
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
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <FaRupeeSign size={16} className="text-success" />
                          </div>
                          <div>
                            <div className="fw-medium">Price</div>
                            <div className="text-success fw-bold">{formatPrice(selectedClass.price)}</div>
                          </div>
                        </div>
                      </div>
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

                    <div className="alert alert-info mb-4">
                      <strong>Booking Confirmation:</strong> You'll receive an email and SMS confirmation after booking.
                    </div>

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
                        onClick={() => {
                          alert(`Successfully booked ${selectedClass.name} for ${formatPrice(selectedClass.price)}!`);
                          closeBookingModal();
                        }}
                      >
                        Confirm Booking
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