import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Button, Card, Modal, Form, Table, Spinner, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaEye } from 'react-icons/fa';
import axiosInstance from '../../Api/axiosInstance';

const ViewPlans = () => {
  const [activeTab, setActiveTab] = useState('group');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // 'pending', 'success', 'error'
  const [paymentDetails, setPaymentDetails] = useState({ upi: '' });
  const [allPlans, setAllPlans] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');

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
  const adminId = user?.adminId || null;
  // const branchId = user?.branchId || null;

  console.log('Member ID:', memberId);
  console.log('Admin ID:', adminId);
  // console.log('Branch ID:', branchId);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      if (!adminId) {
        setLoadingPlans(false);
        setError('Admin ID not found. Unable to load plans.');
        return;
      }

      try {
        const response = await axiosInstance.get(`MemberPlan?adminId=${adminId}`);
        if (response.data.success && Array.isArray(response.data.plans)) {
          // Store original price as number for booking; format only for display
          const formattedPlans = response.data.plans.map(plan => ({
            ...plan,
            displayPrice: `$${(plan.price || 0).toLocaleString()}`,
            numericPrice: plan.price || 0,
          }));
          setAllPlans(formattedPlans);
        } else {
          setAllPlans([]);
          setError('No plans available.');
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans. Please try again.');
        setAllPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [adminId]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!memberId) {
        setLoadingBookings(false);
        return;
      }

      try {
        const response = await axiosInstance.get('booking/requests');
        if (response.data.success && Array.isArray(response.data.bookings)) {
          const mapped = response.data.bookings.map(b => ({
            id: b.id,
            planName: b.plan?.name || 'Unknown Plan',
            type: b.plan?.type === 'PERSONAL' ? 'Personal' : 'Group',
            purchasedAt: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : 'N/A',
            validity: b.plan?.validityDays || 0,
            totalSessions: b.plan?.sessions || 0,
            remainingSessions: b.leftSessions || 0,
            status: b.status || 'pending',
            planId: b.planId,
          }));
          setBookings(mapped);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [memberId]);

  const groupPlans = useMemo(() => allPlans.filter(plan => plan.type === 'GROUP'), [allPlans]);
  const personalPlans = useMemo(() => allPlans.filter(plan => plan.type === 'PERSONAL'), [allPlans]);

  const handleBookNow = (plan, planType) => {
    setSelectedPlan({ ...plan, type: planType });
    setPaymentDetails({ upi: '' });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const upi = paymentDetails.upi.trim();

    if (!upi) {
      setBookingMessage('Please enter a valid UPI ID.');
      return;
    }

    if (!memberId || !adminId || !branchId || !selectedPlan) {
      setBookingMessage('Missing user or plan details. Please log in again.');
      return;
    }

    setBookingStatus('pending');
    setBookingMessage('');

    try {
      // Use numericPrice (not parsed from string)
      const payload = {
        memberId: memberId,
        classId: selectedPlan.id,
        branchId: branchId,
        adminId: adminId,
        price: selectedPlan.numericPrice, // ✅ Correct numeric value
        upiId: upi,
      };

      const response = await axiosInstance.post('booking/create', payload);

      if (response.data.success) {
        setBookingStatus('success');
        setBookingMessage(response.data.message || 'Booking request sent to admin.');
        setShowPaymentModal(false);
        setPaymentDetails({ upi: '' });

        // Refresh bookings
        const bookingsRes = await axiosInstance.get('booking/requests');
        if (bookingsRes.data.success && Array.isArray(bookingsRes.data.bookings)) {
          const mapped = bookingsRes.data.bookings.map(b => ({
            id: b.id,
            planName: b.plan?.name || 'Unknown Plan',
            type: b.plan?.type === 'PERSONAL' ? 'Personal' : 'Group',
            purchasedAt: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : 'N/A',
            validity: b.plan?.validityDays || 0,
            totalSessions: b.plan?.sessions || 0,
            remainingSessions: b.leftSessions || 0,
            status: b.status || 'pending',
            planId: b.planId,
          }));
          setBookings(mapped);
        }
      } else {
        const errorMsg = response.data.message || 'Booking failed. Please try again.';
        setBookingMessage(errorMsg);
        setBookingStatus('error');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setBookingStatus('error');
      setBookingMessage('Failed to create booking. Please try again or contact support.');
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  if (loadingPlans) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="bg-light py-2">
      <Container>
        <h1 className="mb-4 mb-md-5 fw-bold text-dark" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          Choose Your Fitness Plan
        </h1>

        {/* Tabs */}
        <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 mb-4 mb-md-5">
          <Button
            variant={activeTab === 'group' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('group')}
            className="px-3 px-md-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 flex-grow-2"
            style={{
              backgroundColor: activeTab === 'group' ? '#2f6a87' : 'transparent',
              borderColor: '#2f6a87',
              color: activeTab === 'group' ? 'white' : '#2f6a87',
              borderRadius: '12px',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              transition: 'all 0.3s ease',
            }}
          >
            <span>Group Classes</span>
          </Button>
          <Button
            variant={activeTab === 'personal' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('personal')}
            className="px-3 px-md-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 flex-grow-2"
            style={{
              backgroundColor: activeTab === 'personal' ? '#2f6a87' : 'transparent',
              borderColor: '#2f6a87',
              color: activeTab === 'personal' ? 'white' : '#2f6a87',
              borderRadius: '12px',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              transition: 'all 0.3s ease',
            }}
          >
            <span>Personal Training</span>
          </Button>
        </div>

        {/* Group Plans */}
        {activeTab === 'group' && (
          <Row className="g-3 g-md-4">
            {groupPlans.length === 0 ? (
              <Col>
                <div className="text-center py-4 text-muted">No group plans available.</div>
              </Col>
            ) : (
              groupPlans.map((plan) => (
                <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex">
                  <Card className="h-100 shadow-sm border-0 flex-fill" style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    border: '1px solid #e9ecef'
                  }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ height: '6px', backgroundColor: '#2f6a87', width: '100%' }}></div>
                    <Card.Body className="d-flex flex-column p-3 p-md-4">
                      <div className="text-center mb-2 mb-md-3">
                        <div className="badge mb-2 px-3 py-1" style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          fontSize: '0.75rem',
                          borderRadius: '50px'
                        }}>
                          GROUP CLASS
                        </div>
                        <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>{plan.name}</h4>
                      </div>
                      <ul className="list-unstyled mb-2 mb-md-3 flex-grow-1">
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>🎯</span>
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{plan.sessions} Sessions</div>
                          </div>
                        </li>
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>📅</span>
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Validity: {plan.validityDays} Days</div>
                          </div>
                        </li>
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>💰</span>
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Price: {plan.displayPrice}</div>
                          </div>
                        </li>
                      </ul>
                      <Button
                        style={{
                          backgroundColor: '#2f6a87',
                          borderColor: '#2f6a87',
                          transition: 'background-color 0.3s ease',
                          borderRadius: '50px',
                          padding: '8px 16px',
                          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                          fontWeight: '600'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
                        onClick={() => handleBookNow(plan, 'group')}
                        className="mt-auto fw-bold"
                      >
                        📅 Book Now
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}

        {/* Personal Plans */}
        {activeTab === 'personal' && (
          <Row className="g-3 g-md-4">
            {personalPlans.length === 0 ? (
              <Col>
                <div className="text-center py-4 text-muted">No personal training plans available.</div>
              </Col>
            ) : (
              personalPlans.map((plan) => (
                <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex">
                  <Card className="h-100 shadow-sm border-0 flex-fill" style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    border: '1px solid #e9ecef'
                  }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ height: '6px', backgroundColor: '#2f6a87', width: '100%' }}></div>
                    <Card.Body className="d-flex flex-column p-3 p-md-4">
                      <div className="text-center mb-2 mb-md-3">
                        <div className="badge bg-primary mb-2 px-3 py-1" style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          fontSize: '0.75rem',
                          borderRadius: '50px'
                        }}>
                          PERSONAL TRAINING
                        </div>
                        <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>{plan.name}</h4>
                      </div>
                      <ul className="list-unstyled mb-2 mb-md-3 flex-grow-1">
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>🎯</span>
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{plan.sessions} Sessions</div>
                          </div>
                        </li>
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>📅</span>
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Validity: {plan.validityDays} Days</div>
                          </div>
                        </li>
                        <li className="mb-2 d-flex align-items-center gap-2">
                          <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>💰</span>
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Price: {plan.displayPrice}</div>
                          </div>
                        </li>
                      </ul>
                      <Button
                        style={{
                          backgroundColor: '#2f6a87',
                          borderColor: '#2f6a87',
                          transition: 'background-color 0.3s ease',
                          borderRadius: '50px',
                          padding: '8px 16px',
                          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                          fontWeight: '600'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
                        onClick={() => handleBookNow(plan, 'personal')}
                        className="mt-auto fw-bold"
                      >
                        📅 Book Now
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}

        {/* Payment Modal */}
        <Modal show={showPaymentModal} onHide={() => {
          setShowPaymentModal(false);
          setBookingMessage('');
          setBookingStatus(null);
        }} centered size="md">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '3px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.2rem' }}>Complete Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {bookingStatus === 'pending' ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 fw-bold" style={{ color: '#333', fontSize: '1.1rem' }}>Processing your booking...</p>
              </div>
            ) : (
              <Form onSubmit={handlePaymentSubmit}>
                <div className="text-center mb-3 p-3 rounded" style={{ backgroundColor: '#f0f7fa', border: '2px dashed #2f6a87', borderRadius: '12px' }}>
                  <h5 className="mb-2" style={{ color: '#333', fontSize: '1.1rem' }}>Booking Details</h5>
                  <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                    <strong>Plan:</strong> {selectedPlan?.name} ({selectedPlan?.type === 'group' ? 'Group' : 'Personal'})
                  </p>
                  <p className="mb-0">
                    <strong>Amount:</strong> <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#2f6a87' }}>{selectedPlan?.displayPrice}</span>
                  </p>
                </div>

                {bookingMessage && (
                  <Alert variant={bookingStatus === 'error' ? 'danger' : bookingStatus === 'success' ? 'success' : 'info'} className="mb-3">
                    {bookingMessage}
                  </Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#333', fontWeight: '600', fontSize: '1rem' }}>UPI ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="yourname@upi"
                    value={paymentDetails.upi}
                    onChange={(e) => setPaymentDetails({ upi: e.target.value })}
                    required
                    isInvalid={!!(bookingMessage && bookingStatus === 'error')}
                    style={{
                      padding: '10px',
                      fontSize: '1rem',
                      borderRadius: '8px',
                      borderColor: '#2f6a87'
                    }}
                  />
                  <Form.Text className="text-muted">
                    Enter your UPI ID (e.g., yourname@upi, yournumber@ybl)
                  </Form.Text>
                </Form.Group>
                <div className="d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="w-100 py-2 fw-bold rounded-pill"
                    style={{
                      backgroundColor: '#2f6a87',
                      borderColor: '#2f6a87',
                      fontSize: '1.1rem',
                      transition: 'background-color 0.3s ease',
                      padding: '10px 20px',
                      maxWidth: '400px'
                    }}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>

        {/* Bookings Table */}
        {/* <div className="mt-4 mt-md-5 pt-4 pt-md-5 border-top">
          <h3 className="fw-bold mb-3 mb-md-4 text-dark" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)' }}>
            {loadingBookings ? 'Loading Bookings...' : 'Your Bookings'}
          </h3>
          {loadingBookings ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" variant="primary" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="table-responsive">
              <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Card.Body className="p-0">
                  <Table hover responsive className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-2 py-md-3">#</th>
                        <th className="py-2 py-md-3">Plan Name</th>
                        <th className="py-2 py-md-3 d-none d-md-table-cell">Type</th>
                        <th className="py-2 py-md-3 d-none d-md-table-cell">Purchased On</th>
                        <th className="py-2 py-md-3">Status</th>
                        <th className="py-2 py-md-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking, index) => (
                        <tr key={booking.id}>
                          <td className="py-2 py-md-3 fw-bold">{index + 1}</td>
                          <td className="py-2 py-md-3">
                            <strong style={{ color: '#333', fontSize: '1rem' }}>{booking.planName}</strong>
                          </td>
                          <td className="py-2 py-md-3 d-none d-md-table-cell">
                            <span className="badge" style={{
                              backgroundColor: '#2f6a87',
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '0.8rem'
                            }}>
                              {booking.type}
                            </span>
                          </td>
                          <td className="py-2 py-md-3 d-none d-md-table-cell" style={{ fontSize: '0.95rem' }}>
                            {booking.purchasedAt}
                          </td>
                          <td className="py-2 py-md-3">
                            {booking.status === 'approved' && <span className="badge bg-success px-2 py-1" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>Approved</span>}
                            {booking.status === 'pending' && <span className="badge bg-warning text-dark px-2 py-1" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>Pending</span>}
                            {booking.status === 'rejected' && <span className="badge bg-danger px-2 py-1" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>Rejected</span>}
                          </td>
                          <td className="py-2 py-md-3">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleViewBooking(booking)}
                              disabled={booking.status !== 'approved'}
                              style={{
                                borderColor: '#2f6a87',
                                color: booking.status === 'approved' ? '#2f6a87' : '#ccc',
                                cursor: booking.status === 'approved' ? 'pointer' : 'not-allowed',
                                borderRadius: '20px',
                                padding: '4px 12px',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                              }}
                            >
                              <FaEye className="me-1" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div className="text-center py-3 text-muted">No bookings yet.</div>
          )}
        </div> */}

        {/* View Booking Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.1rem' }}>Booking Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            {selectedBooking && (
              <div className="p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
                <h4 className="fw-bold mb-3" style={{ color: '#333', fontSize: '1.2rem' }}>
                  {selectedBooking.planName} ({selectedBooking.type})
                </h4>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-2 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-1">
                        <span className="me-2" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>📅</span>
                        <h6 className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Purchased On</h6>
                      </div>
                      <p className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>{selectedBooking.purchasedAt}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-1">
                        <span className="me-2" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>⏳</span>
                        <h6 className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Validity</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge" style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          fontSize: '0.9rem',
                          padding: '6px 12px',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.validity} Days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-1">
                        <span className="me-2" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>🎯</span>
                        <h6 className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Total Sessions</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge" style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          fontSize: '0.9rem',
                          padding: '6px 12px',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.totalSessions}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-1">
                        <span className="me-2" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>✅</span>
                        <h6 className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Remaining Sessions</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success" style={{
                          fontSize: '0.9rem',
                          padding: '6px 12px',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.remainingSessions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.status === 'approved' && (
                  <div className="mt-3 p-3 bg-white rounded" style={{
                    border: '1px solid #2f6a87',
                    borderRadius: '12px',
                    backgroundColor: '#f0f7fa'
                  }}>
                    <div className="d-flex align-items-center mb-1">
                      <h5 className="mb-0" style={{ color: '#333', fontSize: '1rem' }}>Plan Active</h5>
                    </div>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                      You can book sessions until your validity expires or sessions run out.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #eee' }}>
            <Button
              variant="secondary"
              onClick={() => setShowViewModal(false)}
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                color: 'white',
                borderRadius: '50px',
                padding: '6px 20px',
                fontSize: '0.9rem',
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Global Success Toast (optional) */}
        {bookingStatus === 'success' && bookingMessage && (
          <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 1000 }}>
            <Alert
              variant="success"
              className="p-3 rounded-pill shadow-lg d-flex align-items-center gap-2 mb-0"
              style={{
                minWidth: '300px',
                animation: 'fadeInUp 0.5s ease',
              }}
            >
              <FaCheckCircle size={20} />
              <span className="fw-bold">{bookingMessage}</span>
            </Alert>
          </div>
        )}

        <style jsx="true">{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Container>
    </div>
  );
};

export default ViewPlans;