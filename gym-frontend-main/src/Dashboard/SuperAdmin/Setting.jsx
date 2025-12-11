// src/components/SettingsPage.js
import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaSave, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../Api/axiosInstance';
import axios from 'axios';
import BaseUrl from '../../Api/BaseUrl';

const AdminSettings = () => {
  // State for profile photo URL
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('https://randomuser.me/api/portraits/men/46.jpg');
  
  // State for all form data
  const [settingsData, setSettingsData] = useState({
    // Profile Section
    fullName: '',
    email: '',
    phone: '',
    profilePhoto: null,

    // Password Section
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // State for loading
  const [loading, setLoading] = useState(true);
  
  // State for showing success message
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found in localStorage');
          return;
        }

        const response = await axiosInstance.get(`/auth/user/${userId}`);
        const userData = response.data.user;
        
        // Update form data with fetched user data
        setSettingsData(prev => ({
          ...prev,
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone || '',
        }));
        
        // If there's a profile photo URL in the user data, use it
        if (userData.profilePhoto) {
          setProfilePhotoUrl(userData.profilePhoto);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Generic handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for file upload
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Update the form data
      setSettingsData(prev => ({
        ...prev,
        profilePhoto: file
      }));
      
      // Create a URL for the uploaded image to display it
      const imageUrl = URL.createObjectURL(file);
      setProfilePhotoUrl(imageUrl);
    }
  };

  // Handler for form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('User not logged in. Please log in again.');
    return;
  }

  try {
    const requests = [];

    // 📌 1. Profile update (if any field changed from initial/fetched values)
    // But since you always overwrite from form state (even if unchanged), safer to compare with what backend had.
    // For simplicity, assume: if user typed something, send it (trim empty to null/keep existing).
    const profilePayload = {
      fullName: settingsData.fullName.trim() || '',
      email: settingsData.email.trim() || '',
      phone: (settingsData.phone || '').trim(),
    };

    // Only send profile update if *something* changed (non-empty or different from current)
    // To be precise, you’d compare with original values — but for now, just send if valid
    if (profilePayload.fullName || profilePayload.email || profilePayload.phone) {
      requests.push(
        axiosInstance.put(`/auth/user/${userId}`, profilePayload)
      );
    }

    // 📌 2. Password change (only if ALL 3 fields are non-empty after trim)
    const oldP = settingsData.oldPassword.trim();
    const newP = settingsData.newPassword.trim();
    const confirmP = settingsData.confirmNewPassword.trim();

    if (oldP && newP && confirmP) {
  if (newP !== confirmP) {
    alert('New passwords do not match.');
    return;
  }

  const passwordPromise = axios.put(`${BaseUrl}/auth/changepassword`, {
    id: userId,          // 🔑 CRITICAL — add user ID
    oldPassword: oldP,
    newPassword: newP
  });
  requests.push(passwordPromise);
}
     else if (oldP || newP || confirmP) {
      // ⚠ Partial input
      alert('To change password, please fill all three password fields.');
      return;
    }

    // 🚀 Fire all required API calls
    if (requests.length === 0) {
      // Nothing to update
      alert('No changes to save.');
      return;
    }

    // Wait for all to complete
    await Promise.all(requests);

    // ✅ Success!
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);

    // Reset password fields only
    setSettingsData(prev => ({
      ...prev,
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    }));

  } catch (error) {
    console.error('Error saving settings:', error);

    let message = 'Failed to save settings. Please try again.';
    if (error.response) {
      const res = error.response;
      message = res.data?.message || res.data?.error || res.statusText || message;
      if (res.status === 401) {
        message = 'Session expired. Please log in again.';
        // Optional: auto-logout
        // localStorage.clear(); window.location.href = '/login';
      } else if (res.status === 400 && res.config.url.includes('changepassword')) {
        message = 'Incorrect current password.';
      }
    } else if (error.request) {
      message = 'Network error. Please check your internet connection.';
    }

    alert(message);
  }
};
  if (loading) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Success Message */}
      {showSaveMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success!</strong> Your settings have been saved.
          <button type="button" className="btn-close" onClick={() => setShowSaveMessage(false)}></button>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <h1 className="h2 fw-bold mb-4">Settings</h1>
          
          <form onSubmit={handleSubmit}>
            {/* SECTION 1: My Profile */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <FaUser className="me-2" /> My Profile
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4 text-center">
                    <img
                      src={profilePhotoUrl}
                      alt="Profile"
                      className="rounded-circle img-fluid mb-3"
                      style={{ maxWidth: '150px' }}
                    />
                    <div>
                      <label htmlFor="profilePhotoUpload" className="btn btn-outline-secondary btn-sm">
                        Change Photo
                      </label>
                      <input
                        type="file"
                        id="profilePhotoUpload"
                        className="d-none"
                        onChange={handleFileUpload}
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="fullName" className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullName"
                          name="fullName"
                          value={settingsData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={settingsData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Change Password */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <FaLock className="me-2" /> Change Password
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3" style={{ maxWidth: '600px' }}>
                  <div className="col-12">
                    <label htmlFor="oldPassword" className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="oldPassword"
                      name="oldPassword"
                      value={settingsData.oldPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={settingsData.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={settingsData.confirmNewPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary">
                <FaTimes className="me-1" /> Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#6EB2CC', borderColor: '#6EB2CC' }}>
                <FaSave className="me-1" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;