import React, { useState } from "react";
import { Form, Button, Table, Badge, Modal, Row, Col, Card } from "react-bootstrap";
import { FaEye, FaTrash } from "react-icons/fa";

const Attendance = () => {
  const [search, setSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [filters, setFilters] = useState({
    memberId: "",
    memberName: "",
    status: "",
  });

  const [attendance, setAttendance] = useState([
    {
      attendance_id: 1,
      member_id: 101,
      name: "Rahul Sharma",
      status: "Present",
      checkin_time: "07:00",
      checkout_time: "08:00",
      mode: "QR",
      notes: "",
    },
    {
      attendance_id: 2,
      member_id: 102,
      name: "Sneha Patel",
      status: "Absent",
      checkin_time: "",
      checkout_time: "",
      mode: "",
      notes: "",
    },
    {
      attendance_id: 3,
      member_id: 103,
      name: "Vidhya Sharma",
      status: "Late",
      checkin_time: "07:30",
      checkout_time: "",
      mode: "Manual",
      notes: "Came late due to traffic",
    },
  ]);

  // Delete member
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setAttendance(attendance.filter((m) => m.attendance_id !== id));
    }
  };

  // Handle status change with dynamic logic
  const handleStatusChange = (id, newStatus) => {
    setAttendance(attendance.map((member) => {
      if (member.attendance_id === id) {
        let updatedMember = { ...member, status: newStatus };

        if (newStatus === "Present") {
          if (!member.checkin_time) {
            const now = new Date();
            updatedMember.checkin_time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        } else if (newStatus === "Absent") {
          updatedMember.checkin_time = "";
          updatedMember.checkout_time = "";
          updatedMember.mode = "";
        } else if (newStatus === "Late") {
          if (!member.checkin_time) {
            const now = new Date();
            updatedMember.checkin_time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          updatedMember.checkout_time = "";
        }

        return updatedMember;
      }
      return member;
    }));
  };

  // Filtered attendance
  const filteredAttendance = attendance.filter((m) => {
    return (
      (filters.memberId
        ? m.member_id.toString().includes(filters.memberId)
        : true) &&
      (filters.memberName
        ? m.name.toLowerCase().includes(filters.memberName.toLowerCase())
        : true) &&
      (filters.status ? m.status === filters.status : true) &&
      (search ? m.name.toLowerCase().includes(search.toLowerCase()) : true)
    );
  });

  return (
    <div className="p-3 p-md-4 bg-white rounded shadow">
      <h2 className="mb-2 mb-md-3 fw-bold">Attendance Management</h2>
      <p className="text-muted mb-3 mb-md-4">
        Manage and track attendance records for gym members.
      </p>

      {/* Filters Row */}
      <Row className="mb-4 g-2 g-md-3">
        <Col xs={12} sm={6} md={3}>
          <Form.Control
            type="text"
            placeholder="Filter by Member ID"
            value={filters.memberId}
            onChange={(e) =>
              setFilters({ ...filters, memberId: e.target.value })
            }
          />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Form.Control
            type="text"
            placeholder="Filter by Member Name"
            value={filters.memberName}
            onChange={(e) =>
              setFilters({ ...filters, memberName: e.target.value })
            }
          />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Form.Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Filter by Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </Form.Select>
        </Col>
        <Col xs={12} sm={6} md={3} className="d-flex justify-content-start justify-content-md-end">
          <Button variant="outline-secondary me-2">Filter</Button>
          <Button variant="outline-secondary">Export</Button>
        </Col>
      </Row>

      {/* Desktop Table View */}
      <div className="table-responsive d-none d-md-block">
        <Table bordered hover responsive className="align-middle">
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th>Attendance ID</th>
              <th>Member ID</th>
              <th>Member Name</th>
              <th>Status</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Mode</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map((member) => (
              <tr key={member.attendance_id}>
                <td>{member.attendance_id}</td>
                <td>{member.member_id}</td>
                <td>{member.name}</td>
                <td>
                  <Form.Select
                    size="sm"
                    value={member.status}
                    onChange={(e) => handleStatusChange(member.attendance_id, e.target.value)}
                    style={{ 
                      width: '100px',
                      backgroundColor: 
                        member.status === "Present" ? "#d4edda" : 
                        member.status === "Absent" ? "#f8d7da" : 
                        member.status === "Late" ? "#fff3cd" : "#e2e3e5"
                    }}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </Form.Select>
                </td>
                <td>{member.checkin_time || "--"}</td>
                <td>{member.checkout_time || "--"}</td>
                <td>
                  {(member.status === "Present" || member.status === "Late") ? (
                    <Form.Select
                      size="sm"
                      value={member.mode || ""}
                      onChange={(e) => {
                        setAttendance(attendance.map(m =>
                          m.attendance_id === member.attendance_id
                            ? { ...m, mode: e.target.value }
                            : m
                        ));
                      }}
                    >
                      <option value="">--Select--</option>
                      <option value="QR">QR</option>
                      <option value="Manual">Manual</option>
                      <option value="App">App</option>
                    </Form.Select>
                  ) : (
                    member.mode || "--"
                  )}
                </td>
                <td>
                  {member.status === "Late" ? (
                    <Form.Control
                      type="text"
                      size="sm"
                      value={member.notes}
                      onChange={(e) => {
                        setAttendance(attendance.map(m => 
                          m.attendance_id === member.attendance_id 
                          ? { ...m, notes: e.target.value } 
                          : m
                        ));
                      }}
                    />
                  ) : (
                    member.notes || "--"
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      onClick={() => {
                        setViewMember(member);
                        setShowViewModal(true);
                      }}
                    >
                      <FaEye />
                    </Button>
                    {member.status === "Present" || member.status === "Late" ? (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => {
                          setAttendance(attendance.map(m => 
                            m.attendance_id === member.attendance_id 
                            ? { ...m, checkout_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
                            : m
                          ));
                        }}
                      >
                        Check-out
                      </Button>
                    ) : null}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(member.attendance_id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="d-md-none">
        {filteredAttendance.map((member) => (
          <Card key={member.attendance_id} className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{member.name}</strong>
                <div className="text-muted small">ID: {member.member_id}</div>
              </div>
              <div>
                <Badge 
                  bg={
                    member.status === "Present" ? "success" : 
                    member.status === "Absent" ? "danger" : 
                    member.status === "Late" ? "warning" : "secondary"
                  }
                >
                  {member.status}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col xs={6}>
                  <small className="text-muted">Check-in:</small>
                  <div>{member.checkin_time || "--"}</div>
                </Col>
                <Col xs={6}>
                  <small className="text-muted">Check-out:</small>
                  <div>{member.checkout_time || "--"}</div>
                </Col>
              </Row>
              
              <Row className="mb-2">
                <Col xs={12}>
                  <small className="text-muted">Status:</small>
                  <Form.Select
                    size="sm"
                    value={member.status}
                    onChange={(e) => handleStatusChange(member.attendance_id, e.target.value)}
                    className="mt-1"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </Form.Select>
                </Col>
              </Row>
              
              {(member.status === "Present" || member.status === "Late") && (
                <Row className="mb-2">
                  <Col xs={12}>
                    <small className="text-muted">Mode:</small>
                    <Form.Select
                      size="sm"
                      value={member.mode || ""}
                      onChange={(e) => {
                        setAttendance(attendance.map(m =>
                          m.attendance_id === member.attendance_id
                            ? { ...m, mode: e.target.value }
                            : m
                        ));
                      }}
                      className="mt-1"
                    >
                      <option value="">--Select--</option>
                      <option value="QR">QR</option>
                      <option value="Manual">Manual</option>
                      <option value="App">App</option>
                    </Form.Select>
                  </Col>
                </Row>
              )}
              
              {member.status === "Late" && (
                <Row className="mb-2">
                  <Col xs={12}>
                    <small className="text-muted">Notes:</small>
                    <Form.Control
                      type="text"
                      size="sm"
                      value={member.notes}
                      onChange={(e) => {
                        setAttendance(attendance.map(m => 
                          m.attendance_id === member.attendance_id 
                          ? { ...m, notes: e.target.value } 
                          : m
                        ));
                      }}
                      className="mt-1"
                    />
                  </Col>
                </Row>
              )}
              
              <div className="d-flex gap-2 mt-3">
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => {
                    setViewMember(member);
                    setShowViewModal(true);
                  }}
                >
                  <FaEye />
                </Button>
                {member.status === "Present" || member.status === "Late" ? (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => {
                      setAttendance(attendance.map(m => 
                        m.attendance_id === member.attendance_id 
                        ? { ...m, checkout_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
                        : m
                      ));
                    }}
                  >
                    Check-out
                  </Button>
                ) : null}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(member.attendance_id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Attendance Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewMember && (
            <>
              <p><b>Attendance ID:</b> {viewMember.attendance_id}</p>
              <p><b>Member ID:</b> {viewMember.member_id}</p>
              <p><b>Name:</b> {viewMember.name}</p>
              <p>
                <b>Status:</b> 
                {viewMember.status === "Present" && <Badge bg="success ms-2">Present</Badge>}
                {viewMember.status === "Absent" && <Badge bg="danger ms-2">Absent</Badge>}
                {viewMember.status === "Late" && <Badge bg="warning" text="dark" className="ms-2">Late</Badge>}
                {!viewMember.status && <Badge bg="secondary ms-2">Not Marked</Badge>}
              </p>
              <p><b>Check-in:</b> {viewMember.checkin_time || "--"}</p>
              <p><b>Check-out:</b> {viewMember.checkout_time || "--"}</p>
              <p><b>Mode:</b> {viewMember.mode || "--"}</p>
              <p><b>Notes:</b> {viewMember.notes || "--"}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Attendance;