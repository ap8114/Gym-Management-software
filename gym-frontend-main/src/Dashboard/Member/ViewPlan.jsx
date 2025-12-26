// import React, { useState, useEffect, useMemo } from 'react';
// import { Container, Row, Col, Button, Card, Modal, Form, Table, Spinner, Alert } from 'react-bootstrap';
// import { FaCheckCircle, FaEye } from 'react-icons/fa';
// import axiosInstance from '../../Api/axiosInstance';

// const ViewPlans = () => {
//   const [activeTab, setActiveTab] = useState('group');
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [bookingStatus, setBookingStatus] = useState(null); // 'pending', 'success', 'error'
//   const [paymentDetails, setPaymentDetails] = useState({ upi: '' });
//   const [allPlans, setAllPlans] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [loadingPlans, setLoadingPlans] = useState(true);
//   const [loadingBookings, setLoadingBookings] = useState(true);
//   const [error, setError] = useState(null);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [bookingMessage, setBookingMessage] = useState('');

//   const getUserFromStorage = () => {
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
//   // const branchId = user?.branchId || null;

//   console.log('Member ID:', memberId);
//   console.log('Admin ID:', adminId);
//   // console.log('Branch ID:', branchId);

//   // Fetch plans
//   useEffect(() => {
//     const fetchPlans = async () => {
//       if (!adminId) {
//         setLoadingPlans(false);
//         setError('Admin ID not found. Unable to load plans.');
//         return;
//       }

//       try {
//         const response = await axiosInstance.get(`MemberPlan?adminId=${adminId}`);
//         if (response.data.success && Array.isArray(response.data.plans)) {
//           // Store original price as number for booking; format only for display
//           const formattedPlans = response.data.plans.map(plan => ({
//             ...plan,
//             displayPrice: `$${(plan.price || 0).toLocaleString()}`,
//             numericPrice: plan.price || 0,
//           }));
//           setAllPlans(formattedPlans);
//         } else {
//           setAllPlans([]);
//           setError('No plans available.');
//         }
//       } catch (err) {
//         console.error('Error fetching plans:', err);
//         setError('Failed to load plans. Please try again.');
//         setAllPlans([]);
//       } finally {
//         setLoadingPlans(false);
//       }
//     };

//     fetchPlans();
//   }, [adminId]);

//   // Fetch bookings
//   useEffect(() => {
//     const fetchBookings = async () => {
//       if (!memberId) {
//         setLoadingBookings(false);
//         return;
//       }

//       try {
//         const response = await axiosInstance.get('booking/requests');
//         if (response.data.success && Array.isArray(response.data.bookings)) {
//           const mapped = response.data.bookings.map(b => ({
//             id: b.id,
//             planName: b.plan?.name || 'Unknown Plan',
//             type: b.plan?.type === 'PERSONAL' ? 'Personal' : 'Group',
//             purchasedAt: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : 'N/A',
//             validity: b.plan?.validityDays || 0,
//             totalSessions: b.plan?.sessions || 0,
//             remainingSessions: b.leftSessions || 0,
//             status: b.status || 'pending',
//             planId: b.planId,
//           }));
//           setBookings(mapped);
//         } else {
//           setBookings([]);
//         }
//       } catch (err) {
//         console.error('Error fetching bookings:', err);
//         setBookings([]);
//       } finally {
//         setLoadingBookings(false);
//       }
//     };

//     fetchBookings();
//   }, [memberId]);

//   const groupPlans = useMemo(() => allPlans.filter(plan => plan.type === 'GROUP'), [allPlans]);
//   const personalPlans = useMemo(() => allPlans.filter(plan => plan.type === 'PERSONAL'), [allPlans]);

//   const handleBookNow = (plan, planType) => {
//     setSelectedPlan({ ...plan, type: planType });
//     setPaymentDetails({ upi: '' });
//     setShowPaymentModal(true);
//   };

//   const handlePaymentSubmit = async (e) => {
//     e.preventDefault();
//     const upi = paymentDetails.upi.trim();

//     if (!upi) {
//       setBookingMessage('Please enter a valid UPI ID.');
//       return;
//     }

//     if (!memberId || !adminId || !branchId || !selectedPlan) {
//       setBookingMessage('Missing user or plan details. Please log in again.');
//       return;
//     }

//     setBookingStatus('pending');
//     setBookingMessage('');

//     try {
//       // Use numericPrice (not parsed from string)
//       const payload = {
//         memberId: memberId,
//         classId: selectedPlan.id,
//         branchId: branchId,
//         adminId: adminId,
//         price: selectedPlan.numericPrice, // ✅ Correct numeric value
//         upiId: upi,
//       };

//       const response = await axiosInstance.post('booking/create', payload);

//       if (response.data.success) {
//         setBookingStatus('success');
//         setBookingMessage(response.data.message || 'Booking request sent to admin.');
//         setShowPaymentModal(false);
//         setPaymentDetails({ upi: '' });

//         // Refresh bookings
//         const bookingsRes = await axiosInstance.get('booking/requests');
//         if (bookingsRes.data.success && Array.isArray(bookingsRes.data.bookings)) {
//           const mapped = bookingsRes.data.bookings.map(b => ({
//             id: b.id,
//             planName: b.plan?.name || 'Unknown Plan',
//             type: b.plan?.type === 'PERSONAL' ? 'Personal' : 'Group',
//             purchasedAt: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : 'N/A',
//             validity: b.plan?.validityDays || 0,
//             totalSessions: b.plan?.sessions || 0,
//             remainingSessions: b.leftSessions || 0,
//             status: b.status || 'pending',
//             planId: b.planId,
//           }));
//           setBookings(mapped);
//         }
//       } else {
//         const errorMsg = response.data.message || 'Booking failed. Please try again.';
//         setBookingMessage(errorMsg);
//         setBookingStatus('error');
//       }
//     } catch (err) {
//       console.error('Booking submission error:', err);
//       setBookingStatus('error');
//       setBookingMessage('Failed to create booking. Please try again or contact support.');
//     }
//   };

//   const handleViewBooking = (booking) => {
//     setSelectedBooking(booking);
//     setShowViewModal(true);
//   };

//   if (loadingPlans) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-50">
//         <Spinner animation="border" variant="primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="bg-light py-2">
//       <Container>
//         <h1 className="mb-4 mb-md-5 fw-bold text-dark" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
//           Choose Your Fitness Plan
//         </h1>

//         {/* Tabs */}
//         <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 mb-4 mb-md-5">
//           <Button
//             variant={activeTab === 'group' ? 'primary' : 'outline-primary'}
//             onClick={() => setActiveTab('group')}
//             className="px-3 px-md-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 flex-grow-2"
//             style={{
//               backgroundColor: activeTab === 'group' ? '#2f6a87' : 'transparent',
//               borderColor: '#2f6a87',
//               color: activeTab === 'group' ? 'white' : '#2f6a87',
//               borderRadius: '12px',
//               fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
//               transition: 'all 0.3s ease',
//             }}
//           >
//             <span>Group Classes</span>
//           </Button>
//           <Button
//             variant={activeTab === 'personal' ? 'primary' : 'outline-primary'}
//             onClick={() => setActiveTab('personal')}
//             className="px-3 px-md-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 flex-grow-2"
//             style={{
//               backgroundColor: activeTab === 'personal' ? '#2f6a87' : 'transparent',
//               borderColor: '#2f6a87',
//               color: activeTab === 'personal' ? 'white' : '#2f6a87',
//               borderRadius: '12px',
//               fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
//               transition: 'all 0.3s ease',
//             }}
//           >
//             <span>Personal Training</span>
//           </Button>
//         </div>

//         {/* Group Plans */}
//         {activeTab === 'group' && (
//           <Row className="g-3 g-md-4">
//             {groupPlans.length === 0 ? (
//               <Col>
//                 <div className="text-center py-4 text-muted">No group plans available.</div>
//               </Col>
//             ) : (
//               groupPlans.map((plan) => (
//                 <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex">
//                   <Card className="h-100 shadow-sm border-0 flex-fill" style={{
//                     borderRadius: '12px',
//                     overflow: 'hidden',
//                     transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//                     border: '1px solid #e9ecef'
//                   }}
//                     onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
//                     onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//                   >
//                     <div style={{ height: '6px', backgroundColor: '#2f6a87', width: '100%' }}></div>
//                     <Card.Body className="d-flex flex-column p-3 p-md-4">
//                       <div className="text-center mb-2 mb-md-3">
//                         <div className="badge mb-2 px-3 py-1" style={{
//                           backgroundColor: '#2f6a87',
//                           color: 'white',
//                           fontSize: '0.75rem',
//                           borderRadius: '50px'
//                         }}>
//                           GROUP CLASS
//                         </div>
//                         <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>{plan.name}</h4>
//                       </div>
//                       <ul className="list-unstyled mb-2 mb-md-3 flex-grow-1">
//                         <li className="mb-2 d-flex align-items-center gap-2">
//                           <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
//                             <span className="text-muted" style={{ fontSize: '0.9rem' }}>🎯</span>
//                           </div>
//                           <div>
//                             <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{plan.sessions} Sessions</div>
//                           </div>
//                         </li>
//                         <li className="mb-2 d-flex align-items-center gap-2">
//                           <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
//                             <span className="text-muted" style={{ fontSize: '0.9rem' }}>📅</span>
//                           </div>
//                           <div>
//                             <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Validity: {plan.validityDays} Days</div>
//                           </div>
//                         </li>
//                         <li className="mb-2 d-flex align-items-center gap-2">
//                           <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
//                             <span className="text-muted" style={{ fontSize: '0.9rem' }}>💰</span>
//                           </div>
//                           <div>
//                             <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Price: {plan.displayPrice}</div>
//                           </div>
//                         </li>
//                       </ul>
//                       <Button
//                         style={{
//                           backgroundColor: '#2f6a87',
//                           borderColor: '#2f6a87',
//                           transition: 'background-color 0.3s ease',
//                           borderRadius: '50px',
//                           padding: '8px 16px',
//                           fontSize: 'clamp(0.9rem, 2vw, 1rem)',
//                           fontWeight: '600'
//                         }}
//                         onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
//                         onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
//                         onClick={() => handleBookNow(plan, 'group')}
//                         className="mt-auto fw-bold"
//                       >
//                         📅 Book Now
//                       </Button>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))
//             )}
//           </Row>
//         )}

//         {/* Personal Plans */}
//         {activeTab === 'personal' && (
//           <Row className="g-3 g-md-4">
//             {personalPlans.length === 0 ? (
//               <Col>
//                 <div className="text-center py-4 text-muted">No personal training plans available.</div>
//               </Col>
//             ) : (
//               personalPlans.map((plan) => (
//                 <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex">
//                   <Card className="h-100 shadow-sm border-0 flex-fill" style={{
//                     borderRadius: '12px',
//                     overflow: 'hidden',
//                     transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//                     border: '1px solid #e9ecef'
//                   }}
//                     onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
//                     onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//                   >
//                     <div style={{ height: '6px', backgroundColor: '#2f6a87', width: '100%' }}></div>
//                     <Card.Body className="d-flex flex-column p-3 p-md-4">
//                       <div className="text-center mb-2 mb-md-3">
//                         <div className="badge bg-primary mb-2 px-3 py-1" style={{
//                           backgroundColor: '#2f6a87',
//                           color: 'white',
//                           fontSize: '0.75rem',
//                           borderRadius: '50px'
//                         }}>
//                           PERSONAL TRAINING
//                         </div>
//                         <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>{plan.name}</h4>
//                       </div>
//                       <ul className="list-unstyled mb-2 mb-md-3 flex-grow-1">
//                         <li className="mb-2 d-flex align-items-center gap-2">
//                           <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
//                             <span className="text-muted" style={{ fontSize: '0.9rem' }}>🎯</span>
//                           </div>
//                           <div>
//                             <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{plan.sessions} Sessions</div>
//                           </div>
//                         </li>
//                         <li className="mb-2 d-flex align-items-center gap-2">
//                           <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
//                             <span className="text-muted" style={{ fontSize: '0.9rem' }}>📅</span>
//                           </div>
//                           <div>
//                             <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Validity: {plan.validityDays} Days</div>
//                           </div>
//                         </li>
//                         <li className="mb-2 d-flex align-items-center gap-2">
//                           <div className="bg-light rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
//                             <span className="text-muted" style={{ fontSize: '0.9rem' }}>💰</span>
//                           </div>
//                           <div>
//                             <div className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Price: {plan.displayPrice}</div>
//                           </div>
//                         </li>
//                       </ul>
//                       <Button
//                         style={{
//                           backgroundColor: '#2f6a87',
//                           borderColor: '#2f6a87',
//                           transition: 'background-color 0.3s ease',
//                           borderRadius: '50px',
//                           padding: '8px 16px',
//                           fontSize: 'clamp(0.9rem, 2vw, 1rem)',
//                           fontWeight: '600'
//                         }}
//                         onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
//                         onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
//                         onClick={() => handleBookNow(plan, 'personal')}
//                         className="mt-auto fw-bold"
//                       >
//                         📅 Book Now
//                       </Button>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))
//             )}
//           </Row>
//         )}

//         {/* Payment Modal */}
//         <Modal show={showPaymentModal} onHide={() => {
//           setShowPaymentModal(false);
//           setBookingMessage('');
//           setBookingStatus(null);
//         }} centered size="md">
//           <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '3px solid #2f6a87' }}>
//             <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.2rem' }}>Complete Payment</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {bookingStatus === 'pending' ? (
//               <div className="text-center py-4">
//                 <Spinner animation="border" variant="primary" />
//                 <p className="mt-3 fw-bold" style={{ color: '#333', fontSize: '1.1rem' }}>Processing your booking...</p>
//               </div>
//             ) : (
//               <Form onSubmit={handlePaymentSubmit}>
//                 <div className="text-center mb-3 p-3 rounded" style={{ backgroundColor: '#f0f7fa', border: '2px dashed #2f6a87', borderRadius: '12px' }}>
//                   <h5 className="mb-2" style={{ color: '#333', fontSize: '1.1rem' }}>Booking Details</h5>
//                   <p className="mb-1" style={{ fontSize: '0.95rem' }}>
//                     <strong>Plan:</strong> {selectedPlan?.name} ({selectedPlan?.type === 'group' ? 'Group' : 'Personal'})
//                   </p>
//                   <p className="mb-0">
//                     <strong>Amount:</strong> <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#2f6a87' }}>{selectedPlan?.displayPrice}</span>
//                   </p>
//                 </div>

//                 {bookingMessage && (
//                   <Alert variant={bookingStatus === 'error' ? 'danger' : bookingStatus === 'success' ? 'success' : 'info'} className="mb-3">
//                     {bookingMessage}
//                   </Alert>
//                 )}

//                 <Form.Group className="mb-3">
//                   <Form.Label style={{ color: '#333', fontWeight: '600', fontSize: '1rem' }}>UPI ID</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="yourname@upi"
//                     value={paymentDetails.upi}
//                     onChange={(e) => setPaymentDetails({ upi: e.target.value })}
//                     required
//                     isInvalid={!!(bookingMessage && bookingStatus === 'error')}
//                     style={{
//                       padding: '10px',
//                       fontSize: '1rem',
//                       borderRadius: '8px',
//                       borderColor: '#2f6a87'
//                     }}
//                   />
//                   <Form.Text className="text-muted">
//                     Enter your UPI ID (e.g., yourname@upi, yournumber@ybl)
//                   </Form.Text>
//                 </Form.Group>
//                 <div className="d-flex justify-content-center">
//                   <Button
//                     type="submit"
//                     className="w-100 py-2 fw-bold rounded-pill"
//                     style={{
//                       backgroundColor: '#2f6a87',
//                       borderColor: '#2f6a87',
//                       fontSize: '1.1rem',
//                       transition: 'background-color 0.3s ease',
//                       padding: '10px 20px',
//                       maxWidth: '400px'
//                     }}
//                   >
//                     Confirm Booking
//                   </Button>
//                 </div>
//               </Form>
//             )}
//           </Modal.Body>
//         </Modal>

//         {/* Bookings Table */}
//         {/* <div className="mt-4 mt-md-5 pt-4 pt-md-5 border-top">
//           <h3 className="fw-bold mb-3 mb-md-4 text-dark" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)' }}>
//             {loadingBookings ? 'Loading Bookings...' : 'Your Bookings'}
//           </h3>
//           {loadingBookings ? (
//             <div className="text-center py-3">
//               <Spinner animation="border" size="sm" variant="primary" />
//             </div>
//           ) : bookings.length > 0 ? (
//             <div className="table-responsive">
//               <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
//                 <Card.Body className="p-0">
//                   <Table hover responsive className="align-middle mb-0">
//                     <thead className="bg-light">
//                       <tr>
//                         <th className="py-2 py-md-3">#</th>
//                         <th className="py-2 py-md-3">Plan Name</th>
//                         <th className="py-2 py-md-3 d-none d-md-table-cell">Type</th>
//                         <th className="py-2 py-md-3 d-none d-md-table-cell">Purchased On</th>
//                         <th className="py-2 py-md-3">Status</th>
//                         <th className="py-2 py-md-3">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {bookings.map((booking, index) => (
//                         <tr key={booking.id}>
//                           <td className="py-2 py-md-3 fw-bold">{index + 1}</td>
//                           <td className="py-2 py-md-3">
//                             <strong style={{ color: '#333', fontSize: '1rem' }}>{booking.planName}</strong>
//                           </td>
//                           <td className="py-2 py-md-3 d-none d-md-table-cell">
//                             <span className="badge" style={{
//                               backgroundColor: '#2f6a87',
//                               color: 'white',
//                               borderRadius: '20px',
//                               fontSize: '0.8rem'
//                             }}>
//                               {booking.type}
//                             </span>
//                           </td>
//                           <td className="py-2 py-md-3 d-none d-md-table-cell" style={{ fontSize: '0.95rem' }}>
//                             {booking.purchasedAt}
//                           </td>
//                           <td className="py-2 py-md-3">
//                             {booking.status === 'approved' && <span className="badge bg-success px-2 py-1" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>Approved</span>}
//                             {booking.status === 'pending' && <span className="badge bg-warning text-dark px-2 py-1" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>Pending</span>}
//                             {booking.status === 'rejected' && <span className="badge bg-danger px-2 py-1" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>Rejected</span>}
//                           </td>
//                           <td className="py-2 py-md-3">
//                             <Button
//                               variant="outline-secondary"
//                               size="sm"
//                               onClick={() => handleViewBooking(booking)}
//                               disabled={booking.status !== 'approved'}
//                               style={{
//                                 borderColor: '#2f6a87',
//                                 color: booking.status === 'approved' ? '#2f6a87' : '#ccc',
//                                 cursor: booking.status === 'approved' ? 'pointer' : 'not-allowed',
//                                 borderRadius: '20px',
//                                 padding: '4px 12px',
//                                 fontWeight: '600',
//                                 fontSize: '0.85rem',
//                               }}
//                             >
//                               <FaEye className="me-1" /> View
//                             </Button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </Card.Body>
//               </Card>
//             </div>
//           ) : (
//             <div className="text-center py-3 text-muted">No bookings yet.</div>
//           )}
//         </div> */}

//         {/* View Booking Modal */}
//         <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md">
//           <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #2f6a87' }}>
//             <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.1rem' }}>Booking Details</Modal.Title>
//           </Modal.Header>
//           <Modal.Body className="p-3">
//             {selectedBooking && (
//               <div className="p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
//                 <h4 className="fw-bold mb-3" style={{ color: '#333', fontSize: '1.2rem' }}>
//                   {selectedBooking.planName} ({selectedBooking.type})
//                 </h4>
//                 <div className="row g-3">
//                   <div className="col-6">
//                     <div className="p-2 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
//                       <div className="d-flex align-items-center mb-1">
//                         <span className="me-2" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>📅</span>
//                         <h6 className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Purchased On</h6>
//                       </div>
//                       <p className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>{selectedBooking.purchasedAt}</p>
//                     </div>
//                   </div>
//                   <div className="col-6">
//                     <div className="p-2 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
//                       <div className="d-flex align-items-center mb-1">
//                         <span className="me-2" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>⏳</span>
//                         <h6 className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Validity</h6>
//                       </div>
//                       <div className="d-flex align-items-center">
//                         <span className="badge" style={{
//                           backgroundColor: '#2f6a87',
//                           color: 'white',
//                           fontSize: '0.9rem',
//                           padding: '6px 12px',
//                           borderRadius: '20px'
//                         }}>
//                           {selectedBooking.validity} Days
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-6">
//                     <div className="p-2 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
//                       <div className="d-flex align-items-center mb-1">
//                         <span className="me-2" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>🎯</span>
//                         <h6 className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Total Sessions</h6>
//                       </div>
//                       <div className="d-flex align-items-center">
//                         <span className="badge" style={{
//                           backgroundColor: '#2f6a87',
//                           color: 'white',
//                           fontSize: '0.9rem',
//                           padding: '6px 12px',
//                           borderRadius: '20px'
//                         }}>
//                           {selectedBooking.totalSessions}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-6">
//                     <div className="p-2 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
//                       <div className="d-flex align-items-center mb-1">
//                         <span className="me-2" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>✅</span>
//                         <h6 className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Remaining Sessions</h6>
//                       </div>
//                       <div className="d-flex align-items-center">
//                         <span className="badge bg-success" style={{
//                           fontSize: '0.9rem',
//                           padding: '6px 12px',
//                           borderRadius: '20px'
//                         }}>
//                           {selectedBooking.remainingSessions}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {selectedBooking.status === 'approved' && (
//                   <div className="mt-3 p-3 bg-white rounded" style={{
//                     border: '1px solid #2f6a87',
//                     borderRadius: '12px',
//                     backgroundColor: '#f0f7fa'
//                   }}>
//                     <div className="d-flex align-items-center mb-1">
//                       <h5 className="mb-0" style={{ color: '#333', fontSize: '1rem' }}>Plan Active</h5>
//                     </div>
//                     <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
//                       You can book sessions until your validity expires or sessions run out.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </Modal.Body>
//           <Modal.Footer style={{ borderTop: '1px solid #eee' }}>
//             <Button
//               variant="secondary"
//               onClick={() => setShowViewModal(false)}
//               style={{
//                 backgroundColor: '#6c757d',
//                 borderColor: '#6c757d',
//                 color: 'white',
//                 borderRadius: '50px',
//                 padding: '6px 20px',
//                 fontSize: '0.9rem',
//               }}
//             >
//               Close
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         {/* Global Success Toast (optional) */}
//         {bookingStatus === 'success' && bookingMessage && (
//           <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 1000 }}>
//             <Alert
//               variant="success"
//               className="p-3 rounded-pill shadow-lg d-flex align-items-center gap-2 mb-0"
//               style={{
//                 minWidth: '300px',
//                 animation: 'fadeInUp 0.5s ease',
//               }}
//             >
//               <FaCheckCircle size={20} />
//               <span className="fw-bold">{bookingMessage}</span>
//             </Alert>
//           </div>
//         )}

//         <style jsx="true">{`
//           @keyframes fadeInUp {
//             from { opacity: 0; transform: translateY(30px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//         `}</style>
//       </Container>
//     </div>
//   );
// };

// export default ViewPlans;

import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  Form,
  Table,
  Spinner,
  Alert,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import { FaEye, FaRedo } from 'react-icons/fa';
import { Download } from 'lucide-react';
import axiosInstance from '../../Api/axiosInstance';
import html2canvas from "html2canvas";
import GymLogo from "../../assets/Logo/Logo1.png";
import BaseUrl from "../../Api/BaseUrl";

const ViewPlans = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  const [renewData, setRenewData] = useState({
    planId: '',
    paymentMode: 'Cash',
    amountPaid: '',
  });

  const [renewLoading, setRenewLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const toastRef = useRef(null);

  // Get user from localStorage
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
  const userId = user?.memberId || null;

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!memberId) {
        setError('Member ID not found.');
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(`member-self/profile/${memberId}`);
        if (response.data.success) {
          setProfile(response.data.profile);
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('Network or server error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [memberId]);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      if (!adminId) return;
      setLoadingPlans(true);
      try {
        const response = await axiosInstance.get(`MemberPlan?adminId=${adminId}`);
        if (response.data.success) {
          setPlans(response.data.plans || []);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [adminId]);

  const handleViewClick = () => setShowViewModal(true);

  const handleRenewClick = () => {
    setShowRenewModal(true);
    setRenewData({ planId: '', paymentMode: 'Cash', amountPaid: '' });
  };

  const handleRenewChange = (e) => {
    const { name, value } = e.target;
    setRenewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    setRenewLoading(true);

    // Validation
    if (!memberId) {
      setToast({ show: true, message: 'Member ID missing!', variant: 'danger' });
      setRenewLoading(false);
      return;
    }

    if (!renewData.planId) {
      setToast({ show: true, message: 'Please select a plan.', variant: 'warning' });
      setRenewLoading(false);
      return;
    }

    if (!renewData.amountPaid || Number(renewData.amountPaid) <= 0) {
      setToast({ show: true, message: 'Enter a valid amount.', variant: 'warning' });
      setRenewLoading(false);
      return;
    }

    try {
      const payload = {
        adminId: adminId,
        amountPaid: Number(renewData.amountPaid),
        paymentMode: renewData.paymentMode,
        planId: Number(renewData.planId),
      };

      await axiosInstance.put(`members/renew/${userId}`, payload);

      // Show success toast
      setToast({ show: true, message: 'Membership renewed successfully!', variant: 'success' });

      // Refetch profile
      const res = await axiosInstance.get(`member-self/profile/${memberId}`);
      if (res.data.success) setProfile(res.data.profile);

      // Close modal after delay
      setTimeout(() => {
        setShowRenewModal(false);
        setRenewData({ planId: '', paymentMode: 'Cash', amountPaid: '' });
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to renew membership. Please try again.';
      setToast({ show: true, message: errorMsg, variant: 'danger' });
      console.error(err);
    } finally {
      setRenewLoading(false);
    }
  };

  const hideToast = () => setToast({ ...toast, show: false });

  // Function to generate and download receipt as image using html2canvas
  const handleDownloadReceipt = async () => {
    try {
      if (!profile || !memberId) {
        setToast({ show: true, message: 'Profile data not available. Please refresh the page.', variant: 'danger' });
        return;
      }

      if (profile.membership_status !== 'Active') {
        setToast({ show: true, message: 'Receipt is only available for Active memberships.', variant: 'warning' });
        return;
      }

      // Fetch payment history for the member
      let paymentData = null;
      try {
        const paymentResponse = await axiosInstance.get(
          `${BaseUrl}payment/member/${memberId}`
        );
        if (paymentResponse.data?.success && paymentResponse.data.payments?.length > 0) {
          paymentData = paymentResponse.data.payments[0]; // Get latest payment
        }
      } catch (err) {
        console.log("Payment history not available");
      }

      // Get plan details from plans array
      const plan = plans.find((p) => p.name === profile.membership_plan);
      const planName = profile.membership_plan || "Membership Plan";
      const planPrice = profile.membership_fee 
        ? parseFloat(profile.membership_fee.toString().replace("₹", "").replace(/,/g, "")) 
        : (plan ? parseFloat(plan.price.toString().replace("₹", "").replace(/,/g, "")) : 0);
      const planValidity = profile.plan_duration || (plan ? plan.validityDays : "N/A");
      const planSessions = plan ? plan.sessions : "N/A";
      
      // Use payment data if available, otherwise use profile data
      const totalAmount = paymentData?.amount || planPrice || 0;
      const paymentMode = paymentData?.paymentMode || renewData?.paymentMode || "Cash";
      const cashPaid = paymentData?.amount || planPrice || 0;
      const change = 0;
      const invoiceNo = paymentData?.invoiceNo || `INV-${memberId}-${Date.now()}`;
      const paymentDate = paymentData?.paymentDate 
        ? new Date(paymentData.paymentDate).toLocaleDateString() 
        : new Date().toLocaleDateString();

      // Member details from profile
      const memberName = profile.fullName || "N/A";
      const memberPhone = profile.phone || "N/A";
      const memberEmail = profile.email || "N/A";
      const memberAddress = profile.address_street || "N/A";
      const memberGender = profile.gender || "N/A";
      const memberDOB = profile.dateOfBirth 
        ? new Date(profile.dateOfBirth).toLocaleDateString() 
        : "N/A";
      const membershipFrom = profile.plan_start_date || new Date().toLocaleDateString();
      const membershipTo = profile.plan_end_date || "N/A";
      const memberStatus = profile.membership_status || "N/A";

      // Convert logo to data URL for html2canvas
      let logoDataUrl = "";
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        logoDataUrl = await new Promise((resolve) => {
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            } catch (err) {
              resolve(GymLogo); // Fallback to original path
            }
          };
          img.onerror = () => resolve(GymLogo); // Fallback to original path
          img.src = GymLogo;
        });
      } catch (err) {
        logoDataUrl = GymLogo; // Use original path if conversion fails
      }

      // Create receipt HTML with all details matching the image format
      const receiptHTML = `
        <div id="receipt-container" style="
          width: 400px;
          background: white;
          padding: 30px 20px;
          font-family: 'Courier New', monospace;
          color: black;
          margin: 0 auto;
          box-sizing: border-box;
        ">
          <div style="border-top: 2px dashed #000; margin-bottom: 15px;"></div>
          <h1 style="text-align: center; font-weight: bold; font-size: 28px; margin: 15px 0; text-transform: uppercase; letter-spacing: 2px;">RECEIPT</h1>
          <div style="border-top: 2px dashed #000; margin: 15px 0 25px 0;"></div>
          
          <!-- Invoice and Date -->
          <div style="margin-bottom: 15px; font-size: 11px;">
            <div style="margin-bottom: 5px;"><strong>Invoice No:</strong> ${invoiceNo}</div>
            <div><strong>Date:</strong> ${paymentDate}</div>
          </div>
          
          <div style="border-top: 1px dashed #000; margin: 15px 0;"></div>
          
          <!-- Member Details Section -->
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">Member Details:</div>
            <div style="font-size: 11px; line-height: 1.6;">
              <div><strong>Name:</strong> ${memberName}</div>
              <div><strong>Phone:</strong> ${memberPhone}</div>
              <div><strong>Email:</strong> ${memberEmail}</div>
              <div><strong>Address:</strong> ${memberAddress}</div>
              <div><strong>Gender:</strong> ${memberGender}</div>
              <div><strong>Date of Birth:</strong> ${memberDOB}</div>
            </div>
          </div>
          
          <div style="border-top: 1px dashed #000; margin: 15px 0;"></div>
          
          <!-- Membership Details Section -->
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">Membership Details:</div>
            <div style="font-size: 11px; line-height: 1.6;">
              <div><strong>Plan:</strong> ${planName}</div>
              <div><strong>Validity:</strong> ${planValidity} days</div>
              <div><strong>Sessions:</strong> ${planSessions}</div>
              <div><strong>From:</strong> ${membershipFrom}</div>
              <div><strong>To:</strong> ${membershipTo}</div>
              <div><strong>Status:</strong> ${memberStatus}</div>
            </div>
          </div>
          
          <div style="border-top: 2px dashed #000; margin: 20px 0;"></div>
          
          <!-- Payment Items -->
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
              <span style="text-align: left;">1x ${planName}</span>
              <span style="text-align: right; margin-left: 20px;">₹ ${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="border-top: 2px dashed #000; margin: 20px 0;"></div>
          
          <!-- Payment Summary -->
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
              <span style="font-weight: bold; text-align: left;">TOTAL AMOUNT</span>
              <span style="font-weight: bold; text-align: right;">₹ ${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="border-top: 2px dashed #000; margin: 20px 0;"></div>
          
          <!-- Payment Details -->
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
              <span style="font-weight: bold; text-align: left;">${paymentMode.toUpperCase()}</span>
              <span style="font-weight: bold; text-align: right;">₹ ${cashPaid.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
              <span style="font-weight: bold; text-align: left;">CHANGE</span>
              <span style="font-weight: bold; text-align: right;">₹ ${change.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="border-top: 2px dashed #000; margin: 20px 0;"></div>
          
          <!-- Thank You -->
          <h2 style="text-align: center; font-weight: bold; font-size: 22px; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px;">THANK YOU</h2>
          <div style="border-top: 2px dashed #000; margin: 15px 0 20px 0;"></div>
          
          <!-- Gym Logo in Blank Rectangle Box -->
          <div style="margin-top: 25px; text-align: center;">
            <div style="
              border: 1px solid #000;
              margin: 15px auto;
              width: 320px;
              min-height: 100px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              box-sizing: border-box;
            ">
              <img src="${logoDataUrl}" alt="Gym Logo" style="max-width: 100%; max-height: 100px; height: auto; object-fit: contain; display: block;" />
            </div>
          </div>
        
          
          <!-- Watermark -->
          <div style="margin-top: 15px; text-align: left; font-size: 10px; color: #999; opacity: 0.5;">
            modif.ai
          </div>
        </div>
      `;

      // Create a temporary container
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = receiptHTML;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      document.body.appendChild(tempDiv);

      // Get the receipt container
      const receiptElement = tempDiv.querySelector("#receipt-container");

      // Wait for images to load before converting to canvas
      const images = receiptElement.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if image fails
              }
            })
        )
      );

      // Convert to canvas and download
      const canvas = await html2canvas(receiptElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `Receipt_${memberName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      // Clean up
      document.body.removeChild(tempDiv);
      
      setToast({ show: true, message: 'Receipt downloaded successfully!', variant: 'success' });
    } catch (error) {
      console.error("Error generating receipt:", error);
      setToast({ show: true, message: 'Failed to generate receipt. Please try again.', variant: 'danger' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="fw-bold mb-4">My Membership Information</h3>
      <div className="table-responsive">
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Card.Body className="p-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-2 py-md-3">#</th>
                  <th className="py-2 py-md-3">Membership Plan</th>
                  <th className="py-2 py-md-3 d-none d-md-table-cell">Start Date</th>
                  <th className="py-2 py-md-3 d-none d-md-table-cell">End Date</th>
                  <th className="py-2 py-md-3">Membership Fee</th>
                  <th className="py-2 py-md-3">Membership Type</th>
                  <th className="py-2 py-md-3">Status</th>
                  <th className="py-2 py-md-3">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 py-md-3 fw-bold">1</td>
                  <td className="py-2 py-md-3">
                    <strong style={{ color: '#333', fontSize: '1rem' }}>
                      {profile.membership_plan || '—'}
                    </strong>
                  </td>
                  <td className="py-2 py-md-3 d-none d-md-table-cell">
                    {profile.plan_start_date || '—'}
                  </td>
                  <td className="py-2 py-md-3 d-none d-md-table-cell" style={{ fontSize: '0.95rem' }}>
                    {profile.plan_end_date || '—'}
                  </td>
                  <td className="py-2 py-md-3">₹{profile.membership_fee || '0'}</td>
                  <td className="py-2 py-md-3">
                    {profile.plan_duration ? `${profile.plan_duration} Days` : '—'}
                  </td>
                  <td className="py-2 py-md-3">
                    <span
                      className={`badge bg-${profile.membership_status === 'Active' ? 'success' : 'secondary'
                        }`}
                    >
                      {profile.membership_status || 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 py-md-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={handleViewClick}
                      title="View"
                    >
                      <FaEye className="me-1" />
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={handleRenewClick}
                      title="Renew Plan"
                      disabled={profile?.membership_status === 'Active'}
                    >
                      <FaRedo className="me-1" /> 
                    </Button>
                    {profile && profile.membership_status === 'Active' && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={handleDownloadReceipt}
                        title="Download Receipt"
                      >
                        <Download size={14} className="me-1" /> 
                      </Button>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Membership Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <p><strong>Name:</strong> {profile.fullName || '—'}</p>
              <p><strong>Email:</strong> {profile.email || '—'}</p>
              <p><strong>Phone:</strong> {profile.phone || '—'}</p>
              <p><strong>Address:</strong> {profile.address_street || '—'}</p>
              <p><strong>Gender:</strong> {profile.gender || '—'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Plan:</strong> {profile.membership_plan || '—'}</p>
              <p><strong>Start Date:</strong> {profile.plan_start_date || '—'}</p>
              <p><strong>End Date:</strong> {profile.plan_end_date || '—'}</p>
              <p><strong>Fee:</strong> ₹{profile.membership_fee || '0'}</p>
              <p><strong>Status:</strong>{' '}
                <span className={`badge bg-${profile.membership_status === 'Active' ? 'success' : 'secondary'}`}>
                  {profile.membership_status || 'Inactive'}
                </span>
              </p>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Renew Modal */}
      <Modal show={showRenewModal} onHide={() => setShowRenewModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Renew Membership Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRenewSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Membership Plan</Form.Label>
              <Form.Select
                name="planId"
                value={renewData.planId}
                onChange={handleRenewChange}
                required
                disabled={loadingPlans}
              >
                <option value="">Select Plan</option>
                {plans
                  .filter((plan) => plan.status === 'Active')
                  .map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price} ({plan.validityDays} days)
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment Mode</Form.Label>
              <Form.Select
                name="paymentMode"
                value={renewData.paymentMode}
                onChange={handleRenewChange}
                required
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount Paid</Form.Label>
              <Form.Control
                type="number"
                name="amountPaid"
                value={renewData.amountPaid}
                onChange={handleRenewChange}
                placeholder="Enter amount paid"
                required
                min="0"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenewModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRenewSubmit}
            disabled={renewLoading || !renewData.planId || !renewData.amountPaid}
          >
            {renewLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              'Renew Plan'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
        <Toast
          ref={toastRef}
          show={toast.show}
          onClose={hideToast}
          bg={toast.variant}
          delay={4000}
          autohide
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toast.variant === 'success' ? 'Success' : toast.variant === 'danger' ? 'Error' : 'Warning'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default ViewPlans;