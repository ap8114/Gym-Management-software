import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaQrcode, FaCheckCircle } from 'react-icons/fa';
import { Html5Qrcode } from 'html5-qrcode';
import { format } from 'date-fns';
import axiosInstance from '../Api/axiosInstance';

/**
 * Universal QR Attendance Component
 * 
 * This component works for ALL user roles (Member, Trainer, Receptionist, etc.)
 * All users scan the same global QR code created by Admin
 * 
 * Features:
 * - Scans admin's global QR code
 * - Automatic check-in on successful scan
 * - Manual check-in fallback
 * - Self checkout functionality
 * - Attendance history display
 * - Role-agnostic (works for any user type)
 * 
 * Usage:
 * <UniversalQRAttendance />
 * 
 * The component automatically:
 * - Gets user ID and branch ID from localStorage
 * - Determines user role from localStorage
 * - Uses appropriate API endpoints based on user type
 */
const UniversalQRAttendance = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkinSuccess, setCheckinSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const html5QrCodeRef = useRef(null);
  const scannerContainerRef = useRef(null);
  const lastScannedQRRef = useRef(null);
  const isProcessingQRRef = useRef(false);

  // Get user data from localStorage (works for any role)
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData.id;
  const branchId = userData.branchId || 1;
  const userRole = localStorage.getItem('userRole')?.toUpperCase() || 'MEMBER';
  const userName = userData.fullName || userData.name || userData.email || 'User';

  // Fetch check-in history on mount
  useEffect(() => {
    if (userId) {
      fetchCheckinHistory();
    }
  }, [userId, branchId]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  /**
   * Fetch attendance history
   * Works for all user types by using the user's ID
   */
  const fetchCheckinHistory = async () => {
    try {
      setHistoryLoading(true);
      
      // Use member attendance endpoint (works for all user types)
      const response = await axiosInstance.get(`memberattendence/${userId}`);
      const data = response.data;

      if (data.success && data.attendance) {
        const allHistory = data.attendance;
        const transformedHistory = allHistory.map(entry => ({
          id: entry.id,
          checkIn: new Date(entry.checkIn),
          checkOut: entry.checkOut ? new Date(entry.checkOut) : null,
          mode: entry.mode,
          status: entry.status,
          notes: entry.notes,
          computedStatus: entry.computedStatus,
          memberId: entry.memberId,
          branchId: entry.branchId
        }));

        setHistory(transformedHistory);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  /**
   * Handle check-in (works for all user types)
   */
  const handleCheckIn = async (mode = 'Manual', notes = 'Manual Check-in') => {
    try {
      setLoading(true);
      setError(null);
      setCheckinSuccess(null);
      
      const response = await axiosInstance.post('memberattendence/checkin', {
        memberId: userId, // Works for all user types
        branchId: branchId,
        mode: mode,
        notes: notes
      });
      
      const data = response.data;
      
      if (data.success) {
        setCheckinSuccess('✅ Attendance successful!');
        await fetchCheckinHistory();
        if (isScanning) {
          stopScanner();
        }
      } else {
        setError(data.message || 'Check-in failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error during check-in';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setCheckinSuccess(null), 5000);
    }
  };

  /**
   * Handle check-out (works for all user types)
   */
  const handleCheckOut = async (attendanceId) => {
    try {
      setLoading(true);
      setError(null);
      setCheckinSuccess(null);
      
      // Try PUT first (correct method), fallback to POST if needed
      let response;
      try {
        response = await axiosInstance.put(`memberattendence/checkout/${attendanceId}`, {
          memberId: userId,
          branchId: branchId
        });
      } catch (putErr) {
        response = await axiosInstance.post(`memberattendence/checkout/${attendanceId}`, {
          memberId: userId,
          branchId: branchId
        });
      }
      
      const data = response.data;
      
      if (data.success) {
        setCheckinSuccess('✅ Check-out successful!');
        await fetchCheckinHistory();
      } else {
        setError(data.message || 'Check-out failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error during check-out';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setCheckinSuccess(null), 5000);
    }
  };

  /**
   * Process scanned global QR code
   * Validates that it's the admin's global QR code
   */
  const processScannedQR = async (decodedText) => {
    // Prevent duplicate scans
    if (isProcessingQRRef.current) {
      return;
    }

    // Prevent scanning the same QR code within 3 seconds
    const now = Date.now();
    if (lastScannedQRRef.current && 
        lastScannedQRRef.current.text === decodedText && 
        (now - lastScannedQRRef.current.timestamp) < 3000) {
      return;
    }

    isProcessingQRRef.current = true;
    lastScannedQRRef.current = { text: decodedText, timestamp: now };

    try {
      const qrData = JSON.parse(decodedText);
      
      // Validate QR code is the global gym check-in QR code
      if (qrData.purpose !== 'gym_checkin_global') {
        setScannerError('Invalid QR code. Please scan the gym check-in QR code displayed at the entrance.');
        isProcessingQRRef.current = false;
        return;
      }

      // Validate branch ID matches (optional - for multi-branch gyms)
      if (qrData.branchId && qrData.branchId !== branchId) {
        setScannerError('This QR code is for a different branch.');
        isProcessingQRRef.current = false;
        return;
      }

      // Check if QR code is expired
      if (qrData.expires_at) {
        const expiresAt = new Date(qrData.expires_at);
        const now = new Date();
        if (now > expiresAt) {
          setScannerError('QR code has expired. Please ask staff for a new QR code.');
          isProcessingQRRef.current = false;
          return;
        }
      }

      // Clear scanner error
      setScannerError(null);
      
      // Auto-trigger check-in with QR mode
      await handleCheckIn('QR Code', `Scanned Global QR Code - Branch: ${qrData.branchName || branchId}`);
      
    } catch (err) {
      setScannerError('Invalid QR code format. Please try again.');
    } finally {
      isProcessingQRRef.current = false;
    }
  };

  // Check if HTTPS is available (required for camera access)
  const isHttps = window.location.protocol === 'https:';
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const canAccessCamera = isHttps || isDevelopment;

  /**
   * Start QR scanner with improved camera access
   */
  const startScanner = async () => {
    if (!canAccessCamera && !isDevelopment) {
      setScannerError('⚠️ Camera access requires HTTPS. Please use a secure connection (https://)');
      return;
    }

    try {
      setScannerError(null);
      setIsScanning(true);
      
      // Clear any existing scanner
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      const html5QrCode = new Html5Qrcode("qr-reader-universal");
      html5QrCodeRef.current = html5QrCode;

      // First, check if we have camera permission
      let devices = [];
      try {
        devices = await Html5Qrcode.getCameras();
      } catch (e) {
        console.log("Camera enumeration not available, using facingMode");
      }

      let startSuccess = false;

      // Try with back camera if devices available
      if (devices && devices.length > 0) {
        for (let i = 0; i < devices.length; i++) {
          try {
            const device = devices[i];
            console.log("Trying camera:", device.label);
            
            await html5QrCode.start(
              device.id,
              {
                fps: 15,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                disableFlip: false
              },
              (decodedText) => {
                processScannedQR(decodedText);
              },
              (errorMessage) => {
                // Ignore QR scanning errors
              }
            );
            startSuccess = true;
            console.log("Camera started successfully with device:", device.label);
            break;
          } catch (deviceErr) {
            console.log("Camera failed, trying next...");
            continue;
          }
        }
      }

      // Fallback 1: Try using facingMode environment (rear camera)
      if (!startSuccess) {
        try {
          console.log("Trying facingMode: environment");
          await html5QrCode.start(
            { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            {
              fps: 15,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              disableFlip: false
            },
            (decodedText) => {
              processScannedQR(decodedText);
            },
            (errorMessage) => {
              // Ignore QR scanning errors
            }
          );
          startSuccess = true;
          console.log("Rear camera started with facingMode");
        } catch (envErr) {
          console.log("Environment camera failed");
        }
      }

      // Fallback 2: Try using facingMode user (front camera)
      if (!startSuccess) {
        try {
          console.log("Trying facingMode: user");
          await html5QrCode.start(
            { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
            {
              fps: 15,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              disableFlip: false
            },
            (decodedText) => {
              processScannedQR(decodedText);
            },
            (errorMessage) => {
              // Ignore QR scanning errors
            }
          );
          startSuccess = true;
          console.log("Front camera started with facingMode");
        } catch (userErr) {
          console.log("User camera failed");
        }
      }

      // If all methods fail
      if (!startSuccess) {
        throw new Error("Could not access camera");
      }
    } catch (err) {
      console.error("Scanner error:", err);
      let errorMsg = 'Failed to start camera. ';
      
      if (err.name === 'NotAllowedError' || 
          err.message?.includes('permission') ||
          err.message?.includes('Permission') ||
          err.message?.includes('denied')) {
        errorMsg = '📱 Camera permission denied. Please enable camera access in your device settings and try again.';
      } else if (err.name === 'NotFoundError' || 
                 err.message?.includes('camera') ||
                 err.message?.includes('No camera')) {
        errorMsg = '📸 No camera found on your device. Please check your device has a camera.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = '📷 Camera is in use by another app. Please close other apps and try again.';
      } else if (err.message?.includes('Could not access camera')) {
        errorMsg = '🔒 Could not access camera. Please check:\n1. Camera permissions are enabled\n2. No other app is using the camera\n3. Your device has a working camera';
      } else {
        errorMsg += err.message || 'Please check camera permissions and try again.';
      }
      
      setScannerError(errorMsg);
      setIsScanning(false);
    }
  };

  /**
   * Stop QR scanner
   */
  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
      setIsScanning(false);
      setScannerError(null);
    } catch (err) {
      // Ignore cleanup errors
    }
  };

  return (
    <div className="container-fluid p-3">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex align-items-center">
            <FaQrcode className="me-2" size={24} />
            <div>
              <h5 className="mb-0">Gym Check-in</h5>
              <small className="text-white-50">Scan the QR code displayed at the gym entrance</small>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {/* HTTPS Warning for non-secure connections */}
          {!isHttps && !isDevelopment && (
            <Alert variant="danger" className="mb-4">
              <h6 className="fw-bold mb-2">🔒 Secure Connection Required</h6>
              <p className="mb-0">Camera access requires HTTPS (secure connection). Please use https:// to enable camera access.</p>
            </Alert>
          )}

          {/* Instructions Card */}
          <Card className="mb-4 border-info">
            <Card.Body>
              <h6 className="fw-bold mb-3">
                <FaCheckCircle className="me-2 text-success" />
                How to Check In
              </h6>
              <ol className="mb-0">
                <li className="mb-2">Look for the QR code displayed at the gym entrance/reception</li>
                <li className="mb-2">Click "Scan Gym QR Code" button below</li>
                <li className="mb-2">Point your camera at the gym's QR code</li>
                <li>You will be automatically checked in once the QR code is scanned</li>
              </ol>
            </Card.Body>
          </Card>

          {/* Check-in buttons */}
          <div className="text-center mb-4">
            <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
              <Button 
                variant={isScanning ? "danger" : "success"}
                size="lg"
                onClick={isScanning ? stopScanner : startScanner}
                disabled={loading}
                className="px-5 py-3"
              >
                {isScanning ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Stop Scanner
                  </>
                ) : (
                  <>
                    <FaQrcode className="me-2" />
                    Scan Gym QR Code
                  </>
                )}
              </Button>

              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={() => handleCheckIn()}
                disabled={loading || isScanning}
                className="px-5 py-3"
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Checking in...
                  </>
                ) : (
                  "Manual Check-in"
                )}
              </Button>
            </div>
            <p className="text-muted mt-3 mb-0">
              <small>Scan the QR code displayed at the gym entrance, or use manual check-in</small>
            </p>
          </div>

          {/* QR Scanner */}
          {isScanning && (
            <div className="mb-4">
              <Card className="border-primary">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">
                    <FaQrcode className="me-2" />
                    Scanner Active - Point camera at gym QR code
                  </h6>
                </Card.Header>
                <Card.Body className="p-3">
                  <div 
                    id="qr-reader-universal" 
                    ref={scannerContainerRef} 
                    style={{ 
                      width: '100%', 
                      minHeight: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  ></div>
                  {scannerError && (
                    <Alert variant="warning" className="mt-3 mb-0" dismissible onClose={() => setScannerError(null)}>
                      {scannerError.split('\n').map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </Alert>
                  )}
                  <div className="text-center mt-3">
                    <p className="text-muted mb-0">
                      <small>Make sure the QR code is clearly visible and well-lit</small>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

          {/* Success message */}
          {checkinSuccess && (
            <Alert variant="success" className="mb-3 text-center" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              <div className="d-flex align-items-center justify-content-center">
                <FaCheckCircle className="me-2" size={24} />
                {checkinSuccess}
              </div>
            </Alert>
          )}
          
          {/* Error message */}
          {error && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* History Table */}
          <div className="mt-4">
            <h6 className="fw-bold mb-3">Today's Check-in History</h6>
            {historyLoading ? (
              <div className="text-center py-3">
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Loading history...</span>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Attendance ID</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No check-in history for today</td>
                      </tr>
                    ) : (
                      history.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.id}</td>
                          <td>{format(entry.checkIn, 'MMM dd, yyyy HH:mm:ss')}</td>
                          <td>
                            {entry.checkOut 
                              ? format(entry.checkOut, 'MMM dd, yyyy HH:mm:ss') 
                              : <span className="text-muted">Still in gym</span>}
                          </td>
                          <td>
                            <Badge bg="info">{entry.mode}</Badge>
                          </td>
                          <td>
                            {entry.computedStatus === 'Active' ? (
                              <Badge bg="warning">Active</Badge>
                            ) : (
                              <Badge bg="success">Completed</Badge>
                            )}
                          </td>
                          <td>
                            {!entry.checkOut && entry.computedStatus === 'Active' ? (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCheckOut(entry.id)}
                                disabled={loading}
                              >
                                Check Out
                              </Button>
                            ) : (
                              <Badge bg="success">Completed</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UniversalQRAttendance;