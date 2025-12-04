import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PersonalTraining = () => {
  const [trainingData, setTrainingData] = useState([
    {
      id: 1,
      trainer: "John Smith",
      type: "Strength Training",
      date: "2023-06-20",
      time: "10:00 - 11:00",
      price: "$50",
      paymentStatus: "Paid",
      bookingStatus: "Booked",
      username: "john_doe",
      memberName: "Alex Johnson",
      memberEmail: "alex.johnson@example.com",
      memberPhone: "+1 555-123-4567",
      memberJoinDate: "2023-01-15",
      totalMembers: 1
    },
    {
      id: 2,
      trainer: "Mike Williams",
      type: "Cardio & HIIT",
      date: "2023-06-22",
      time: "14:00 - 15:00",
      price: "$60",
      paymentStatus: "Paid",
      bookingStatus: "Booked",
      username: "mike_w",
      memberName: "Sarah Miller",
      memberEmail: "sarah.miller@example.com",
      memberPhone: "+1 555-987-6543",
      memberJoinDate: "2023-02-10",
      totalMembers: 2
    },
    {
      id: 3,
      trainer: "Mike Williams",
      type: "Cardio & HIIT",
      date: "2025-09-18",
      time: "23:34 - 03:04",
      price: "$70",
      paymentStatus: "Paid",
      bookingStatus: "Booked",
      username: "mike_w",
      memberName: "Emily Davis",
      memberEmail: "emily.davis@example.com",
      memberPhone: "+1 555-456-7890",
      memberJoinDate: "2023-03-05",
      totalMembers: 3
    },
    {
      id: 4,
      trainer: "Unknown",
      type: "",
      date: "",
      time: "",
      price: "",
      paymentStatus: "Paid",
      bookingStatus: "Booked",
      username: "guest_user",
      memberName: "Guest User",
      memberEmail: "",
      memberPhone: "",
      memberJoinDate: "",
      totalMembers: 1
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileViewModalOpen, setIsMobileViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const customColor = "#6EB2CC";

  const handleShow = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleMobileShow = (booking) => {
    setSelectedBooking(booking);
    setIsMobileViewModalOpen(true);
  };

  const handleDelete = (id, username) => {
    if (window.confirm(`Are you sure you want to delete booking for ${username}?`)) {
      const updatedData = trainingData.filter(item => item.id !== id);
      setTrainingData(updatedData);
      alert(`Booking for ${username} has been deleted`);
    }
  };

  const handleBookingStatusClick = (index) => {
    const newData = [...trainingData];
    const currentStatus = newData[index].bookingStatus;
    
    if (currentStatus === "Booked") {
      newData[index].bookingStatus = "Confirmed";
    } else if (currentStatus === "Confirmed") {
      newData[index].bookingStatus = "Cancelled";
    } else if (currentStatus === "Cancelled") {
      newData[index].bookingStatus = "Booked";
    }
    
    setTrainingData(newData);
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-success";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  };

  const totalMembersCount = trainingData.reduce((total, booking) => total + (booking.totalMembers || 1), 0);

  const MobileBookingCard = ({ booking, index }) => (
    <div className="card mb-3 shadow-sm" style={{ borderRadius: '12px' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1 fw-bold" style={{ fontSize: '1rem' }}>{booking.memberName}</h6>
            <div className="d-flex gap-1 flex-wrap">
              <span className="badge bg-primary text-dark" style={{ fontSize: '0.7rem' }}>
                {booking.type || 'N/A'}
              </span>
              <span className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>
                {booking.totalMembers || 1} {booking.totalMembers > 1 ? 'Members' : 'Member'}
              </span>
            </div>
          </div>
          <div className="d-flex gap-1">
            <button
              className={`badge ${getBadgeColor(booking.bookingStatus)} border-0 bg-opacity-75`}
              onClick={() => handleBookingStatusClick(index)}
              style={{ cursor: 'pointer' }}
            >
              {booking.bookingStatus}
            </button>
          </div>
        </div>
        
        <div className="row g-2 mb-2">
          <div className="col-6">
            <small className="text-muted d-block">Trainer</small>
            <span style={{ fontSize: '0.85rem' }}>{booking.trainer}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Date</small>
            <span style={{ fontSize: '0.85rem' }}>{booking.date || 'N/A'}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Time</small>
            <span style={{ fontSize: '0.85rem' }}>{booking.time || 'N/A'}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Price</small>
            <span style={{ fontSize: '0.85rem' }}>{booking.price || 'N/A'}</span>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">Payment:</small>
            <span className={`badge ${booking.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'} ms-1`}>
              {booking.paymentStatus}
            </span>
          </div>
          <div className="d-flex gap-1">
            <button
              className="btn btn-sm"
              onClick={() => handleMobileShow(booking)}
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem',
                color: customColor,
                background: 'none',
                border: 'none'
              }}
            >
              <i className="bi bi-eye"></i>
            </button>
            <button
              className="btn btn-sm"
              onClick={() => handleDelete(booking.id, booking.username)}
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem',
                color: '#dc3545',
                background: 'none',
                border: 'none'
              }}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-2 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>Personal Training Details</h2>
          <p className="text-muted mb-0">In Member Dashboard</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="text-center">
            <h4 className="mb-0 fw-bold" style={{ color: customColor }}>{totalMembersCount}</h4>
            <small className="d-block text-muted">Total Members</small>
          </div>
        </div>
      </div>
      
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Member Name</th>
                <th>Trainer</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price</th>
                <th>Payment Status</th>
                <th>Booking Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainingData.map((data, index) => (
                <tr key={data.id}>
                  <td>{data.memberName}</td>
                  <td>
                    {data.trainer} {data.type && `(${data.type})`}
                  </td>
                  <td>{data.type || 'N/A'}</td>
                  <td>{data.date}</td>
                  <td>{data.time}</td>
                  <td>{data.price}</td>
                  <td>
                    <span className={`badge ${data.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                      {data.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`badge ${getBadgeColor(data.bookingStatus)} border-0 bg-opacity-75`}
                      onClick={() => handleBookingStatusClick(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      {data.bookingStatus}
                    </button>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button 
                        className="btn btn-sm" 
                        title="Show"
                        onClick={() => handleShow(data)}
                        style={{ 
                          color: customColor,
                          background: 'none',
                          border: 'none'
                        }}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm" 
                        title="Delete"
                        onClick={() => handleDelete(data.id, data.username)}
                        style={{ 
                          color: '#dc3545',
                          background: 'none',
                          border: 'none'
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-md-none">
        {trainingData.map((booking, index) => (
          <MobileBookingCard key={booking.id} booking={booking} index={index} />
        ))}
      </div>

      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title fw-bold">Personal Training Booking Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedBooking ? (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <strong>Member Name:</strong> {selectedBooking.memberName}
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong> {selectedBooking.memberEmail || 'N/A'}
                    </div>
                    <div className="col-md-6">
                      <strong>Phone:</strong> {selectedBooking.memberPhone || 'N/A'}
                    </div>
                    <div className="col-md-6">
                      <strong>Join Date:</strong> {selectedBooking.memberJoinDate || 'N/A'}
                    </div>
                    <div className="col-md-6">
                      <strong>Trainer:</strong> {selectedBooking.trainer}
                    </div>
                    <div className="col-md-6">
                      <strong>Type:</strong> {selectedBooking.type || 'N/A'}
                    </div>
                    <div className="col-md-6">
                      <strong>Date:</strong> {selectedBooking.date || 'N/A'}
                    </div>
                    <div className="col-md-6">
                      <strong>Time:</strong> {selectedBooking.time || 'N/A'}
                    </div>
                    <div className="col-md-6">
                      <strong>Price:</strong> {selectedBooking.price || 'N/A'}
                    </div>
                    <div className="col-md-6">
                      <strong>Payment Status:</strong> {selectedBooking.paymentStatus}
                    </div>
                    <div className="col-md-6">
                      <strong>Booking Status:</strong> {selectedBooking.bookingStatus}
                    </div>
                  </div>
                ) : (
                  <p>No booking selected.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobileViewModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsMobileViewModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ margin: '0.5rem', maxWidth: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title fw-bold">Booking Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsMobileViewModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                {selectedBooking ? (
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0 fw-bold">{selectedBooking.memberName}</h6>
                        <span className={`badge ${getBadgeColor(selectedBooking.bookingStatus)}`}>
                          {selectedBooking.bookingStatus}
                        </span>
                      </div>
                      
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Email</small>
                          <div>{selectedBooking.memberEmail || 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Phone</small>
                          <div>{selectedBooking.memberPhone || 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Join Date</small>
                          <div>{selectedBooking.memberJoinDate || 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Trainer</small>
                          <div>{selectedBooking.trainer}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Type</small>
                          <div>{selectedBooking.type || 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Date</small>
                          <div>{selectedBooking.date || 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Time</small>
                          <div>{selectedBooking.time || 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Price</small>
                          <div>{selectedBooking.price || 'N/A'}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Payment</small>
                          <div>
                            <span className={`badge ${selectedBooking.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                              {selectedBooking.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No booking selected.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={() => setIsMobileViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalTraining;