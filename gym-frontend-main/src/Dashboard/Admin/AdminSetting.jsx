import React, { useState } from 'react';
import { Form, Button, Container, Image, Nav, Tab, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaBuilding, FaImage, FaMapMarkerAlt, FaGlobe, FaFileInvoice, FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import CreatePlan from './CreatePlan';

const AdminSetting = () => {
  // --- State Management ---
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  // --- Static Form Data ---
  const [formData, setFormData] = useState({
    // Company Info
    companyName: 'Super Fitness Gym',
    companyEmail: 'contact@superfitness.com',
    companyLogo: null,
    companyDescription: 'Super Fitness Gym is a state-of-the-art fitness facility offering a wide range of equipment and classes to help you achieve your fitness goals.',
    companyWebsite: 'https://www.superfitness.com',
    
    // Plans
    plans: [
      {
        id: 1,
        name: 'Basic Plan',
        price: '$29.99/month',
        features: ['Access to gym equipment', 'Basic fitness assessment', 'Locker room access']
      },
      {
        id: 2,
        name: 'Premium Plan',
        price: '$49.99/month',
        features: ['Access to gym equipment', 'Personal trainer consultation', 'Group fitness classes', 'Sauna access']
      },
      {
        id: 3,
        name: 'Elite Plan',
        price: '$79.99/month',
        features: ['All Premium features', 'Unlimited personal training sessions', 'Nutrition counseling', 'Priority booking']
      }
    ]
  });

  // --- Static Preview Images ---
  const [previewImages, setPreviewImages] = useState({
    companyLogo: 'https://i.pravatar.cc/150?img=3',
  });

  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImages(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const saveCompanyData = (e) => {
    e.preventDefault();
    setLoading(true);
    // In a real app, this is where the API call would go.
    // For now, we'll just simulate a save process.
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully! (This is a static demo)');
    }, 1500);
  };

  // --- Styling ---
  const uploadButtonStyle = {
    backgroundColor: '#002d4d',
    borderColor: '#002d4d',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  };

  const previewImageStyle = {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    padding: '4px'
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px 0' }}>
      <Container className="p-4" style={{ maxWidth: '100%' }}>
        {/* Page Title */}
        <h1 className="mb-3" style={{ fontSize: '24px', fontWeight: '600' }}>
          Settings
        </h1>
        <p className="mb-4 text-muted">Manage your settings on the portal.</p>

        {/* Tabs: Company & Plans */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="company" className="d-flex align-items-center gap-2 p-2">
                <FaBuilding className="fs-5" />
                <span>Website Settings</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="plans" className="d-flex align-items-center gap-2 p-2">
                <FaFileInvoice className="fs-5" />
                <span>Plans</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* COMPANY SETTINGS TAB */}
            <Tab.Pane eventKey="company">
              <div className="border p-4 rounded shadow-sm">
                <h2 className="mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
                  Information
                </h2>

                <Form onSubmit={saveCompanyData}>
                  <Form.Group className="mb-4">
                    <Form.Control
                      type="text"
                      placeholder="Company Name *"
                      className="mb-3"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control
                      type="email"
                      placeholder="Company Email Address *"
                      className="mb-3"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <hr className="my-4" />

                  <div className="d-flex align-items-center mb-3">
                    <FaImage className="me-2" style={{ color: '#002d4d' }} />
                    <h5 style={{ marginBottom: 0 }}>Logo</h5>
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold d-block mb-2">Company Logo</Form.Label>
                    <div className="d-flex align-items-center">
                      <Button as="label" htmlFor="companyLogo-upload" style={uploadButtonStyle}>
                        Choose File
                        <Form.Control
                          type="file"
                          id="companyLogo-upload"
                          className="d-none"
                          name="companyLogo"
                          onChange={handleChange}
                          accept="image/*"
                        />
                      </Button>
                      {previewImages.companyLogo && (
                        <Image src={previewImages.companyLogo} alt="Company Logo Preview" style={previewImageStyle} />
                      )}
                    </div>
                    <Form.Text className="text-muted">
                      Upload company logo of your company
                    </Form.Text>
                  </Form.Group>

                  <hr className="my-4" />

                  <div className="d-flex align-items-center mb-3">
                    <FaGlobe className="me-2" style={{ color: '#002d4d' }} />
                    <h5 style={{ marginBottom: 0 }}>Website Information</h5>
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="companyDescription"
                      value={formData.companyDescription}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Website URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end mt-4">
                    <Button variant="outline-secondary" className="me-3 px-4 py-2" type="button">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="px-4 py-2"
                      style={{
                        borderRadius: '4px',
                        backgroundColor: '#002d4d',
                        borderColor: '#002d4d',
                        border: 'none',
                        color: '#fff'
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </Tab.Pane>

            {/* PLANS TAB */}
            <Tab.Pane eventKey="plans">
                <CreatePlan />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </div>
  );
};

export default AdminSetting;