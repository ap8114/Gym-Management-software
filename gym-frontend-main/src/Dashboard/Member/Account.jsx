import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import GetAdminId from "../../Api/GetAdminId";
import axiosInstance from "../../Api/axiosInstance";

const Account = () => {
  const adminId = GetAdminId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
<<<<<<< HEAD
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

=======
  const [isEditMode, setIsEditMode] = useState(false); // New state for edit mode
  const [saving, setSaving] = useState(false); // State for saving
  const [updatingPassword, setUpdatingPassword] = useState(false); // State for password update
  const [userRole, setUserRole] = useState(""); // New state for user role
  
>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
  const [personal, setPersonal] = useState({
    member_id: "M23456789",
    first_name: "",
    last_name: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    profile_picture: null,
    profile_preview: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  const [membership, setMembership] = useState({
    membership_plan: "",
    plan_start_date: "",
    plan_end_date: "",
    status: "", // maps to membership_status
    membership_fee: "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    newMatch: "",
    minLength: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!adminId) {
        setError("Admin ID not found. Please log in again.");
        setShowErrorAlert(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`member-self/profile/${adminId}`);

        if (response.data.success && response.data.profile) {
          const profile = response.data.profile;
<<<<<<< HEAD

          // ✅ CORRECT FIELD MAPPING FROM API RESPONSE
=======
          
          // Set user role if available in the response
          if (profile.role) {
            setUserRole(profile.role);
          } else {
            // Try to get role from GetAdminId or localStorage
            const storedRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
            if (storedRole) {
              setUserRole(storedRole);
            } else {
              // If role is not explicitly provided, assume it's a member
              setUserRole("MEMBER");
            }
          }
          
          // Update personal information
>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
          setPersonal({
            member_id: `M${profile.userId}`,
            first_name: profile.first_name || "",
<<<<<<< HEAD
            last_name: profile.last_name || "", // ✅ Fixed: was profile.first_name!
            gender: profile.gender || "",
            dob: profile.date_of_birth || "", // ✅ API field is date_of_birth
=======
            last_name: profile.last_name || "",
            gender: profile.gender || "",
            dob: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : "",
>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
            email: profile.email || "",
            phone: profile.phone || "",
            address_street: profile.address_street || "",
            address_city: profile.address_city || "",
            address_state: profile.address_state || "",
            address_zip: profile.address_zip || "",
            profile_picture: null,
            profile_preview: "https://randomuser.me/api/portraits/men/32.jpg",
          });

          // ✅ Membership: only use fields that exist
          setMembership({
            membership_plan: profile.membership_plan || "",
            plan_start_date: profile.plan_start_date || "",
            plan_end_date: profile.plan_end_date || "",
<<<<<<< HEAD
            status: profile.membership_status || "", // ✅ Correct field
=======
            status: profile.membership_status || "",
            membership_type: profile.membership_type || "",
>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
            membership_fee: profile.membership_fee || "",
          });

          setError(null);
          setShowErrorAlert(false);
        } else {
          setError("Data not found");
          setShowErrorAlert(true);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile");
        setShowErrorAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [adminId]);

  const handlePersonalChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture" && files?.[0]) {
      const file = files[0];
      setPersonal((p) => ({
        ...p,
        profile_picture: file,
        profile_preview: URL.createObjectURL(file),
      }));
    } else {
      setPersonal((p) => ({ ...p, [name]: value }));
    }
  };

  const handleMembershipChange = (e) => {
    const { name, value } = e.target;
    setMembership((m) => ({ ...m, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((p) => ({ ...p, [name]: value }));

    if (name === "new") {
      setPasswordErrors((prev) => ({
        ...prev,
        minLength: value.length < 8 ? "Password must be at least 8 characters" : "",
        newMatch: password.confirm && value !== password.confirm ? "Passwords do not match" : "",
      }));
    }

    if (name === "confirm") {
      setPasswordErrors((prev) => ({
        ...prev,
        newMatch: value !== password.new ? "Passwords do not match" : "",
      }));
    }
  };

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      setSaving(true);
      try {
        // ✅ Send correct field names (snake_case as per API)
        const payload = {
          first_name: personal.first_name,
          last_name: personal.last_name,
          email: personal.email,
          phone: personal.phone,
          gender: personal.gender,
<<<<<<< HEAD
          date_of_birth: personal.dob, // ✅ snake_case
=======
          date_of_birth: personal.dob,
>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
          address_street: personal.address_street,
          address_city: personal.address_city,
          address_state: personal.address_state,
          address_zip: personal.address_zip,
        };

        const response = await axiosInstance.put(`member-self/profile/${adminId}`, payload);

        if (response.data.success) {
          const updatedProfile = response.data.profile;
          setPersonal({
            member_id: `M${updatedProfile.userId}`,
            first_name: updatedProfile.first_name || "",
            last_name: updatedProfile.last_name || "",
            gender: updatedProfile.gender || "",
<<<<<<< HEAD
            dob: updatedProfile.date_of_birth || "", // ✅
=======
            dob: updatedProfile.date_of_birth ? updatedProfile.date_of_birth.split('T')[0] : "",
>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
            email: updatedProfile.email || "",
            phone: updatedProfile.phone || "",
            address_street: updatedProfile.address_street || "",
            address_city: updatedProfile.address_city || "",
            address_state: updatedProfile.address_state || "",
            address_zip: updatedProfile.address_zip || "",
            profile_picture: personal.profile_picture,
            profile_preview: personal.profile_preview,
          });

          setMembership({
            membership_plan: updatedProfile.membership_plan || "",
            plan_start_date: updatedProfile.plan_start_date || "",
            plan_end_date: updatedProfile.plan_end_date || "",
<<<<<<< HEAD
            status: updatedProfile.membership_status || "", // ✅
=======
            status: updatedProfile.membership_status || "",
            membership_type: updatedProfile.membership_type || "",
>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
            membership_fee: updatedProfile.membership_fee || "",
          });

          alert("Profile updated successfully!");
          setIsEditMode(false);
        } else {
          alert("Failed to update profile. Please try again.");
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to update profile. Please try again.");
      } finally {
        setSaving(false);
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!password.new || !password.confirm || passwordErrors.minLength || passwordErrors.newMatch) {
      alert("Please fix password errors before saving.");
      return;
    }
    if (password.new !== password.confirm) {
      alert("New passwords do not match!");
      return;
    }
    if (password.current.trim() === "") {
      alert("Current password is required!");
      return;
    }

    try {
      setUpdatingPassword(true);
      const payload = {
        current: password.current,
        new: password.new,
      };

      const response = await axiosInstance.put(`member-self/password/${adminId}`, payload);

      if (response.data.success) {
        alert("Password updated successfully!");
        setPassword({ current: "", new: "", confirm: "" });
      } else {
        alert("Failed to update password. Please try again.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Failed to update password. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const todayISO = format(new Date(), "yyyy-MM-dd");

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="container py-2">
      {showErrorAlert && (
        <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
          <strong>Warning!</strong> {error || "Data not found"}.
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowErrorAlert(false)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="fw-bold mb-0">Personal Information</h1>
                <button
                  className={`btn ${isEditMode ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleEditModeToggle}
                >
                  {isEditMode ? 'Cancel' : 'Update Profile'}
                </button>
              </div>

<<<<<<< HEAD
=======
              {/* Profile Picture Section - Enhanced */}
              <div className="text-center mb-4">
               
              </div>

>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Member ID</label>
                    <input
                      className="form-control"
                      value={personal.member_id}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      name="first_name"
                      className="form-control"
                      value={personal.first_name}
                      onChange={handlePersonalChange}
                      required
                      readOnly={!isEditMode}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      name="last_name"
                      className="form-control"
                      value={personal.last_name}
                      onChange={handlePersonalChange}
                      required
                      readOnly={!isEditMode}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      className="form-select"
                      value={personal.gender}
                      onChange={handlePersonalChange}
                      disabled={!isEditMode}
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      className="form-control"
                      value={personal.dob}
                      onChange={handlePersonalChange}
                      max={todayISO}
                      readOnly={!isEditMode}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={personal.email}
                      onChange={handlePersonalChange}
                      required
                      readOnly={!isEditMode}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={personal.phone}
                      onChange={handlePersonalChange}
                      required
                      readOnly={!isEditMode}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address (optional)</label>
                    <div className="row g-2">
                      <div className="col-12">
                        <input
                          name="address_street"
                          className="form-control"
                          placeholder="Street address"
                          value={personal.address_street}
                          onChange={handlePersonalChange}
                          readOnly={!isEditMode}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <input
                          name="address_city"
                          className="form-control"
                          placeholder="City"
                          value={personal.address_city}
                          onChange={handlePersonalChange}
                          readOnly={!isEditMode}
                        />
                      </div>
                      <div className="col-6 col-sm-3">
                        <input
                          name="address_state"
                          className="form-control"
                          placeholder="State"
                          value={personal.address_state}
                          onChange={handlePersonalChange}
                          readOnly={!isEditMode}
                        />
                      </div>
                      <div className="col-6 col-sm-3">
                        <input
                          name="address_zip"
                          className="form-control"
                          placeholder="Zip / Pincode"
                          value={personal.address_zip}
                          onChange={handlePersonalChange}
                          readOnly={!isEditMode}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {isEditMode && (
                  <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleEditModeToggle}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

<<<<<<< HEAD
=======
          {/* Membership Info - Only show for members */}
          {userRole === "MEMBER" && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Membership Information</h5>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Membership Plan</label>
                    <input
                      name="membership_plan"
                      className="form-control"
                      placeholder="e.g. Gold 12 Months"
                      value={membership.membership_plan}
                      onChange={handleMembershipChange}
                      readOnly
                    />
                  </div>
                  <div className="col-6 col-sm-3">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      name="plan_start_date"
                      className="form-control"
                      value={membership.plan_start_date}
                      onChange={handleMembershipChange}
                      readOnly
                    />
                  </div>
                  <div className="col-6 col-sm-3">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      name="plan_end_date"
                      className="form-control"
                      value={membership.plan_end_date}
                      onChange={handleMembershipChange}
                      readOnly
                    />
                  </div>
                  <div className="col-6 col-sm-3">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={membership.status}
                      onChange={handleMembershipChange}
                      disabled
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Expired</option>
                    </select>
                  </div>
                  <div className="col-6 col-sm-3">
                    <label className="form-label">Membership Type</label>
                    <select
                      name="membership_type"
                      className="form-select"
                      value={membership.membership_type}
                      onChange={handleMembershipChange}
                      disabled
                    >
                      <option>Standard</option>
                      <option>Premium</option>
                      <option>VIP</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-3">
                    <label className="form-label">Membership Fee</label>
                    <input
                      type="number"
                      name="membership_fee"
                      className="form-control"
                      placeholder="₹"
                      value={membership.membership_fee}
                      onChange={handleMembershipChange}
                      min="0"
                      step="0.01"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

>>>>>>> ca7bddea173ce40ed07ede983436184041549b84
          {/* Password Change Section */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Change Password</h5>
              <p className="text-muted small">
                Enter your current password and set a new one. Password must be at least 8 characters.
              </p>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="current"
                    className="form-control"
                    value={password.current}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="new"
                    className={`form-control ${passwordErrors.minLength || passwordErrors.newMatch ? 'is-invalid' : ''}`}
                    value={password.new}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordErrors.minLength && (
                    <div className="invalid-feedback">{passwordErrors.minLength}</div>
                  )}
                  {passwordErrors.newMatch && (
                    <div className="invalid-feedback">{passwordErrors.newMatch}</div>
                  )}
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirm"
                    className={`form-control ${passwordErrors.newMatch ? 'is-invalid' : ''}`}
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordErrors.newMatch && (
                    <div className="invalid-feedback">{passwordErrors.newMatch}</div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={updatingPassword}
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;