import React from 'react';
import UniversalQRAttendance from '../../Components/UniversalQRAttendance';

/**
 * HouseKeepingQrCheckin - Housekeeping QR Code Check-in Component
 * 
 * Uses the UniversalQRAttendance component which:
 * - Scans the admin's global QR code
 * - Works for all user roles
 * - Provides check-in/checkout functionality
 * - Displays attendance history
 */
const HouseKeepingQrCheckin = () => {
  return <UniversalQRAttendance />;
};

export default HouseKeepingQrCheckin;
