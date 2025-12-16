# QR Code Attendance System - Complete Guide

## 🎯 System Overview

The gym now uses a **Global QR Code System** where:
- **Admin creates ONE QR code** for the entire gym/branch
- **Members scan this global QR code** when they arrive at the gym
- The QR code is displayed at the gym entrance/reception

---

## 📱 For Members

### How to Check In:

1. **Go to `/member/qrcheckin`** in the app
2. **Look for the QR code** displayed at the gym entrance/reception
3. **Click "Scan Gym QR Code"** button
4. **Point your camera** at the gym's QR code
5. **Automatic check-in** - You'll be checked in automatically!

### Alternative: Manual Check-in
- Click "Manual Check-in" if you can't scan the QR code
- Staff can also manually check you in

### Check Out:
- View your attendance history
- Click "Check Out" button if you're still checked in
- Or wait for automatic checkout (if implemented)

---

## 👨‍💼 For Admin/Staff

### Creating the Global QR Code:

1. **Go to `/admin/qrcheckin`**
2. **QR code is automatically generated** and displayed
3. **Download or Print** the QR code
4. **Display it** at the gym entrance/reception area
5. **QR code refreshes every hour** automatically for security

### Features:
- ✅ Large, scannable QR code (300x300px)
- ✅ Auto-refresh every 1 hour
- ✅ Manual refresh button
- ✅ Download as PNG image
- ✅ Print directly
- ✅ Shows expiry time and countdown
- ✅ Branch-specific QR codes

### Managing Attendance:

1. **Go to `/admin/members/qr-code-attendance`** or `/receptionist/qr-attendance`
2. **View all attendance records** for today
3. **Search and filter** by member ID, name, or status
4. **Check members in/out** manually if needed
5. **View real-time status** (Active/Completed)

---

## 🔐 Security Features

### QR Code Security:
- ✅ **Unique nonce** for each QR code (prevents duplication)
- ✅ **1-hour expiry** - QR codes expire after 1 hour
- ✅ **Auto-refresh** - New QR code generated every hour
- ✅ **Branch validation** - QR codes are branch-specific
- ✅ **Purpose validation** - Only accepts `gym_checkin_global` QR codes

### Backend Requirements (See BACKEND_FIXES_REQUIRED.md):
- Track used nonces to prevent replay attacks
- Validate QR code expiry on backend
- Verify branch ID matches
- Store QR code generation history

---

## 📋 Component Structure

### Admin Components:
- **`AdminGlobalQRCode.jsx`** - Admin creates/manages global QR code
- **`QRAttendanceSystem.jsx`** - Staff view and manage attendance

### Member Components:
- **`MemberQrCheckin.jsx`** - Members scan global QR code to check in

### Shared Components:
- **`QRScanner.jsx`** - Reusable QR scanner component

---

## 🔄 Workflow

### Daily Workflow:

1. **Morning (Admin):**
   - Admin logs in
   - Goes to `/admin/qrcheckin`
   - Downloads/prints the QR code
   - Displays it at gym entrance

2. **Member Arrives:**
   - Member opens app
   - Goes to `/member/qrcheckin`
   - Scans the QR code at entrance
   - Automatically checked in ✅

3. **During Day (Staff):**
   - Staff can view all check-ins at `/admin/members/qr-code-attendance`
   - Monitor who's in the gym
   - Manually check members in/out if needed

4. **Member Leaves:**
   - Member can self-checkout from history
   - Or staff can check them out

---

## 🛠️ Technical Details

### QR Code Format:
```json
{
  "purpose": "gym_checkin_global",
  "branchId": 1,
  "branchName": "Main Branch",
  "issued_at": "2024-01-15T10:00:00.000Z",
  "nonce": "aBc123XyZ...",
  "expires_at": "2024-01-15T11:00:00.000Z"
}
```

### API Endpoints Used:
- `POST /api/memberattendence/checkin` - Check in member
- `POST /api/memberattendence/checkout/:id` - Check out member
- `GET /api/memberattendence/:memberId` - Get member attendance history
- `GET /api/memberattendence/today` - Get today's attendance (optional)
- `POST /api/qrcode/generate` - Save QR code info (optional)

---

## ✅ Benefits

1. **Simplified Process:**
   - One QR code for all members
   - No need for members to generate personal QR codes
   - Faster check-in process

2. **Better Security:**
   - QR codes expire regularly
   - Unique nonces prevent replay attacks
   - Branch-specific validation

3. **Easy Management:**
   - Admin controls the QR code
   - Can regenerate anytime
   - Download/print for display

4. **User-Friendly:**
   - Clear instructions for members
   - Simple scanning process
   - Manual check-in fallback

---

## 🚀 Next Steps

1. **Backend Implementation:**
   - Implement QR nonce tracking
   - Add QR code validation endpoint
   - Store QR code generation history

2. **Enhancements:**
   - Add QR code display at multiple locations
   - Implement automatic checkout after X hours
   - Add notifications for check-in/check-out
   - Add attendance analytics

---

## 📝 Notes

- The global QR code is **branch-specific**
- QR codes **expire after 1 hour** for security
- Members can still use **manual check-in** if needed
- Staff can **view and manage** all attendance records
- The system supports **multiple branches**

