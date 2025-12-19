import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Image,
  Nav,
  Tab,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import {
  FaBuilding,
  FaImage,
  FaGlobe,
  FaFileInvoice,
  FaCheck,
  FaExclamationTriangle,
  FaCopy,
} from "react-icons/fa";
import CreatePlan from "./CreatePlan";
import axiosInstance from "../../Api/axiosInstance";

const AdminSetting = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("company");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [settingsId, setSettingsId] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    companyLogo: null,
    companyDescription: "",
    companyWebsite: "",
  });

  const [previewImages, setPreviewImages] = useState({
    companyLogo: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) throw new Error("Admin not found");

        setAdminId(user.id);
        setFetching(true);

        const res = await axiosInstance.get(
          `adminSettings/app-settings/admin/${user.id}`
        );

        if (res.data?.data) {
          const s = res.data.data;
          setSettingsId(s.id);
          setFormData({
            companyDescription: s.description || "",
            companyWebsite: s.url || "",
            companyLogo: null,
          });
          setPreviewImages({ companyLogo: s.logo || "" });
        }
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.[0]) {
      setFormData({ ...formData, [name]: files[0] });
      const reader = new FileReader();
      reader.onload = () =>
        setPreviewImages((p) => ({ ...p, [name]: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const saveCompanyData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("description", formData.companyDescription);
      data.append("url", formData.companyWebsite);
      data.append("adminId", adminId);

      if (formData.companyLogo) {
        data.append("logo", formData.companyLogo);
      }

      if (settingsId) {
        await axiosInstance.put(
          `adminSettings/app-settings/${settingsId}`,
          data
        );
        setSuccess("Settings updated successfully!");
      } else {
        const res = await axiosInstance.post(
          "adminSettings/app-settings",
          data
        );
        setSettingsId(res.data?.data?.id);
        setSuccess("Settings created successfully!");
      }
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };  

  const generatedUrl =
    formData.companyWebsite && adminId
      ? `https://gym-speed-fitness.netlify.app/${formData.companyWebsite}/${adminId}`
      : "";

  return (
    <div style={{ minHeight: "100vh", padding: "20px 0" }}>
      <Container fluid className="p-4">
        <h3 className="fw-bold">Settings</h3>
        <p className="text-muted">Manage your website & plans</p>

        {error && (
          <Alert variant="danger">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success">
            <FaCheck className="me-2" />
            {success}
          </Alert>
        )}

        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="company">
                <FaBuilding className="me-2" />
                Website Settings
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="plans">
                <FaFileInvoice className="me-2" />
                Plans
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* ================= COMPANY TAB ================= */}
            <Tab.Pane eventKey="company">
              <div className="border p-4 rounded shadow-sm">
                {fetching ? (
                  <div className="text-center py-5">
                    <Spinner />
                  </div>
                ) : (
                  <Form onSubmit={saveCompanyData}>
                    {/* LOGO */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Company Logo</Form.Label>
                      <div className="d-flex align-items-center gap-3">
                        <Button as="label">
                          Upload
                          <Form.Control
                            type="file"
                            hidden
                            name="companyLogo"
                            onChange={handleChange}
                          />
                        </Button>
                        {previewImages.companyLogo && (
                          <Image
                            src={previewImages.companyLogo}
                            style={{ width: 80 }}
                          />
                        )}
                      </div>
                    </Form.Group>

                    {/* DESCRIPTION */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        Description
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    {/* URL SLUG */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        Website Url
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="companyWebsite"
                        placeholder="fitgym"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Example: fitgym → /fitgym/{adminId}
                      </Form.Text>
                    </Form.Group>

                    {/* GENERATED URL + COPY */}
                    {generatedUrl && (
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Generated URL
                        </Form.Label>
                        <InputGroup>
                          <Form.Control readOnly value={generatedUrl} />
                          <Button
                            variant="outline-primary"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedUrl);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                          >
                            <FaCopy />
                          </Button>
                        </InputGroup>
                        {copied && (
                          <small className="text-success">
                            ✅ Copied!
                          </small>
                        )}
                      </Form.Group>
                    )}

                    {/* SAVE */}
                    <div className="text-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </Form>
                )}
              </div>
            </Tab.Pane>

            {/* ================= PLANS TAB ================= */}
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
