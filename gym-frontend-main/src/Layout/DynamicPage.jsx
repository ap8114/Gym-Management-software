// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axiosInstance from "../Api/axiosInstance";
// import { Container, Row, Col, Button, Card, Modal, Form, Table, Spinner, Alert } from 'react-bootstrap';

// const DynamicPage = () => {
//   const { slug, adminId } = useParams();
//   const navigate = useNavigate();

//   const [settings, setSettings] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//    const [paymentDetails, setPaymentDetails] = useState({ upi: '' });
//    const [showPaymentModal, setShowPaymentModal] = useState(false);
//      const [bookingMessage, setBookingMessage] = useState('');
//       const [bookingStatus, setBookingStatus] = useState(null); // 'pending', 'success', 'error'

//   useEffect(() => {
//     const fetchPageData = async () => {
//       try {
//         // 1️⃣ Fetch App Settings
//         const settingsRes = await axiosInstance.get(
//           `/adminSettings/app-settings/admin/${adminId}`
//         );

//         const appSettings = settingsRes.data?.data;
//         if (!appSettings) {
//           setLoading(false);
//           return;
//         }

//         const apiSlug = appSettings.url;

//         // 2️⃣ Fix URL if slug missing / wrong
//         if (!slug || slug !== apiSlug) {
//           navigate(`/${apiSlug}/${adminId}`, { replace: true });
//           return;
//         }

//         setSettings(appSettings);

//         // 3️⃣ Fetch Plans
//         const plansRes = await axiosInstance.get(
//           `/MemberPlan?adminId=${adminId}`
//         );

//         setPlans(plansRes.data?.plans || []);
//       } catch (err) {
//         console.error("Dynamic page error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPageData();
//   }, [slug, adminId, navigate]);

//   if (loading) {
//     return (
//       <div className="text-center mt-5">
//         <h4>Loading page...</h4>
//       </div>
//     );
//   }

//    const handlePaymentSubmit = async (e) => {
//       e.preventDefault();
//       const upi = paymentDetails.upi.trim();
  
//       if (!upi) {
//         setBookingMessage('Please enter a valid UPI ID.');
//         return;
//       }
  
//       if (!memberId || !adminId || !selectedPlan) {
//         setBookingMessage('Missing user or plan details. Please log in again.');
//         return;
//       }
  
//       setBookingStatus('pending');
//       setBookingMessage('');
  
//       try {
//         const payload = {
//           memberId: memberId,
//           classId: selectedPlan.id,
//           branchId: branchId,
//           adminId: adminId,
//           price: selectedPlan.numericPrice,
//           upiId: upi,
//         };
  
//         console.log('Booking payload:', payload);
  
//         const response = await axiosInstance.post('booking/create', payload);
//         console.log('Booking response:', response.data);
  
//         if (response.data.success) {
//           setBookingStatus('success');
//           setBookingMessage(response.data.message || 'Booking request sent to admin.');
//           setShowPaymentModal(false);
//           setPaymentDetails({ upi: '' });
  
//           // Refresh bookings
//           const bookingsRes = await axiosInstance.get('booking/requests');
//           if (bookingsRes.data.success && Array.isArray(bookingsRes.data.bookings)) {
//             const mapped = bookingsRes.data.bookings.map(b => ({
//               id: b.id,
//               planName: b.plan?.name || 'Unknown Plan',
//               type: b.plan?.type === 'PERSONAL' ? 'Personal' : 'Group',
//               purchasedAt: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : 'N/A',
//               validity: b.plan?.validityDays || 0,
//               totalSessions: b.plan?.sessions || 0,
//               remainingSessions: b.leftSessions || 0,
//               status: b.status || 'pending',
//               planId: b.planId,
//             }));
//             setBookings(mapped);
//           }
//         } else {
//           const errorMsg = response.data.message || 'Booking failed. Please try again.';
//           setBookingMessage(errorMsg);
//           setBookingStatus('error');
//         }
//       } catch (err) {
//         console.error('Booking submission error:', err);
//         setBookingStatus('error');
//         setBookingMessage('Failed to create booking. Please try again or contact support.');
//       }
//     };

//   if (!settings) {
//     return (
//       <div className="text-center mt-5">
//         {/* <h3>Page Not Found</h3> */}
//       </div>
//     );
//   }

//   return (
//     <div style={{ background: "#f8f9fa"}}>
      
//       {/* ================= HERO SECTION ================= */}
//       <div
//         style={{
//           background: "linear-gradient(135deg, #002d4d, #004b80)",
//           color: "#fff",
//           padding: "90px 20px",
//         }}
//       >
//         <div className="container">
//           <div className="row align-items-center">

//             {/* LEFT CONTENT */}
//             <div className="col-md-6 text-center text-md-start mb-5 mb-md-0">
//               <h1 style={{ fontWeight: "800", letterSpacing: "1px" }}>
//                 {slug?.toUpperCase()}
//               </h1>

//               <p
//                 style={{
//                   maxWidth: "520px",
//                   marginTop: "18px",
//                   lineHeight: "1.8",
//                   opacity: 0.95,
//                 }}
//               >
//                 {settings.description}
//               </p>

             
//             </div>

//             {/* RIGHT LOGO */}
//             <div className="col-md-6 text-center">
//               {settings.logo && (
//                 <div
//                   style={{
//                     background: "#ffffff",
//                     padding: "35px",
//                     borderRadius: "22px",
//                     display: "inline-block",
//                     boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
//                   }}
//                 >
//                   <img
//                     src={settings.logo}
//                     alt="logo"
//                     style={{
//                       width: "260px",
//                       maxWidth: "100%",
//                       objectFit: "contain",
//                     }}
//                   />
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* ================= PLANS SECTION ================= */}
//       <div className="container py-5">
//         <h2 className="text-center mb-4 fw-bold">
//           Membership Plans
//         </h2>

//         {plans.length === 0 ? (
//           <p className="text-center text-muted">
//             No plans available
//           </p>
//         ) : (
//           <div className="row">
//             {plans.map((plan) => (
//               <div className="col-md-4 mb-4" key={plan.id}>
//                 <div
//                   className="card h-100 shadow-sm"
//                   style={{ borderRadius: "14px" }}
//                 >
//                   <div className="card-body text-center">
//                     <h4 className="fw-bold">{plan.name}</h4>

//                     <span
//                       className="badge mb-3"
//                       style={{
//                         background: "#002d4d",
//                         color: "#fff",
//                         padding: "6px 14px",
//                       }}
//                     >
//                       {plan.type}
//                     </span>

//                     <h2 className="my-3">
//                       ₹{plan.price}
//                       <small className="text-muted fs-6"> / plan</small>
//                     </h2>

//                     <ul className="list-unstyled text-muted mb-4">
//                       <li>📅 Validity: {plan.validityDays} days</li>
//                       <li>🏋️ Sessions: {plan.sessions}</li>
//                     </ul>

//                     <button
//                       className="btn w-100"
//                       style={{
//                         background: "#002d4d",
//                         color: "#fff",
//                         borderRadius: "8px",
//                       }}
//                     >
//                       Choose Plan
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//   <Modal show={showPaymentModal} onHide={() => {
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
//                     <strong>Plan:</strong> {selectedPlan?.name} ({selectedPlan?.type === 'personal' ? 'Personal' : 'Group'})
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
//     </div>
//   );
// };

// export default DynamicPage;



import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../Api/axiosInstance";
import { Container, Row, Col, Button, Card, Modal, Form, Table, Spinner, Alert } from 'react-bootstrap';

const DynamicPage = () => {
  const { slug, adminId } = useParams();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({ upi: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null); // 'pending', 'success', 'error'
  
  // जो variables undefined हैं, उन्हें state में ले लें
  const [memberId, setMemberId] = useState(null); // ये आपको किसी auth context से मिलना चाहिए
  const [branchId, setBranchId] = useState(null); // ये settings से आ सकता है

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // 1️⃣ Fetch App Settings
        const settingsRes = await axiosInstance.get(
          `/adminSettings/app-settings/admin/${adminId}`
        );

        const appSettings = settingsRes.data?.data;
        if (!appSettings) {
          setLoading(false);
          return;
        }

        const apiSlug = appSettings.url;

        // 2️⃣ Fix URL if slug missing / wrong
        if (!slug || slug !== apiSlug) {
          navigate(`/${apiSlug}/${adminId}`, { replace: true });
          return;
        }

        setSettings(appSettings);
        
        // Branch ID settings से set करें (अगर available हो)
        if (appSettings.branchId) {
          setBranchId(appSettings.branchId);
        }

        // 3️⃣ Fetch Plans
        const plansRes = await axiosInstance.get(
          `/MemberPlan?adminId=${adminId}`
        );

        setPlans(plansRes.data?.plans || []);
        
        // 4️⃣ Fetch current user/member data (अगर authenticated हो)
        // ये part आपको अपने authentication system के according implement करना होगा
        // fetchCurrentUser();
        
      } catch (err) {
        console.error("Dynamic page error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug, adminId, navigate]);

  // Choose Plan button handler
  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setBookingMessage('');
    setBookingStatus(null);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const upi = paymentDetails.upi.trim();


    const price =
  selectedPlan.numericPrice ??
  (typeof selectedPlan.price === 'string'
    ? selectedPlan.price.replace(/[^\d.]/g, '')
    : selectedPlan.price);
    if (!upi) {
      setBookingMessage('Please enter a valid UPI ID.');
      return;
    }

    // Temporary memberId - ये आपको actual authentication से लेना होगा
    const tempMemberId = memberId || "temp-member-id";
    
    if (!tempMemberId || !adminId || !selectedPlan) {
      setBookingMessage('Missing user or plan details. Please log in again.');
      return;
    }

    setBookingStatus('pending');
    setBookingMessage('');

    try {
     const payload = {
  memberId: tempMemberId,
  classId: selectedPlan.id,
  branchId: branchId || settings?.branchId || "default-branch",
  adminId: adminId,
  price: price, // ✅ FIXED
  upiId: upi,
  planId: selectedPlan.id,
};

      console.log('Booking payload:', payload);

      // Only call booking/create API
      const response = await axiosInstance.post('booking/create', payload);
      console.log('Booking response:', response.data);

      if (response.data.success) {
        setBookingStatus('success');
        setBookingMessage(response.data.message || 'Booking request sent to admin.');
        
        // Auto close modal after success
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentDetails({ upi: '' });
          setSelectedPlan(null);
        }, 2000);
        
      } else {
        const errorMsg = response.data.message || 'Booking failed. Please try again.';
        setBookingMessage(errorMsg);
        setBookingStatus('error');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setBookingStatus('error');
      setBookingMessage(err.response?.data?.message || 'Failed to create booking. Please try again or contact support.');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h4>Loading page...</h4>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center mt-5">
        {/* <h3>Page Not Found</h3> */}
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa"}}>
      
      {/* ================= HERO SECTION ================= */}
      <div
        style={{
          background: "linear-gradient(135deg, #002d4d, #004b80)",
          color: "#fff",
          padding: "90px 20px",
        }}
      >
        <div className="container">
          <div className="row align-items-center">

            {/* LEFT CONTENT */}
            <div className="col-md-6 text-center text-md-start mb-5 mb-md-0">
              <h1 style={{ fontWeight: "800", letterSpacing: "1px" }}>
                {slug?.toUpperCase()}
              </h1>

              <p
                style={{
                  maxWidth: "520px",
                  marginTop: "18px",
                  lineHeight: "1.8",
                  opacity: 0.95,
                }}
              >
                {settings.description}
              </p>

            </div>

            {/* RIGHT LOGO */}
            <div className="col-md-6 text-center">
              {settings.logo && (
                <div
                  style={{
                    background: "#ffffff",
                    padding: "35px",
                    borderRadius: "22px",
                    display: "inline-block",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
                  }}
                >
                  <img
                    src={settings.logo}
                    alt="logo"
                    style={{
                      width: "260px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ================= PLANS SECTION ================= */}
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold">
          Membership Plans
        </h2>

        {plans.length === 0 ? (
          <p className="text-center text-muted">
            No plans available
          </p>
        ) : (
          <div className="row">
            {plans.map((plan) => (
              <div className="col-md-4 mb-4" key={plan.id}>
                <div
                  className="card h-100 shadow-sm"
                  style={{ borderRadius: "14px" }}
                >
                  <div className="card-body text-center">
                    <h4 className="fw-bold">{plan.name}</h4>

                    <span
                      className="badge mb-3"
                      style={{
                        background: "#002d4d",
                        color: "#fff",
                        padding: "6px 14px",
                      }}
                    >
                      {plan.type}
                    </span>

                    <h2 className="my-3">
                      ₹{plan.price}
                      <small className="text-muted fs-6"> / plan</small>
                    </h2>

                    <ul className="list-unstyled text-muted mb-4">
                      <li>📅 Validity: {plan.validityDays} days</li>
                      <li>🏋️ Sessions: {plan.sessions}</li>
                    </ul>

                    <button
                      className="btn w-100"
                      style={{
                        background: "#002d4d",
                        color: "#fff",
                        borderRadius: "8px",
                      }}
                      onClick={() => handleChoosePlan(plan)}
                    >
                      Choose Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= PAYMENT MODAL ================= */}
      <Modal 
        show={showPaymentModal} 
        onHide={() => {
          setShowPaymentModal(false);
          setBookingMessage('');
          setBookingStatus(null);
        }} 
        centered 
        size="md"
      >
        <Modal.Header 
          closeButton 
          style={{ backgroundColor: '#f8f9fa', borderBottom: '3px solid #2f6a87' }}
        >
          <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.2rem' }}>
            Complete Payment
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {bookingStatus === 'pending' ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 fw-bold" style={{ color: '#333', fontSize: '1.1rem' }}>
                Processing your booking...
              </p>
            </div>
          ) : (
            <Form onSubmit={handlePaymentSubmit}>
              <div 
                className="text-center mb-3 p-3 rounded" 
                style={{ 
                  backgroundColor: '#f0f7fa', 
                  border: '2px dashed #2f6a87', 
                  borderRadius: '12px' 
                }}
              >
                <h5 className="mb-2" style={{ color: '#333', fontSize: '1.1rem' }}>
                  Booking Details
                </h5>
                <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                  <strong>Plan:</strong> {selectedPlan?.name} ({selectedPlan?.type})
                </p>
                <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                  <strong>Validity:</strong> {selectedPlan?.validityDays} days
                </p>
                <p className="mb-0">
                  <strong>Amount:</strong> 
                  <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#2f6a87' }}>
                    ₹{selectedPlan?.price}
                  </span>
                </p>
              </div>

              {bookingMessage && (
                <Alert 
                  variant={
                    bookingStatus === 'error' ? 'danger' : 
                    bookingStatus === 'success' ? 'success' : 'info'
                  } 
                  className="mb-3"
                >
                  {bookingMessage}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#333', fontWeight: '600', fontSize: '1rem' }}>
                  UPI ID
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="yourname@upi"
                  value={paymentDetails.upi}
                  onChange={(e) => setPaymentDetails({ upi: e.target.value })}
                  required
                  disabled={bookingStatus === 'success'}
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
                  disabled={bookingStatus === 'pending' || bookingStatus === 'success'}
                  style={{
                    backgroundColor: bookingStatus === 'success' ? '#28a745' : '#2f6a87',
                    borderColor: bookingStatus === 'success' ? '#28a745' : '#2f6a87',
                    fontSize: '1.1rem',
                    transition: 'background-color 0.3s ease',
                    padding: '10px 20px',
                    maxWidth: '400px'
                  }}
                >
                  {bookingStatus === 'pending' ? 'Processing...' : 
                   bookingStatus === 'success' ? 'Booking Successful!' : 
                   'Confirm Booking'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DynamicPage;