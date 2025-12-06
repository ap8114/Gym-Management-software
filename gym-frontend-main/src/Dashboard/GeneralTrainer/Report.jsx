import React, { useState, useEffect } from "react";
import { Row, Col, Card, ProgressBar } from "react-bootstrap";
import { FaUsers, FaChartBar, FaStar } from "react-icons/fa";
import axiosInstance from '../../Api/axiosInstance';

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classPerformanceData, setClassPerformanceData] = useState({
    summary: {
      totalStudents: 0,
      presentStudents: 0,
      avgAttendance: "0%"
    },
    studentAttendanceByClass: []
  });
  
  // Fetch class performance data from API
  useEffect(() => {
    const fetchClassPerformanceData = async () => {
      try {
        // Get branchId from localStorage user object
        let branchId = '1'; // Default fallback
        
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.branchId) {
              branchId = user.branchId;
            }
          }
        } catch (err) {
          console.error('Error parsing user from localStorage:', err);
        }
        
        // Using axiosInstance to fetch data
        const response = await axiosInstance.get(`/generaltrainer/${branchId}/class-performance`);
        
        if (response.data && response.data.success) {
          setClassPerformanceData(response.data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        const errorMessage = err.response ? 
          `Server responded with ${err.response.status}: ${err.response.data.message || err.response.statusText}` :
          err.message;
        setError(errorMessage);
        console.error('Error fetching class performance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassPerformanceData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="alert alert-danger" role="alert">
          Error loading report data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="trainer-dashboard">
      <div className="dashboard-header">
        <h1 className="text-center fw-bold mb-2">Student Performance Report</h1>
        <p className="text-center text-muted">
          Student Performance Overview
        </p>
      </div>
      
      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-3">
              <div className="icon-circle bg-primary bg-opacity-10 text-primary mb-3">
                <FaUsers className="fs-4" />
              </div>
              <Card.Title className="fs-6">Total Students</Card.Title>
              <h2 className="my-2">{classPerformanceData.summary.totalStudents}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-3">
              <div className="icon-circle bg-success bg-opacity-10 text-success mb-3">
                <FaUsers className="fs-4" />
              </div>
              <Card.Title className="fs-6">Present Students</Card.Title>
              <h2 className="my-2">{classPerformanceData.summary.presentStudents}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-3">
              <div className="icon-circle bg-info bg-opacity-10 text-info mb-3">
                <FaChartBar className="fs-4" />
              </div>
              <Card.Title className="fs-6">Avg. Attendance</Card.Title>
              <h2 className="my-2">{classPerformanceData.summary.avgAttendance}</h2>
              <ProgressBar now={parseInt(classPerformanceData.summary.avgAttendance)} variant="info" className="mt-2" />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body className="p-3">
              <div className="icon-circle bg-warning bg-opacity-10 text-warning mb-3">
                <FaStar className="fs-4" />
              </div>
              <Card.Title className="fs-6">Classes</Card.Title>
              <h2 className="my-2">{classPerformanceData.studentAttendanceByClass.length}</h2>
              <ProgressBar now={classPerformanceData.studentAttendanceByClass.length > 0 ? 100 : 0} variant="warning" className="mt-2" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Graphical Report */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="text-white">
          <FaChartBar className="me-2" /> Class Performance Report
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          <Row className="mb-3">
            <Col>
              <h5>Student Attendance by Class</h5>
            </Col>
          </Row>
          
          {classPerformanceData.studentAttendanceByClass.map((cls, index) => {
            // Parse attendance string like "1/10" to get present and total students
            const [present, total] = cls.attendance.split('/').map(Number);
            
            return (
              <Card key={index} className="mb-3 border-0 shadow-sm">
                <Card.Body className="p-3">
                  <Row>
                    <Col xs={12} md={4} className="mb-2 mb-md-0">
                      <h6>{cls.className}</h6>
                      <small className="text-muted">{cls.date}</small>
                    </Col>
                    <Col xs={12} md={8}>
                      <div className="d-flex align-items-center flex-column flex-md-row">
                        <div className="me-3 mb-2 mb-md-0" style={{ width: '120px' }}>
                          {cls.attendance}
                        </div>
                        <div className="flex-grow-1 mb-2 mb-md-0">
                          <ProgressBar 
                            now={cls.attendancePercentage} 
                            variant={cls.attendancePercentage >= 80 ? "success" : 
                                   cls.attendancePercentage >= 60 ? "warning" : "danger"}
                          />
                        </div>
                        <div className="ms-md-3" style={{ width: '50px' }}>
                          {cls.attendancePercentage}%
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
          
          {classPerformanceData.studentAttendanceByClass.length === 0 && (
            <div className="text-center text-muted py-4">
              No class attendance data available
            </div>
          )}
        </Card.Body>
      </Card>
      
      <style jsx>{`
        .trainer-dashboard {
          padding: 15px;
          background-color: #f8f9fa;
          min-height: 100vh;
        }
        
        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .icon-circle {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
};

export default Report;