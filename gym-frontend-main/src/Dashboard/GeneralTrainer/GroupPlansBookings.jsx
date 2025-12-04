import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Table, Button, Modal, Badge, Form, Dropdown } from 'react-bootstrap';
import { FaEye, FaCalendar, FaClock, FaUsers, FaRupeeSign, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaFilter } from 'react-icons/fa';

const GroupPlansBookings = () => {
  const [selectedPlanTab, setSelectedPlanTab] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Group Training Plans (Read-only, comes from admin)
  const groupPlans = [
    { id: 1, name: "Starter Group Class", sessions: 8, validity: 30, price: "2,499", description: "Perfect for beginners" },
    { id: 2, name: "Pro Group Class", sessions: 16, validity: 60, price: "4,499", description: "For intermediate users" },
    { id: 3, name: "Unlimited Group Access", sessions: 30, validity: 90, price: "7,999", description: "Best value for dedicated users" },
  ];

  // Mock customer data for each group plan
  const planCustomers = {
    1: [ // Starter Group Class
      {
        id: 201,
        name: "Rahul Sharma",
        purchaseDate: "2025-05-15",
        expiryDate: "2025-06-14",
        sessionsBooked: 3,
        sessionsRemaining: 5,
        contact: "+91 98765 43210",
        email: "rahul.sharma@email.com"
      },
      {
        id: 202,
        name: "Priya Mehta",
        purchaseDate: "2025-05-10",
        expiryDate: "2025-06-09",
        sessionsBooked: 6,
        sessionsRemaining: 2,
        contact: "+91 98765 43211",
        email: "priya.mehta@email.com"
      },
      {
        id: 203,
        name: "Amit Kumar",
        purchaseDate: "2025-05-05",
        expiryDate: "2025-06-04",
        sessionsBooked: 4,
        sessionsRemaining: 4,
        contact: "+91 98765 43212",
        email: "amit.kumar@email.com"
      }
    ],
    2: [ // Pro Group Class
      {
        id: 204,
        name: "Neha Gupta",
        purchaseDate: "2025-05-20",
        expiryDate: "2025-07-19",
        sessionsBooked: 7,
        sessionsRemaining: 9,
        contact: "+91 98765 43213",
        email: "neha.gupta@email.com"
      },
      {
        id: 205,
        name: "Vikram Singh",
        purchaseDate: "2025-05-12",
        expiryDate: "2025-07-11",
        sessionsBooked: 12,
        sessionsRemaining: 4,
        contact: "+91 98765 43214",
        email: "vikram.singh@email.com"
      }
    ],
    3: [ // Unlimited Group Access
      {
        id: 206,
        name: "Anjali Patel",
        purchaseDate: "2025-05-25",
        expiryDate: "2025-08-23",
        sessionsBooked: 10,
        sessionsRemaining: 20,
        contact: "+91 98765 43215",
        email: "anjali.patel@email.com"
      },
      {
        id: 207,
        name: "Rajesh Verma",
        purchaseDate: "2025-05-18",
        expiryDate: "2025-08-16",
        sessionsBooked: 15,
        sessionsRemaining: 15,
        contact: "+91 98765 43216",
        email: "rajesh.verma@email.com"
      },
      {
        id: 208,
        name: "Sneha Reddy",
        purchaseDate: "2025-05-01",
        expiryDate: "2025-07-30",
        sessionsBooked: 25,
        sessionsRemaining: 5,
        contact: "+91 98765 43217",
        email: "sneha.reddy@email.com"
      }
    ]
  };

  // Get customers for selected plan
  const getCustomersForPlan = (planId) => {
    let customers = planCustomers[planId] || [];
    
    // Apply date filter
    if (dateFilter) {
      customers = customers.filter(customer => {
        const purchaseDate = new Date(customer.purchaseDate);
        const filterDate = new Date(dateFilter);
        return purchaseDate.toDateString() === filterDate.toDateString();
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      customers = customers.filter(customer => {
        const today = new Date();
        const expiryDate = new Date(customer.expiryDate);
        
        if (statusFilter === 'active') {
          return customer.sessionsRemaining > 0 && expiryDate >= today;
        } else if (statusFilter === 'expired') {
          return expiryDate < today;
        } else if (statusFilter === 'completed') {
          return customer.sessionsRemaining === 0;
        }
        return true;
      });
    }
    
    return customers;
  };

  // Handle view customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  // Get status indicator
  const getStatusIndicator = (sessionsRemaining, expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (sessionsRemaining === 0) {
      return <Badge bg="secondary"><FaTimesCircle className="me-1" />Sessions Completed</Badge>;
    }
    
    if (expiry < today) {
      return <Badge bg="danger"><FaExclamationCircle className="me-1" />Expired</Badge>;
    }
    
    return <Badge bg="success"><FaCheckCircle className="me-1" />Active</Badge>;
  };

  // Calculate session progress percentage
  const getProgressPercentage = (sessionsBooked, sessionsRemaining) => {
    const totalSessions = sessionsBooked + sessionsRemaining;
    return totalSessions > 0 ? Math.round((sessionsBooked / totalSessions) * 100) : 0;
  };

  // Reset filters
  const resetFilters = () => {
    setDateFilter('');
    setStatusFilter('all');
  };

  // Mobile customer card view
  const MobileCustomerCard = ({ customer, index }) => (
    <Card className="mb-3 border shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
              {index + 1}
            </div>
            <h5 className="mb-0 fw-bold" style={{ color: '#2f6a87' }}>{customer.name}</h5>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleViewCustomer(customer)}
            style={{
              borderColor: '#2f6a87',
              color: '#2f6a87',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0'
            }}
          >
            <FaEye size={14} />
          </Button>
        </div>
        
        <div className="mb-2">
          {getStatusIndicator(customer.sessionsRemaining, customer.expiryDate)}
        </div>
        
        <div className="row g-2">
          <div className="col-6">
            <small className="text-muted d-block">Purchase Date</small>
            <div className="d-flex align-items-center">
              <FaCalendar size={12} className="text-muted me-1" />
              <span className="small">{customer.purchaseDate}</span>
            </div>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Expiry Date</small>
            <div className="d-flex align-items-center">
              <FaCalendar size={12} className="text-muted me-1" />
              <span className="small">{customer.expiryDate}</span>
            </div>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Sessions Booked</small>
            <span className="badge bg-primary" style={{ backgroundColor: '#2f6a87' }}>
              {customer.sessionsBooked}
            </span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Sessions Remaining</small>
            <span className="badge bg-success">
              {customer.sessionsRemaining}
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="bg-light min-vh-100">
      <Container fluid className="py-3 py-md-4 px-md-5 px-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
          <h1 className="fw-bold mb-3 mb-md-0 text-center" style={{ color: '#2f6a87', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)' }}>
            Group Training Plans & Bookings
          </h1>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
            <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
              <Form.Control
                type="date"
                size="sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ width: '150px' }}
              />
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm" id="status-filter-dropdown" className="w-100">
                  <FaFilter className="me-1" />
                  {statusFilter === 'all' ? 'All Status' : 
                   statusFilter === 'active' ? 'Active' :
                   statusFilter === 'expired' ? 'Expired' : 'Completed'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setStatusFilter('all')}>All Status</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('active')}>Active</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('expired')}>Expired</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter('completed')}>Completed</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Plans as Cards - Optimized Version */}
        <div className="mb-5">
          <Row className="g-3 g-md-4">
            {groupPlans.map((plan) => (
              <Col xs={12} sm={6} lg={4} key={plan.id}>
                <Card 
                  className="h-100 shadow-sm border-0 plan-card"
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    border: selectedPlanTab === plan.id ? '2px solid #2f6a87' : '1px solid #e9ecef'
                  }}
                  onClick={() => setSelectedPlanTab(plan.id)}
                >
                  <div style={{ 
                    height: '8px', 
                    backgroundColor: '#2f6a87',
                    width: '100%'
                  }}></div>
                  <Card.Body className="d-flex flex-column p-3">
                    <div className="text-center mb-3">
                      <div className="badge mb-2 px-3 py-1" style={{ 
                        backgroundColor: '#2f6a87', 
                        color: 'white', 
                        fontSize: '0.75rem',
                        borderRadius: '50px'
                      }}>
                        GROUP CLASS
                      </div>
                      <h5 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: '1.1rem' }}>{plan.name}</h5>
                      <p className="text-muted small mb-2">{plan.description}</p>
                    </div>
                    <ul className="list-unstyled mb-3 flex-grow-1">
                      <li className="mb-2 d-flex align-items-center gap-2">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <FaClock size={12} className="text-muted" />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{plan.sessions} Sessions</div>
                        </div>
                      </li>
                      <li className="mb-2 d-flex align-items-center gap-2">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <FaCalendar size={12} className="text-muted" />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{plan.validity} Days</div>
                        </div>
                      </li>
                      <li className="mb-2 d-flex align-items-center gap-2">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <FaUsers size={12} className="text-muted" />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ fontSize: '0.9rem' }}>
                            {getCustomersForPlan(plan.id).length} Member{getCustomersForPlan(plan.id).length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </li>
                      <li className="mb-2 d-flex align-items-center gap-2">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <FaRupeeSign size={12} className="text-muted" />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{plan.price}</div>
                        </div>
                      </li>
                    </ul>
                    <div className="text-center mt-auto">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanTab(plan.id);
                        }}
                        style={{
                          borderColor: '#2f6a87',
                          color: '#2f6a87',
                          transition: 'all 0.2s ease'
                        }}
                        className="w-100"
                      >
                        View Members
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Customer Details Tabs */}
        {selectedPlanTab && (
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <Card.Header className="bg-white border-0 pb-0">
              <Nav variant="tabs" className="border-bottom" style={{ borderColor: '#2f6a87' }}>
                <Nav.Item>
                  <Nav.Link 
                    className="fs-6 px-4 py-3 fw-medium"
                    style={{ 
                      color: '#2f6a87',
                      borderColor: '#2f6a87',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    {groupPlans.find(p => p.id === selectedPlanTab)?.name} Members
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body>
              <div className="mb-4 p-3 bg-light rounded" style={{ borderLeft: '4px solid #2f6a87' }}>
                <h5 className="fw-bold mb-2" style={{ color: '#2f6a87' }}>
                  {groupPlans.find(p => p.id === selectedPlanTab)?.name}
                </h5>
                <div className="d-flex flex-wrap gap-3 gap-md-4 text-muted">
                  <div className="d-flex align-items-center gap-2">
                    <FaClock size={16} />
                    <span>{groupPlans.find(p => p.id === selectedPlanTab)?.sessions} Total Sessions</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FaCalendar size={16} />
                    <span>{groupPlans.find(p => p.id === selectedPlanTab)?.validity} Days Validity</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FaUsers size={16} />
                    <span>{getCustomersForPlan(selectedPlanTab).length} Members</span>
                  </div>
                </div>
              </div>
              
              {/* Members Table - Desktop View */}
              <div className="d-none d-md-block table-responsive">
                <Table hover responsive className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>#</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Member Name</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Purchase Date</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Expiry Date</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Sessions Booked</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Sessions Remaining</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Status</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const customers = getCustomersForPlan(selectedPlanTab);
                      
                      if (customers.length === 0) {
                        return (
                          <tr>
                            <td colSpan="8" className="text-center py-5">
                              <div className="text-muted">No members found matching the current filters.</div>
                            </td>
                          </tr>
                        );
                      }
                      
                      return customers.map((customer, index) => (
                        <tr key={customer.id}>
                          <td className="py-3 fw-bold">{index + 1}</td>
                          <td className="py-3">
                            <strong style={{ color: '#2f6a87' }}>{customer.name}</strong>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendar size={14} className="text-muted" />
                              <span>{customer.purchaseDate}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendar size={14} className="text-muted" />
                              <span>{customer.expiryDate}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-primary" style={{ backgroundColor: '#2f6a87', color: 'white' }}>
                              {customer.sessionsBooked}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-success">
                              {customer.sessionsRemaining}
                            </span>
                          </td>
                          <td className="py-3">
                            {getStatusIndicator(customer.sessionsRemaining, customer.expiryDate)}
                          </td>
                          <td className="py-3">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              style={{
                                borderColor: '#2f6a87',
                                color: '#2f6a87',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0'
                              }}
                            >
                              <FaEye size={16} />
                            </Button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </Table>
              </div>
              
              {/* Mobile Card View */}
              <div className="d-md-none">
                {(() => {
                  const customers = getCustomersForPlan(selectedPlanTab);
                  
                  if (customers.length === 0) {
                    return (
                      <div className="text-center py-5">
                        <div className="text-muted">No members found matching the current filters.</div>
                      </div>
                    );
                  }
                  
                  return customers.map((customer, index) => (
                    <MobileCustomerCard key={customer.id} customer={customer} index={index} />
                  ));
                })()}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Member Details Modal - Responsive Version */}
        <Modal 
          show={showCustomerModal} 
          onHide={() => setShowCustomerModal(false)} 
          centered
          size="lg"
          fullscreen="sm-down"
        >
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.2rem' }}>
               Member Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            {selectedCustomer && (
              <div>
                <div className="mb-3">
                  <h5 className="fw-bold mb-2" style={{ color: '#2f6a87', fontSize: '1.3rem' }}>{selectedCustomer.name}</h5>
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-muted me-2">Status:</span>
                    {getStatusIndicator(selectedCustomer.sessionsRemaining, selectedCustomer.expiryDate)}
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <div className="mb-2">
                      <small className="text-muted d-block">Email</small>
                      <div className="d-flex align-items-center">
                        <FaEnvelope size={14} className="text-muted me-2" />
                        <span className="text-break">{selectedCustomer.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-2">
                      <small className="text-muted d-block">Phone</small>
                      <div className="d-flex align-items-center">
                        <FaPhone size={14} className="text-muted me-2" />
                        <span>{selectedCustomer.contact}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <div className="mb-2">
                      <small className="text-muted d-block">Purchase Date</small>
                      <div className="d-flex align-items-center">
                        <FaCalendar size={14} className="text-muted me-2" />
                        <span>{selectedCustomer.purchaseDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="mb-2">
                      <small className="text-muted d-block">Expiry Date</small>
                      <div className="d-flex align-items-center">
                        <FaCalendar size={14} className="text-muted me-2" />
                        <span>{selectedCustomer.expiryDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-top pt-3">
                  <h6 className="fw-bold mb-3" style={{ color: '#2f6a87' }}>Session Details</h6>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="p-2 p-md-3 bg-light rounded">
                        <div className="fw-bold" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>{selectedCustomer.sessionsBooked}</div>
                        <small className="text-muted">Attended</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 p-md-3 bg-light rounded">
                        <div className="fw-bold" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>{selectedCustomer.sessionsRemaining}</div>
                        <small className="text-muted">Remaining</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 p-md-3 bg-light rounded">
                        <div className="fw-bold" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>
                          {selectedCustomer.sessionsBooked + selectedCustomer.sessionsRemaining}
                        </div>
                        <small className="text-muted">Total</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Progress: {getProgressPercentage(selectedCustomer.sessionsBooked, selectedCustomer.sessionsRemaining)}%</small>
                      <small>{selectedCustomer.sessionsBooked}/{selectedCustomer.sessionsBooked + selectedCustomer.sessionsRemaining}</small>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${getProgressPercentage(selectedCustomer.sessionsBooked, selectedCustomer.sessionsRemaining)}%`,
                          backgroundColor: '#2f6a87'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #dee2e6' }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowCustomerModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default GroupPlansBookings;