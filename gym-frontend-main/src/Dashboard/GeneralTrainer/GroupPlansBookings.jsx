import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Table, Button, Modal, Badge, Form, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaCalendar, FaClock, FaUsers, FaRupeeSign, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaFilter } from 'react-icons/fa';
import BaseUrl from '../../Api/BaseUrl';

const GroupPlansBookings = () => {
  const [selectedPlanTab, setSelectedPlanTab] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupPlans, setGroupPlans] = useState([]);
  const [planCustomers, setPlanCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'members'

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const branchId = userData.branchId || 1; // Default to 1 if not found

  // Fetch group plans data from API
  useEffect(() => {
    const fetchGroupPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BaseUrl}/generaltrainer/${branchId}/group-plans`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Transform API data to match component structure
          const transformedPlans = data.data.map(plan => ({
            id: plan.planId,
            name: plan.planName,
            sessions: plan.sessions,
            validity: plan.validityDays,
            price: plan.price.toString(),
            description: "Group training plan"
          }));
          
          setGroupPlans(transformedPlans);
          
          // Transform members data to match component structure
          const transformedCustomers = {};
          data.data.forEach(plan => {
            transformedCustomers[plan.planId] = plan.members.map(member => ({
              id: member.id,
              name: member.name,
              purchaseDate: member.purchaseDate,
              expiryDate: member.expiryDate,
              sessionsBooked: member.sessionsBooked,
              sessionsRemaining: member.sessionsRemaining,
              contact: member.contact,
              email: member.email
            }));
          });
          
          setPlanCustomers(transformedCustomers);
        } else {
          setError('Failed to fetch group plans data');
        }
      } catch (err) {
        setError(`Error fetching data: ${err.message}`);
        console.error('Error fetching group plans:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupPlans();
  }, [branchId]);

  // Fetch members data from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        const response = await fetch(`${BaseUrl}/generaltrainer/branch/${branchId}/members`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setMembers(data.data);
        } else {
          setMembersError('Failed to fetch members data');
        }
      } catch (err) {
        setMembersError(`Error fetching members: ${err.message}`);
        console.error('Error fetching members:', err);
      } finally {
        setMembersLoading(false);
      }
    };
    
    if (activeTab === 'members') {
      fetchMembers();
    }
  }, [branchId, activeTab]);

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

  // Handle view member details
  const handleViewMember = (member) => {
    // Transform member data to match customer structure for the modal
    const transformedMember = {
      id: member.id,
      name: member.fullName,
      email: member.email,
      contact: member.phone,
      purchaseDate: member.membershipFrom,
      expiryDate: member.membershipTo,
      sessionsBooked: member.attendanceCount,
      sessionsRemaining: member.bookingCount - member.attendanceCount,
      status: member.status,
      planName: member.planName,
      planDuration: member.planDuration,
      planPrice: member.planPrice,
      paymentMode: member.paymentMode,
      amountPaid: member.amountPaid,
      gender: member.gender,
      dateOfBirth: member.dateOfBirth,
      interestedIn: member.interestedIn,
      address: member.address,
      joinDate: member.joinDate
    };
    
    setSelectedCustomer(transformedMember);
    setShowCustomerModal(true);
  };

  // Get status indicator
  const getStatusIndicator = (status, sessionsRemaining, expiryDate) => {
    // If status is explicitly provided, use it
    if (status) {
      if (status === 'Active') {
        return <Badge bg="success"><FaCheckCircle className="me-1" />Active</Badge>;
      } else if (status === 'Expired') {
        return <Badge bg="danger"><FaExclamationCircle className="me-1" />Expired</Badge>;
      } else if (status === 'Completed') {
        return <Badge bg="secondary"><FaTimesCircle className="me-1" />Completed</Badge>;
      }
    }
    
    // Otherwise, calculate status from sessions and expiry date
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
          {getStatusIndicator(customer.status, customer.sessionsRemaining, customer.expiryDate)}
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

  // Mobile member card view
  const MobileMemberCard = ({ member, index }) => (
    <Card className="mb-3 border shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
              {index + 1}
            </div>
            <h5 className="mb-0 fw-bold" style={{ color: '#2f6a87' }}>{member.fullName}</h5>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleViewMember(member)}
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
          {getStatusIndicator(member.status)}
        </div>
        
        <div className="row g-2">
          <div className="col-6">
            <small className="text-muted d-block">Plan</small>
            <span className="small">{member.planName}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Duration</small>
            <span className="small">{member.planDuration}</span>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Join Date</small>
            <div className="d-flex align-items-center">
              <FaCalendar size={12} className="text-muted me-1" />
              <span className="small">{member.joinDate}</span>
            </div>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Email</small>
            <span className="small text-truncate">{member.email}</span>
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
            Group Training Plans & Members
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

        {/* Tab Navigation */}
        <Nav variant="tabs" className="mb-4" style={{ borderColor: '#2f6a87' }}>
          <Nav.Item>
            <Nav.Link 
              className="fs-6 px-4 py-3 fw-medium"
              style={{ 
                color: activeTab === 'plans' ? '#2f6a87' : '#6c757d',
                borderColor: activeTab === 'plans' ? '#2f6a87' : 'transparent',
                backgroundColor: activeTab === 'plans' ? '#f8f9fa' : 'transparent'
              }}
              onClick={() => setActiveTab('plans')}
            >
              Group Plans
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              className="fs-6 px-4 py-3 fw-medium"
              style={{ 
                color: activeTab === 'members' ? '#2f6a87' : '#6c757d',
                borderColor: activeTab === 'members' ? '#2f6a87' : 'transparent',
                backgroundColor: activeTab === 'members' ? '#f8f9fa' : 'transparent'
              }}
              onClick={() => setActiveTab('members')}
            >
              All Members
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Loading State */}
        {loading && activeTab === 'plans' && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" role="status" style={{ color: '#2f6a87' }}>
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {/* Members Loading State */}
        {membersLoading && activeTab === 'members' && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" role="status" style={{ color: '#2f6a87' }}>
              <span className="visually-hidden">Loading members...</span>
            </Spinner>
          </div>
        )}

        {/* Error State */}
        {error && activeTab === 'plans' && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Members Error State */}
        {membersError && activeTab === 'members' && (
          <Alert variant="danger" className="mb-4">
            {membersError}
          </Alert>
        )}

        {/* Plans as Cards - Optimized Version */}
        {!loading && !error && activeTab === 'plans' && (
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
        )}

        {/* Members Table - Desktop View */}
        {!membersLoading && !membersError && activeTab === 'members' && (
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
                    All Members ({members.length})
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body>
              <div className="mb-4 p-3 bg-light rounded" style={{ borderLeft: '4px solid #2f6a87' }}>
                <h5 className="fw-bold mb-2" style={{ color: '#2f6a87' }}>
                  Branch Members
                </h5>
                <div className="d-flex flex-wrap gap-3 gap-md-4 text-muted">
                  <div className="d-flex align-items-center gap-2">
                    <FaUsers size={16} />
                    <span>{members.length} Total Members</span>
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
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Email</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Phone</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Plan</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Join Date</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Status</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <div className="text-muted">No members found.</div>
                        </td>
                      </tr>
                    ) : (
                      members.map((member, index) => (
                        <tr key={member.id}>
                          <td className="py-3 fw-bold">{index + 1}</td>
                          <td className="py-3">
                            <strong style={{ color: '#2f6a87' }}>{member.fullName}</strong>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaEnvelope size={14} className="text-muted" />
                              <span>{member.email}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaPhone size={14} className="text-muted" />
                              <span>{member.phone}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="fw-medium">{member.planName}</div>
                              <small className="text-muted">{member.planDuration}</small>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendar size={14} className="text-muted" />
                              <span>{member.joinDate}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            {getStatusIndicator(member.status)}
                          </td>
                          <td className="py-3">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewMember(member)}
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
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
              
              {/* Mobile Card View */}
              <div className="d-md-none">
                {members.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="text-muted">No members found.</div>
                  </div>
                ) : (
                  members.map((member, index) => (
                    <MobileMemberCard key={member.id} member={member} index={index} />
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Customer Details Tabs */}
        {selectedPlanTab && !loading && !error && activeTab === 'plans' && (
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
                            {getStatusIndicator(customer.status, customer.sessionsRemaining, customer.expiryDate)}
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
               {selectedCustomer?.planName ? 'Member Details' : 'Customer Details'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 p-md-4">
            {selectedCustomer && (
              <div>
                <div className="mb-3">
                  <h5 className="fw-bold mb-2" style={{ color: '#2f6a87', fontSize: '1.3rem' }}>{selectedCustomer.name}</h5>
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-muted me-2">Status:</span>
                    {getStatusIndicator(selectedCustomer.status, selectedCustomer.sessionsRemaining, selectedCustomer.expiryDate)}
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
                
                {selectedCustomer.planName && (
                  <div className="row mb-3">
                    <div className="col-12 col-md-6 mb-3 mb-md-0">
                      <div className="mb-2">
                        <small className="text-muted d-block">Plan</small>
                        <span>{selectedCustomer.planName}</span>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="mb-2">
                        <small className="text-muted d-block">Duration</small>
                        <span>{selectedCustomer.planDuration}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="row mb-3">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <div className="mb-2">
                      <small className="text-muted d-block">Purchase Date</small>
                      <div className="d-flex align-items-center">
                        <FaCalendar size={14} className="text-muted me-2" />
                        <span>{selectedCustomer.purchaseDate || selectedCustomer.joinDate}</span>
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
                
                {selectedCustomer.paymentMode && (
                  <div className="row mb-3">
                    <div className="col-12 col-md-6 mb-3 mb-md-0">
                      <div className="mb-2">
                        <small className="text-muted d-block">Payment Mode</small>
                        <span>{selectedCustomer.paymentMode}</span>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="mb-2">
                        <small className="text-muted d-block">Amount Paid</small>
                        <span>${selectedCustomer.amountPaid}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedCustomer.sessionsBooked !== undefined && (
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
                )}
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