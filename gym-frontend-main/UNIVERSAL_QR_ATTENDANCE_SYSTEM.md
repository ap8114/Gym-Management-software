# Universal QR Attendance System

## 🎯 Overview

The Universal QR Attendance System is a **single, unified component** that works for **ALL user roles** in the gym management system. All users (Members, Trainers, Receptionists, Housekeeping, Managers, etc.) scan the **same global QR code** created by the Admin.

## ✅ Key Features

1. **Single Source of Truth**: One component (`UniversalQRAttendance`) used by all roles
2. **Global QR Code**: All users scan the admin's global QR code (not personal QR codes)
3. **Role-Agnostic**: Automatically works for any user type (current and future)
4. **Extensible**: Adding new roles requires no code changes - just use the component
5. **Consistent Experience**: Same UI and functionality for all users

## 📁 Component Structure

### Main Component
- **`src/Components/UniversalQRAttendance.jsx`**
  - Core component with all QR scanning, check-in, checkout, and history logic
  - Automatically detects user role from localStorage
  - Works with any user type

### Role-Specific Wrappers
All role-specific components are now simple wrappers:

- `src/Dashboard/Member/MemberQrCheckin.jsx`
- `src/Dashboard/Receptionist/ReceptionistQrCheckin.jsx`
- `src/Dashboard/GeneralTrainer/GeneralQrCheckin.jsx`
- `src/Dashboard/PersonalTrainer/PersonsalTrainerQrCheckin.jsx`
- `src/Dashboard/HouseKeeping/HouseKeepingQrCheckin.jsx`
- `src/Dashboard/Manager/ManagerQrCheckin.jsx`

Each wrapper simply renders `<UniversalQRAttendance />`

## 🔄 How It Works

### 1. Admin Creates Global QR Code
- Admin goes to `/admin/qrcheckin`
- System generates a global QR code with:
  - `purpose: "gym_checkin_global"`
  - `branchId`: Admin's branch ID
  - `branchName`: Branch name
  - `nonce`: Unique security token
  - `expires_at`: Expiry timestamp (1 hour)

### 2. All Users Scan Same QR Code
- Any user (Member, Trainer, Receptionist, etc.) goes to their QR check-in page
- They scan the **same global QR code** displayed at the gym entrance
- System validates:
  - QR code purpose is `gym_checkin_global`
  - Branch ID matches (if applicable)
  - QR code hasn't expired
  - QR code format is valid

### 3. Automatic Check-in
- On successful scan, user is automatically checked in
- Uses their user ID from localStorage
- Records check-in with mode: "QR Code"

### 4. Self Checkout
- Users can check themselves out from attendance history
- Shows active sessions with "Check Out" button

## 🚀 Adding New Roles

### For Future Roles (e.g., "Security", "Maintenance", etc.)

**Step 1:** Create a wrapper component:
```jsx
// src/Dashboard/Security/SecurityQrCheckin.jsx
import React from 'react';
import UniversalQRAttendance from '../../Components/UniversalQRAttendance';

const SecurityQrCheckin = () => {
  return <UniversalQRAttendance />;
};

export default SecurityQrCheckin;
```

**Step 2:** Add route in `App.jsx`:
```jsx
<Route 
  path="/security/qrcheckin" 
  element={
    <ProtectedRoute allowedRoles={["SECURITY", "ADMIN"]}>
      <SecurityQrCheckin />
    </ProtectedRoute>
  } 
/>
```

**Step 3:** Add menu item in `Sidebar.jsx`:
```jsx
SECURITY: [
  { name: "QR Check-in", icon: faQrcode, path: "/security/qrcheckin" },
  // ... other menu items
]
```

**That's it!** No other changes needed. The component automatically:
- Detects user role from localStorage
- Uses correct user ID
- Works with existing API endpoints
- Provides same functionality as all other roles

## 📋 Component API

### UniversalQRAttendance Component

**Props:** None (all data comes from localStorage)

**Features:**
- ✅ QR Code Scanner (scans admin's global QR code)
- ✅ Manual Check-in button
- ✅ Self Checkout functionality
- ✅ Attendance history display
- ✅ Error handling
- ✅ Loading states
- ✅ Success/error messages

**Data Sources:**
- `localStorage.getItem('user')` - User data (ID, branchId, etc.)
- `localStorage.getItem('userRole')` - User role (for display purposes)

**API Endpoints Used:**
- `POST /api/memberattendence/checkin` - Check in
- `PUT /api/memberattendence/checkout/:id` - Check out
- `GET /api/memberattendence/:userId` - Get attendance history

## 🔐 Security Features

1. **QR Code Validation:**
   - Validates `purpose === "gym_checkin_global"`
   - Checks branch ID match
   - Validates expiry timestamp
   - Prevents duplicate scans (3-second debounce)

2. **Authentication:**
   - Uses `axiosInstance` (automatic JWT token attachment)
   - All API calls are authenticated
   - 401 errors handled globally

3. **User Identification:**
   - Uses user ID from localStorage
   - Validated by backend on check-in

## 📊 Benefits

### For Developers:
- ✅ **DRY Principle**: No code duplication
- ✅ **Easy Maintenance**: Fix once, works everywhere
- ✅ **Consistent Behavior**: Same functionality across all roles
- ✅ **Future-Proof**: Easy to add new roles

### For Users:
- ✅ **Consistent Experience**: Same UI/UX for everyone
- ✅ **Simple Process**: Scan one QR code, get checked in
- ✅ **Self-Service**: Can check themselves out
- ✅ **Clear Feedback**: Success/error messages

### For Admins:
- ✅ **Single QR Code**: One QR code for entire gym
- ✅ **Easy Management**: Generate/regenerate from admin panel
- ✅ **Security**: Auto-expires every hour
- ✅ **Branch-Specific**: Each branch has its own QR code

## 🧪 Testing

### Test Scenarios:

1. **Member Check-in:**
   - Login as member
   - Go to `/member/qrcheckin`
   - Scan admin's global QR code
   - Verify check-in success

2. **Trainer Check-in:**
   - Login as trainer
   - Go to `/generaltrainer/qrcheckin`
   - Scan same global QR code
   - Verify check-in success

3. **Receptionist Check-in:**
   - Login as receptionist
   - Go to `/receptionist/qrcheckin`
   - Scan same global QR code
   - Verify check-in success

4. **Checkout:**
   - After check-in, view history
   - Click "Check Out" button
   - Verify checkout success

5. **Invalid QR Code:**
   - Try scanning a non-global QR code
   - Verify error message appears

6. **Expired QR Code:**
   - Wait for QR code to expire (1 hour)
   - Try scanning
   - Verify expiry error message

## 📝 Notes

- All users must scan the **same global QR code** created by admin
- QR code expires after 1 hour (auto-refreshes)
- Manual check-in is always available as fallback
- Component automatically adapts to user role
- No role-specific logic needed in component

## 🔄 Migration Notes

### What Changed:
- All role-specific QR check-in components now use `UniversalQRAttendance`
- Removed duplicate code from each component
- Standardized on global QR code system
- All components now scan admin's QR code (not personal QR codes)

### Backward Compatibility:
- ✅ All existing routes still work
- ✅ All existing menu items still work
- ✅ API endpoints unchanged
- ✅ User experience improved (consistent across roles)

## 🎉 Result

**One component, infinite roles!**

The system is now:
- ✅ Unified
- ✅ Extensible
- ✅ Maintainable
- ✅ Consistent
- ✅ Future-proof

