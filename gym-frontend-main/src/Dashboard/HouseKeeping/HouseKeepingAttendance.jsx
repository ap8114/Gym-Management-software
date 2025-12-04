import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaSearch,
  FaFilter,
  FaUserAlt,
  FaHistory,
  FaFileAlt,
  FaDownload,
  FaCalendarCheck,
  FaCalendarTimes,
  FaEdit,
  FaSave,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Form, 
  Badge, 
  Table,
  Alert,
  InputGroup,
  FormControl,
  Dropdown,
  DropdownButton,
  Modal,
  Pagination,
  Spinner,
  Collapse  // Added this import
} from 'react-bootstrap';

// Mock data for housekeeping staff
const mockStaff = [
  { id: 1, name: "Rajesh Kumar", position: "Senior Housekeeper" },
  { id: 2, name: "Priya Sharma", position: "Housekeeper" },
  { id: 3, name: "Amit Patel", position: "Housekeeper" },
  { id: 4, name: "Sunita Reddy", position: "Senior Housekeeper" },
  { id: 5, name: "Vikram Singh", position: "Housekeeper" },
  { id: 6, name: "Meena Gupta", position: "Supervisor" },
  { id: 7, name: "Rahul Verma", position: "Housekeeper" },
];

// Mock attendance data
const mockAttendance = [
  { 
    id: 1, 
    staffId: 1, 
    date: "2023-06-01", 
    checkIn: "08:45", 
    checkOut: "17:15", 
    status: "present",
    notes: ""
  },
  { 
    id: 2, 
    staffId: 2, 
    date: "2023-06-01", 
    checkIn: "09:15", 
    checkOut: "17:30", 
    status: "late",
    notes: "Traffic delay"
  },
  { 
    id: 3, 
    staffId: 3, 
    date: "2023-06-01", 
    checkIn: "", 
    checkOut: "", 
    status: "absent",
    notes: "Sick leave"
  },
  { 
    id: 4, 
    staffId: 4, 
    date: "2023-06-01", 
    checkIn: "08:50", 
    checkOut: "17:05", 
    status: "present",
    notes: ""
  },
  { 
    id: 5, 
    staffId: 5, 
    date: "2023-06-01", 
    checkIn: "08:55", 
    checkOut: "17:20", 
    status: "present",
    notes: ""
  },
  { 
    id: 6, 
    staffId: 6, 
    date: "2023-06-01", 
    checkIn: "08:40", 
    checkOut: "17:00", 
    status: "present",
    notes: ""
  },
  { 
    id: 7, 
    staffId: 7, 
    date: "2023-06-01", 
    checkIn: "09:30", 
    checkOut: "17:45", 
    status: "late",
    notes: "Personal emergency"
  },
  { 
    id: 8, 
    staffId: 1, 
    date: "2023-05-31", 
    checkIn: "08:50", 
    checkOut: "17:10", 
    status: "present",
    notes: ""
  },
  { 
    id: 9, 
    staffId: 2, 
    date: "2023-05-31", 
    checkIn: "09:05", 
    checkOut: "17:25", 
    status: "late",
    notes: "Bus delay"
  },
  { 
    id: 10, 
    staffId: 3, 
    date: "2023-05-31", 
    checkIn: "08:45", 
    checkOut: "17:15", 
    status: "present",
    notes: ""
  },
];

const HouseKeepingAttendance = () => {
  // State management
  const [attendanceData, setAttendanceData] = useState(mockAttendance);
  const [staffList, setStaffList] = useState(mockStaff);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceForm, setAttendanceForm] = useState({});
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    staffId: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination states for Daily Attendance table
  const [dailyCurrentPage, setDailyCurrentPage] = useState(1);
  const [dailyEntriesPerPage] = useState(5); // Show 5 staff per page

  // Pagination states for Attendance History table
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyEntriesPerPage] = useState(5); // Show 5 records per page

  // Initialize attendance form with all staff
  useEffect(() => {
    const todayAttendance = attendanceData.filter(att => att.date === selectedDate);
    const formState = {};
    
    staffList.forEach(staff => {
      const staffAttendance = todayAttendance.find(att => att.staffId === staff.id);
      formState[staff.id] = {
        status: staffAttendance ? staffAttendance.status : '',
        checkIn: staffAttendance ? staffAttendance.checkIn : '',
        checkOut: staffAttendance ? staffAttendance.checkOut : '',
        notes: staffAttendance ? staffAttendance.notes : ''
      };
    });
    
    setAttendanceForm(formState);
  }, [selectedDate, attendanceData, staffList]);

  // Show alert message
  const showAlertMessage = (message, variant = 'success') => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Handle form input changes
  const handleFormChange = (staffId, field, value) => {
    setAttendanceForm(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value
      }
    }));
  };

  // Calculate work hours
  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '0:00';
    
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);
    
    const totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Validate attendance form
  const validateAttendanceForm = () => {
    let isValid = true;
    let errorMessage = '';
    
    // Check if at least one staff has attendance marked
    const hasMarkedAttendance = Object.values(attendanceForm).some(
      staff => staff.status
    );
    
    if (!hasMarkedAttendance) {
      isValid = false;
      errorMessage = 'Please mark attendance for at least one staff member';
      return { isValid, errorMessage };
    }
    
    // Validate check-in and check-out times
    Object.keys(attendanceForm).forEach(staffId => {
      const staffAttendance = attendanceForm[staffId];
      
      if (staffAttendance.status && staffAttendance.status !== 'absent') {
        if (!staffAttendance.checkIn) {
          isValid = false;
          errorMessage = `Check-in time is required for ${staffList.find(s => s.id === parseInt(staffId))?.name}`;
        }
        
        if (staffAttendance.checkIn && staffAttendance.checkOut) {
          const [inHour, inMinute] = staffAttendance.checkIn.split(':').map(Number);
          const [outHour, outMinute] = staffAttendance.checkOut.split(':').map(Number);
          
          if (inHour > outHour || (inHour === outHour && inMinute >= outMinute)) {
            isValid = false;
            errorMessage = `Check-out time must be after check-in time for ${staffList.find(s => s.id === parseInt(staffId))?.name}`;
          }
        }
      }
    });
    
    return { isValid, errorMessage };
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    const validation = validateAttendanceForm();
    
    if (!validation.isValid) {
      showAlertMessage(validation.errorMessage, 'danger');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Create new attendance records
      const newAttendance = [];
      
      Object.keys(attendanceForm).forEach(staffId => {
        const staffAttendance = attendanceForm[staffId];
        
        // Only add if status is set
        if (staffAttendance.status) {
          // Check if attendance record already exists for this staff and date
          const existingIndex = attendanceData.findIndex(
            att => att.staffId === parseInt(staffId) && att.date === selectedDate
          );
          
          const attendanceRecord = {
            id: existingIndex >= 0 ? attendanceData[existingIndex].id : attendanceData.length + 1,
            staffId: parseInt(staffId),
            date: selectedDate,
            checkIn: staffAttendance.checkIn || '',
            checkOut: staffAttendance.checkOut || '',
            status: staffAttendance.status,
            notes: staffAttendance.notes || ''
          };
          
          if (existingIndex >= 0) {
            // Update existing record
            attendanceData[existingIndex] = attendanceRecord;
          } else {
            // Add new record
            newAttendance.push(attendanceRecord);
          }
        }
      });
      
      // Update state
      setAttendanceData([...attendanceData, ...newAttendance]);
      
      // Show success message
      showAlertMessage('Attendance has been saved successfully!', 'success');
    } catch (error) {
      showAlertMessage('Failed to save attendance. Please try again.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit attendance record
  const handleEditAttendance = (attendance) => {
    setEditingAttendance({...attendance});
    setShowEditModal(true);
  };

  // Save edited attendance
  const handleSaveEdit = async () => {
    if (!editingAttendance) return;
    
    // Validate check-in and check-out times
    if (editingAttendance.status && editingAttendance.status !== 'absent') {
      if (!editingAttendance.checkIn) {
        showAlertMessage('Check-in time is required', 'danger');
        return;
      }
      
      if (editingAttendance.checkIn && editingAttendance.checkOut) {
        const [inHour, inMinute] = editingAttendance.checkIn.split(':').map(Number);
        const [outHour, outMinute] = editingAttendance.checkOut.split(':').map(Number);
        
        if (inHour > outHour || (inHour === outHour && inMinute >= outMinute)) {
          showAlertMessage('Check-out time must be after check-in time', 'danger');
          return;
        }
      }
    }
    
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Update attendance record
      const updatedAttendanceData = attendanceData.map(att => 
        att.id === editingAttendance.id ? editingAttendance : att
      );
      
      setAttendanceData(updatedAttendanceData);
      setShowEditModal(false);
      showAlertMessage('Attendance record updated successfully!', 'success');
    } catch (error) {
      showAlertMessage('Failed to update attendance. Please try again.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  // Export attendance data
  const handleExportAttendance = async () => {
    setIsExporting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // In a real app, this would generate and download a file
      showAlertMessage('Attendance report exported successfully!', 'success');
    } catch (error) {
      showAlertMessage('Failed to export report. Please try again.', 'danger');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter attendance data with search
  const getFilteredAttendance = useMemo(() => {
    return attendanceData.filter(att => {
      // Date filter
      if (filter.startDate && att.date < filter.startDate) return false;
      if (filter.endDate && att.date > filter.endDate) return false;
      
      // Staff filter
      if (filter.staffId && att.staffId !== parseInt(filter.staffId)) return false;
      
      // Status filter
      if (filter.status && att.status !== filter.status) return false;
      
      // Search filter
      if (searchTerm) {
        const staff = staffList.find(s => s.id === att.staffId);
        const searchLower = searchTerm.toLowerCase();
        
        if (
          !staff.name.toLowerCase().includes(searchLower) &&
          !staff.position.toLowerCase().includes(searchLower) &&
          !att.status.toLowerCase().includes(searchLower) &&
          !att.date.includes(searchTerm) &&
          !att.notes.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      
      return true;
    });
  }, [attendanceData, filter, searchTerm, staffList]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format date for form input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge bg="success">Present</Badge>;
      case 'absent':
        return <Badge bg="danger">Absent</Badge>;
      case 'late':
        return <Badge bg="warning">Late</Badge>;
      case 'leave':
        return <Badge bg="info">On Leave</Badge>;
      default:
        return <Badge bg="secondary">Not Marked</Badge>;
    }
  };

  // Show attendance details
  const showAttendanceDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setShowDetailsModal(true);
  };

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const filtered = getFilteredAttendance;
    const total = filtered.length;
    const present = filtered.filter(att => att.status === 'present').length;
    const absent = filtered.filter(att => att.status === 'absent').length;
    const late = filtered.filter(att => att.status === 'late').length;
    const leave = filtered.filter(att => att.status === 'leave').length;
    
    return { total, present, absent, late, leave };
  };

  const stats = getAttendanceStats();

  // Get current staff for daily attendance table
  const indexOfLastDailyStaff = dailyCurrentPage * dailyEntriesPerPage;
  const indexOfFirstDailyStaff = indexOfLastDailyStaff - dailyEntriesPerPage;
  const currentDailyStaff = staffList.slice(indexOfFirstDailyStaff, indexOfLastDailyStaff);
  const totalDailyPages = Math.ceil(staffList.length / dailyEntriesPerPage);

  // Get current attendance records for history table
  const indexOfLastHistoryRecord = historyCurrentPage * historyEntriesPerPage;
  const indexOfFirstHistoryRecord = indexOfLastHistoryRecord - historyEntriesPerPage;
  const currentHistoryRecords = getFilteredAttendance.slice(indexOfFirstHistoryRecord, indexOfLastHistoryRecord);
  const totalHistoryPages = Math.ceil(getFilteredAttendance.length / historyEntriesPerPage);

  // Pagination change handlers
  const paginateDaily = (pageNumber) => setDailyCurrentPage(pageNumber);
  const paginateHistory = (pageNumber) => setHistoryCurrentPage(pageNumber);

  // Reset filters
  const resetFilters = () => {
    setFilter({
      startDate: '',
      endDate: '',
      staffId: '',
      status: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="housekeeping-attendance-container p-2 p-md-4">
      {/* Custom styles for blue color replacement and responsive design */}
      <style>
        {`
          .btn-primary {
            background-color: #6EB2CC !important;
            border-color: #6EB2CC !important;
          }
          .btn-outline-primary {
            color: #6EB2CC !important;
            border-color: #6EB2CC !important;
          }
          .btn-outline-primary:hover {
            background-color: #6EB2CC !important;
            color: white !important;
          }
          .text-primary {
            color: #6EB2CC !important;
          }
          .housekeeping-attendance-container .fa-user-alt {
            color: #6EB2CC !important;
          }
          /* Pagination active item color */
          .pagination .page-item.active .page-link {
            background-color: #6EB2CC !important;
            border-color: #6EB2CC !important;
          }
          .pagination .page-link:hover {
            background-color: #6EB2CC !important;
            color: white !important;
          }
          
          /* Responsive styles */
          .mobile-filter-toggle {
            display: none;
          }
          
          @media (max-width: 768px) {
            .mobile-filter-toggle {
              display: flex !important;
            }
            .desktop-filter {
              display: none !important;
            }
            .table-responsive {
              font-size: 0.85rem;
            }
            .btn-sm {
              padding: 0.25rem 0.4rem;
            }
            .pagination {
              flex-wrap: wrap;
              justify-content: center;
            }
            .stats-card h5 {
              font-size: 0.9rem !important;
            }
            .stats-card h3 {
              font-size: 1.2rem !important;
            }
            .mobile-attendance-form .form-control {
              font-size: 0.85rem;
            }
            .mobile-attendance-form .form-select {
              font-size: 0.85rem;
            }
            .mobile-table-header {
              font-size: 0.8rem;
            }
            .action-buttons-mobile {
              display: flex;
              justify-content: center;
              margin-top: 0.5rem;
            }
            .action-buttons-desktop {
              display: none;
            }
            .date-selector-mobile {
              margin-bottom: 1rem;
            }
          }
          
          @media (min-width: 769px) {
            .action-buttons-mobile {
              display: none;
            }
            .action-buttons-desktop {
              display: flex;
            }
            .date-selector-mobile {
              margin-bottom: 0;
            }
          }
        `}
      </style>

      {/* Alert */}
      {showAlert && (
        <Alert 
          variant={alertVariant} 
          dismissible 
          onClose={() => setShowAlert(false)}
          className="mb-4"
        >
          {alertMessage}
        </Alert>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div className="text-center text-md-start mb-3 mb-md-0">
          <h2 className="mb-0">Housekeeping Attendance</h2>
          <p className="text-muted">Mark and track daily attendance</p>
        </div>
        <div className="d-flex justify-content-center">
          <Button 
            variant="outline-primary" 
            onClick={handleExportAttendance}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Exporting...</span>
              </>
            ) : (
              <>
                <FaDownload className="me-2" /> Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 stats-card">
            <Card.Body className="d-flex align-items-center p-2 p-md-3">
              <div className="me-2 me-md-3">
                <FaUserAlt size={20} style={{ color: '#6EB2CC' }} />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-0 text-truncate">Total Staff</h5>
                <h3 className="mb-0">{staffList.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 stats-card">
            <Card.Body className="d-flex align-items-center p-2 p-md-3">
              <div className="me-2 me-md-3">
                <FaCalendarCheck size={20} className="text-success" />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-0 text-truncate">Present</h5>
                <h3 className="mb-0">{stats.present}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 stats-card">
            <Card.Body className="d-flex align-items-center p-2 p-md-3">
              <div className="me-2 me-md-3">
                <FaCalendarTimes size={20} className="text-danger" />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-0 text-truncate">Absent</h5>
                <h3 className="mb-0">{stats.absent}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3} className="mb-3">
          <Card className="h-100 stats-card">
            <Card.Body className="d-flex align-items-center p-2 p-md-3">
              <div className="me-2 me-md-3">
                <FaClock size={20} className="text-warning" />
              </div>
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-0 text-truncate">Late</h5>
                <h3 className="mb-0">{stats.late}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Mark Daily Attendance Section */}
      <Card className="mb-4">
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <h5 className="mb-2 mb-md-0">Mark Daily Attendance</h5>
          <div className="d-flex flex-column flex-md-row align-items-center date-selector-mobile">
            <Form.Label className="me-2 mb-0">Date:</Form.Label>
            <Form.Control 
              type="date" 
              className="me-2" 
              style={{ width: 'auto' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={formatDateForInput(new Date())}
            />
            <div className="text-muted">
              {formatDate(selectedDate)}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table responsive bordered className="mobile-attendance-form">
              <thead>
                <tr>
                  <th className="mobile-table-header">Staff Name</th>
                  <th className="mobile-table-header">Position</th>
                  <th className="mobile-table-header">Status</th>
                  <th className="mobile-table-header">Check In</th>
                  <th className="mobile-table-header">Check Out</th>
                  <th className="mobile-table-header">Work Hours</th>
                  <th className="mobile-table-header">Notes</th>
                </tr>
              </thead>
              <tbody>
                {currentDailyStaff.map(staff => {
                  const staffAttendance = attendanceForm[staff.id] || {};
                  const workHours = calculateWorkHours(staffAttendance.checkIn, staffAttendance.checkOut);
                  
                  return (
                    <tr key={staff.id}>
                      <td className="text-truncate" style={{ maxWidth: '120px' }}>{staff.name}</td>
                      <td className="text-truncate" style={{ maxWidth: '120px' }}>{staff.position}</td>
                      <td>
                        <Form.Select 
                          size="sm"
                          value={staffAttendance.status || ''}
                          onChange={(e) => handleFormChange(staff.id, 'status', e.target.value)}
                        >
                          <option value="">Select Status</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="leave">On Leave</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control 
                          type="time" 
                          size="sm"
                          value={staffAttendance.checkIn || ''}
                          onChange={(e) => handleFormChange(staff.id, 'checkIn', e.target.value)}
                          disabled={!staffAttendance.status || staffAttendance.status === 'absent'}
                        />
                      </td>
                      <td>
                        <Form.Control 
                          type="time" 
                          size="sm"
                          value={staffAttendance.checkOut || ''}
                          onChange={(e) => handleFormChange(staff.id, 'checkOut', e.target.value)}
                          disabled={!staffAttendance.status || staffAttendance.status === 'absent'}
                        />
                      </td>
                      <td>
                        <div className="form-control-plaintext">
                          {workHours}
                        </div>
                      </td>
                      <td>
                        <Form.Control 
                          type="text" 
                          size="sm"
                          placeholder="Notes"
                          value={staffAttendance.notes || ''}
                          onChange={(e) => handleFormChange(staff.id, 'notes', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination for Daily Attendance Table */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
            <div className="text-center text-md-start mb-2 mb-md-0">
              Showing {indexOfFirstDailyStaff + 1} to {Math.min(indexOfLastDailyStaff, staffList.length)} of {staffList.length} staff
            </div>
            <Pagination className="mb-0 justify-content-center">
              <Pagination.First onClick={() => paginateDaily(1)} disabled={dailyCurrentPage === 1} />
              <Pagination.Prev onClick={() => paginateDaily(dailyCurrentPage - 1)} disabled={dailyCurrentPage === 1} />
              {[...Array(totalDailyPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === dailyCurrentPage}
                  onClick={() => paginateDaily(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => paginateDaily(dailyCurrentPage + 1)} disabled={dailyCurrentPage === totalDailyPages} />
              <Pagination.Last onClick={() => paginateDaily(totalDailyPages)} disabled={dailyCurrentPage === totalDailyPages} />
            </Pagination>
          </div>
          
          <div className="d-flex justify-content-center mt-3">
            <Button 
              variant="primary" 
              onClick={handleSubmitAttendance}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="me-2" /> Save Attendance
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Attendance History Section */}
      <Card>
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="d-flex align-items-center mb-2 mb-md-0">
            <FaHistory className="me-2" size={18} />
            <span className="fw-bold">Attendance History</span>
          </div>
          <div className="d-flex flex-column flex-md-row align-items-center">
            <InputGroup className="me-2 mb-2 mb-md-0" style={{ width: '250px' }}>
              <FormControl 
                placeholder="Search attendance..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-secondary">
                <FaSearch />
              </Button>
            </InputGroup>
            <div className="desktop-filter">
              <DropdownButton variant="outline-secondary" title="Filter">
                <Dropdown.Item onClick={resetFilters}>
                  Clear Filters
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>Quick Filters</Dropdown.Header>
                <Dropdown.Item onClick={() => setFilter({...filter, status: 'present'})}>
                  Present Only
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter({...filter, status: 'absent'})}>
                  Absent Only
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter({...filter, status: 'late'})}>
                  Late Only
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter({...filter, status: 'leave'})}>
                  On Leave Only
                </Dropdown.Item>
              </DropdownButton>
            </div>
            <div className="mobile-filter-toggle">
              <Button 
                variant="outline-secondary" 
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              >
                <FaFilter className="me-2" /> Filters
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filter Controls */}
          <div className="desktop-filter">
            <Row className="mb-3">
              <Col xs={12} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={filter.startDate}
                    onChange={(e) => setFilter({...filter, startDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={filter.endDate}
                    onChange={(e) => setFilter({...filter, endDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Staff</Form.Label>
                  <Form.Select 
                    value={filter.staffId}
                    onChange={(e) => setFilter({...filter, staffId: e.target.value})}
                  >
                    <option value="">All Staff</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select 
                    value={filter.status}
                    onChange={(e) => setFilter({...filter, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="leave">On Leave</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Mobile Filter Menu */}
          <div className="mobile-filter-toggle">
            <Collapse in={mobileFilterOpen}>
              <div className="mb-3">
                <Row>
                  <Col xs={12} className="mb-2">
                    <Form.Label>From Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={filter.startDate}
                      onChange={(e) => setFilter({...filter, startDate: e.target.value})}
                    />
                  </Col>
                  <Col xs={12} className="mb-2">
                    <Form.Label>To Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={filter.endDate}
                      onChange={(e) => setFilter({...filter, endDate: e.target.value})}
                    />
                  </Col>
                  <Col xs={12} className="mb-2">
                    <Form.Label>Staff</Form.Label>
                    <Form.Select 
                      value={filter.staffId}
                      onChange={(e) => setFilter({...filter, staffId: e.target.value})}
                    >
                      <option value="">All Staff</option>
                      {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col xs={12} className="mb-2">
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      value={filter.status}
                      onChange={(e) => setFilter({...filter, status: e.target.value})}
                    >
                      <option value="">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="leave">On Leave</option>
                    </Form.Select>
                  </Col>
                  <Col xs={12} className="mb-2">
                    <div className="d-flex flex-wrap gap-2">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setFilter({...filter, status: 'present'})}
                      >
                        Present Only
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setFilter({...filter, status: 'absent'})}
                      >
                        Absent Only
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setFilter({...filter, status: 'late'})}
                      >
                        Late Only
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setFilter({...filter, status: 'leave'})}
                      >
                        On Leave Only
                      </Button>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={resetFilters}
                    >
                      Clear All Filters
                    </Button>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </div>

          {/* Active Filters Display */}
          {(filter.startDate || filter.endDate || filter.staffId || filter.status || searchTerm) && (
            <div className="mb-3">
              <span className="fw-bold">Active Filters: </span>
              {filter.startDate && <Badge className="me-1">From: {formatDate(filter.startDate)}</Badge>}
              {filter.endDate && <Badge className="me-1">To: {formatDate(filter.endDate)}</Badge>}
              {filter.staffId && (
                <Badge className="me-1">
                  Staff: {staffList.find(s => s.id === parseInt(filter.staffId))?.name}
                </Badge>
              )}
              {filter.status && <Badge className="me-1">Status: {filter.status}</Badge>}
              {searchTerm && <Badge className="me-1">Search: {searchTerm}</Badge>}
              <Button variant="link" size="sm" onClick={resetFilters}>Clear All</Button>
            </div>
          )}

          {/* Attendance Table */}
          <div className="table-responsive">
            <Table responsive bordered>
              <thead>
                <tr>
                  <th className="mobile-table-header">Date</th>
                  <th className="mobile-table-header">Staff Name</th>
                  <th className="mobile-table-header">Position</th>
                  <th className="mobile-table-header">Status</th>
                  <th className="mobile-table-header">Check In</th>
                  <th className="mobile-table-header">Check Out</th>
                  <th className="mobile-table-header">Work Hours</th>
                  <th className="mobile-table-header">Notes</th>
                  <th className="mobile-table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentHistoryRecords.map(attendance => {
                  const staff = staffList.find(s => s.id === attendance.staffId);
                  const workHours = calculateWorkHours(attendance.checkIn, attendance.checkOut);
                  
                  return (
                    <tr key={attendance.id}>
                      <td className="text-truncate" style={{ maxWidth: '100px' }}>{formatDate(attendance.date)}</td>
                      <td className="text-truncate" style={{ maxWidth: '120px' }}>{staff.name}</td>
                      <td className="text-truncate" style={{ maxWidth: '120px' }}>{staff.position}</td>
                      <td>{getStatusBadge(attendance.status)}</td>
                      <td>{attendance.checkIn || '-'}</td>
                      <td>{attendance.checkOut || '-'}</td>
                      <td>{workHours}</td>
                      <td style={{ maxWidth: '150px', wordBreak: 'break-word' }}>
                        {attendance.notes || '-'}
                      </td>
                      <td>
                        <div className="action-buttons-desktop justify-content-center">
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            className="me-1"
                            onClick={() => showAttendanceDetails(attendance)}
                          >
                            <FaFileAlt />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-secondary"
                            onClick={() => handleEditAttendance(attendance)}
                          >
                            <FaEdit />
                          </Button>
                        </div>
                        <div className="action-buttons-mobile">
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            className="me-1"
                            onClick={() => showAttendanceDetails(attendance)}
                          >
                            <FaFileAlt />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-secondary"
                            onClick={() => handleEditAttendance(attendance)}
                          >
                            <FaEdit />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          
          {/* No Results Message */}
          {currentHistoryRecords.length === 0 && (
            <div className="text-center py-4">
              <FaExclamationTriangle size={48} className="text-muted mb-3" />
              <h5>No attendance records found</h5>
              <p className="text-muted">Try adjusting your filters or search terms</p>
            </div>
          )}
          
          {/* Pagination for Attendance History Table */}
          {currentHistoryRecords.length > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
              <div className="text-center text-md-start mb-2 mb-md-0">
                Showing {indexOfFirstHistoryRecord + 1} to {Math.min(indexOfLastHistoryRecord, getFilteredAttendance.length)} of {getFilteredAttendance.length} records
              </div>
              <Pagination className="mb-0 justify-content-center">
                <Pagination.First onClick={() => paginateHistory(1)} disabled={historyCurrentPage === 1} />
                <Pagination.Prev onClick={() => paginateHistory(historyCurrentPage - 1)} disabled={historyCurrentPage === 1} />
                {[...Array(totalHistoryPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === historyCurrentPage}
                    onClick={() => paginateHistory(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => paginateHistory(historyCurrentPage + 1)} disabled={historyCurrentPage === totalHistoryPages} />
                <Pagination.Last onClick={() => paginateHistory(totalHistoryPages)} disabled={historyCurrentPage === totalHistoryPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Attendance Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Attendance Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAttendance && (
            <div>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <p><strong>Date:</strong> {formatDate(selectedAttendance.date)}</p>
                </Col>
                <Col xs={12} md={6}>
                  <p><strong>Status:</strong> {getStatusBadge(selectedAttendance.status)}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <p><strong>Check In:</strong> {selectedAttendance.checkIn || 'Not recorded'}</p>
                </Col>
                <Col xs={12} md={6}>
                  <p><strong>Check Out:</strong> {selectedAttendance.checkOut || 'Not recorded'}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <p><strong>Work Hours:</strong> {calculateWorkHours(selectedAttendance.checkIn, selectedAttendance.checkOut)}</p>
                </Col>
                <Col xs={12} md={6}>
                  <p><strong>Staff:</strong> {staffList.find(s => s.id === selectedAttendance.staffId)?.name}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={12}>
                  <p><strong>Notes:</strong> {selectedAttendance.notes || 'No notes'}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Attendance Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingAttendance && (
            <div>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={editingAttendance.date}
                      onChange={(e) => setEditingAttendance({...editingAttendance, date: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      value={editingAttendance.status}
                      onChange={(e) => setEditingAttendance({...editingAttendance, status: e.target.value})}
                    >
                      <option value="">Select Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="leave">On Leave</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Check In</Form.Label>
                    <Form.Control 
                      type="time" 
                      value={editingAttendance.checkIn}
                      onChange={(e) => setEditingAttendance({...editingAttendance, checkIn: e.target.value})}
                      disabled={!editingAttendance.status || editingAttendance.status === 'absent'}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Check Out</Form.Label>
                    <Form.Control 
                      type="time" 
                      value={editingAttendance.checkOut}
                      onChange={(e) => setEditingAttendance({...editingAttendance, checkOut: e.target.value})}
                      disabled={!editingAttendance.status || editingAttendance.status === 'absent'}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control 
                      as="textarea"
                      rows={3}
                      value={editingAttendance.notes}
                      onChange={(e) => setEditingAttendance({...editingAttendance, notes: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveEdit}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Saving...</span>
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Save Changes
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HouseKeepingAttendance;