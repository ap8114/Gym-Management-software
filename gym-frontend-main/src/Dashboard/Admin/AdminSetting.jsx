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
  FaDownload,
} from "react-icons/fa";
import CreatePlan from "./CreatePlan";
import axiosInstance from "../../Api/axiosInstance";
import QRCode from "qrcode";

const AdminSetting = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("company");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [settingsId, setSettingsId] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const [formData, setFormData] = useState({
    companyLogo: null,
    companyDescription: "",
    companyWebsite: "",
  });

  const [previewImages, setPreviewImages] = useState({
    companyLogo: "",
  });

  // 🔹 Generate QR code
  useEffect(() => {
    const generatedUrl = formData.companyWebsite && adminId
      ? `https://gym-speed-fitness.netlify.app/${formData.companyWebsite}/${adminId}`
      : "";

    if (generatedUrl) {
      QRCode.toDataURL(generatedUrl, { margin: 1, width: 250 })
        .then((url) => setQrCodeUrl(url))
        .catch(console.error);
    } else {
      setQrCodeUrl("");
    }
  }, [formData.companyWebsite, adminId]);

  // 🔹 Fetch settings
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

  // 🔹 Copy URL
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // 🔹 Download QR
  const downloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `gym-qr-${adminId || "admin"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatedUrl =
    formData.companyWebsite && adminId
      ? `https://gym-speed-fitness.netlify.app/${formData.companyWebsite}/${adminId}`
      : "";

  return (
    <div>
      <Container fluid className="p-4">
        <h3 className="fw-bold">Settings</h3>
        <p className="text-muted">Manage your website & plans</p>

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
                      <Form.Label className="fw-bold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    {/* URL SLUG */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Website Url</Form.Label>
                      <Form.Control
                        type="text"
                        name="companyWebsite"
                        placeholder="e.g., fitgym"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Your public page will be:{" "}
                        <code>https://gym-speed-fitness.netlify.app/fitgym/{adminId}</code>
                      </Form.Text>
                    </Form.Group>

                    {/* QR CODE + URL BELOW */}
                    {generatedUrl && (
                      <Form.Group className="mb-4 text-center">
                        <Form.Label className="fw-bold d-block mb-3">Scan or Share Your Gym Page</Form.Label>

                        {/* QR Code */}
                        <div className="d-flex flex-column align-items-center">
                          {qrCodeUrl ? (
                            <img
                              src={qrCodeUrl}
                              alt="QR Code"
                              style={{ width: "180px", height: "180px", margin: "0 auto 16px" }}
                            />
                          ) : (
                            <div className="text-muted mb-3">Generating QR...</div>
                          )}

                          {/* Download Button */}
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="mb-3 d-flex align-items-center gap-1"
                            onClick={downloadQR}
                            disabled={!qrCodeUrl}
                          >
                            <FaDownload /> Download QR
                          </Button>

                          {/* URL Display with Copy */}
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <code
                              style={{
                                fontSize: "0.875rem",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                background: "#f8f9fa",
                                border: "1px solid #e9ecef",
                                maxWidth: "300px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {generatedUrl}
                            </code>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => copyToClipboard(generatedUrl)}
                              title="Copy link"
                            >
                              <FaCopy size={12} />
                            </Button>
                          </div>
                          {copied && (
                            <small className="text-success mt-2">✅ Copied!</small>
                          )}
                        </div>

                        <Form.Text className="text-muted mt-3">
                          Scan the QR or share the link so members can view your gym page.
                        </Form.Text>
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