import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import axiosInstance from "../../Api/axiosInstance";

const SuperAdminAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // 🔁 FETCH ADMINS
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axiosInstance.get("/auth/admins");
        if (response.data.success && Array.isArray(response.data.admins)) {
          setAdmins(response.data.admins);
        } else {
          setAdmins([]);
        }
      } catch (error) {
        console.error("Failed to fetch admins:", error);
        setAdmins([]);
        alert("Failed to load admin list.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // 🔁 FETCH PLANS
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get("/plans");
        if (response.data.success && Array.isArray(response.data.plans)) {
          setPlans(response.data.plans);
        } else {
          setPlans([]);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        setPlans([]);
        alert("Failed to load plans.");
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // 🔁 FETCH BRANCHES
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get("/branches");
        if (response.data.success && Array.isArray(response.data.branches)) {
          setBranches(response.data.branches);
        } else {
          setBranches([]);
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        setBranches([]);
        alert("Failed to load branches.");
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const getBranchNameById = (branchId) => {
    if (!branchId) return "Not Assigned";
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.name : "Unknown Branch";
  };

  const handleAddNew = () => {
    setModalType("add");
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleView = (admin) => {
    setModalType("view");
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleEdit = (admin) => {
    setModalType("edit");
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAdmin) {
      try {
        const response = await axiosInstance.delete(
          `/auth/user/${selectedAdmin.id}`
        );
        if (response.data.success) {
          setAdmins(admins.filter((admin) => admin.id !== selectedAdmin.id));
          alert(`Admin "${selectedAdmin.fullName}" has been deleted successfully.`);
        } else {
          throw new Error("Failed to delete admin");
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
        alert("Failed to delete admin. Please try again.");
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedAdmin(null);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAdmin(null);
  };

  useEffect(() => {
    document.body.style.overflow = isModalOpen || isDeleteModalOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, isDeleteModalOpen]);

  const getStatusBadge = (status) => {
    const normalized = (status || "inactive").toLowerCase();
    return (
      <span
        className="badge rounded-pill px-2 py-1 d-inline-block"
        style={{
          backgroundColor: normalized === "active" ? "#D1F4E1" : "#F8D7DA",
          color: normalized === "active" ? "#157347" : "#B02A37",
          fontWeight: "500",
          fontSize: "0.75rem",
        }}
      >
        {normalized === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "add": return "Add New Admin";
      case "edit": return "Edit Admin";
      case "view": return "Admin Details";
      default: return "Admin Management";
    }
  };

  const handleFormSubmit = async (payload, profileImageFile) => {
    try {
      const formData = new FormData();

      // Always send these fields
      formData.append("fullName", payload.fullName);
      formData.append("email", payload.email);
      formData.append("phone", payload.phone);
      formData.append("roleId", 2);
      formData.append("branchId", payload.branchId || "");
      formData.append("gymName", payload.gymName);
      formData.append("address", payload.address);
      formData.append("planName", payload.planName);
      formData.append("price", payload.planPrice);
      formData.append("duration", payload.planDuration);
      formData.append("description", payload.planDescription);
      formData.append("status", payload.status.toLowerCase());

      // Only include password when adding
      if (modalType === "add") {
        formData.append("password", payload.password);
      }

      // Append image only if provided
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      let response;
      if (modalType === "add") {
        response = await axiosInstance.post("/auth/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (modalType === "edit" && selectedAdmin) {
        response = await axiosInstance.put(`/auth/user/${selectedAdmin.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response?.data?.success) {
        if (modalType === "add") {
          setAdmins([...admins, response.data.user]);
          alert("New admin added successfully!");
        } else {
          const updatedAdmins = admins.map((admin) =>
            admin.id === selectedAdmin.id ? response.data.user : admin
          );
          setAdmins(updatedAdmins);
          alert("Admin updated successfully!");
        }
        closeModal();
      } else {
        throw new Error("Operation failed");
      }
    } catch (error) {
      console.error("Error saving admin:", error);
      alert(`Failed to ${modalType === "add" ? "add" : "update"} admin.`);
    }
  };

  return (
    <div className="container-fluid p-2 p-sm-3 p-md-4">
      {/* HEADER */}
      <div className="row mb-3 mb-md-4 align-items-center">
        <div className="col-12 col-md-8 mb-3 mb-md-0">
          <h2 className="fw-bold fs-4 fs-md-3">Admin Management</h2>
          <p className="text-muted fs-6">Manage all gym admins and their profile details.</p>
        </div>
        <div className="col-12 col-md-4 text-md-end">
          <button
            className="btn w-100 w-md-auto"
            style={{
              backgroundColor: "#6EB2CC",
              color: "#fff",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
            onClick={handleAddNew}
            disabled={loading}
          >
            + Add New Admin
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-4">Loading admins...</div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", background: "#ffffff" }}>
          <div className="card-body p-0">
            {/* DESKTOP TABLE */}
            <div className="table-responsive d-none d-md-block">
              <table className="table align-middle mb-0">
                <thead style={{ background: "#F8F9FB" }}>
                  <tr>
                    <th className="py-3">PROFILE</th>
                    <th className="py-3">ADMIN NAME</th>
                    <th className="py-3">PLAN NAME</th>
                    <th className="py-3">GYM NAME</th>
                    <th className="py-3">BRANCH</th>
                    <th className="py-3">ADDRESS</th>
                    <th className="py-3">CONTACT</th>
                    <th className="py-3">STATUS</th>
                    <th className="py-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr
                        key={admin.id}
                        style={{ transition: "0.3s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F1FBFF")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="text-center">
                          <div
                            className="rounded-circle overflow-hidden mx-auto"
                            style={{ width: "40px", height: "40px", border: "1px solid #eee" }}
                          >
                            {admin.profileImage ? (
                              <img
                                src={admin.profileImage.trim()} // ⚠️ Trim whitespace from URL
                                alt="Profile"
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                  e.target.src = '/assets/images/default-avatar.png'; // optional fallback
                                }}
                              />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                                <span className="text-muted" style={{ fontSize: '0.65rem' }}>?</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong>{admin.fullName}</strong>
                        </td>
                        <td>{admin.planName || <span className="text-muted">No Plan</span>}</td>
                        <td>{admin.gymName || "-"}</td>
                        <td>{getBranchNameById(admin.branchId)}</td>
                        <td><small className="text-muted">{admin.address || "-"}</small></td>
                        <td>{admin.phone || "-"}</td>
                        <td>{getStatusBadge(admin.status)}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => handleView(admin)}>
                              <FaEye size={14} />
                            </button>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(admin)}>
                              <FaEdit size={14} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(admin)}>
                              <FaTrashAlt size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW */}
            <div className="d-md-none p-3">
              {admins.length === 0 ? (
                <div className="text-center text-muted py-4">No admins found</div>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="card mb-3 shadow-sm" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0 fw-bold">{admin.fullName}</h5>
                        {getStatusBadge(admin.status)}
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Gym</small>
                          <span>{admin.gymName || "-"}</span>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Plan</small>
                          <span>{admin.planName || <span className="text-muted">No Plan</span>}</span>
                        </div>
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-12">
                          <small className="text-muted d-block">Branch</small>
                          <span>{getBranchNameById(admin.branchId)}</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Address</small>
                        <span>{admin.address || "-"}</span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Phone</small>
                        <span>{admin.phone || "-"}</span>
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleView(admin)}>
                          <FaEye size={14} />
                        </button>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(admin)}>
                          <FaEdit size={14} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(admin)}>
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isModalOpen && (
        <ModalWrapper title={getModalTitle()} onClose={closeModal}>
          <AdminForm
            mode={modalType}
            admin={selectedAdmin}
            onCancel={closeModal}
            onSubmit={handleFormSubmit}
            plans={plans}
            loadingPlans={loadingPlans}
            branches={branches}
            loadingBranches={loadingBranches}
          />
        </ModalWrapper>
      )}

      {isDeleteModalOpen && (
        <ModalWrapper title="Confirm Deletion" onClose={closeDeleteModal}>
          <div className="text-center py-4">
            <h5>Are you sure?</h5>
            <p className="text-muted">
              This will permanently delete <strong>{selectedAdmin?.fullName}</strong>.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn btn-outline-secondary px-4" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className="btn btn-danger px-4" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

/* ------------------------- MODAL WRAPPER ------------------------- */
const ModalWrapper = ({ title, children, onClose }) => (
  <div
    className="modal fade show"
    style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
    onClick={onClose}
  >
    <div
      className="modal-dialog modal-dialog-centered modal-md"
      style={{ maxWidth: "600px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-content p-0" style={{ borderRadius: "14px" }}>
        <div className="modal-header border-0 py-2 px-3">
          <h5 className="modal-title fw-bold fs-5">{title}</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body p-3">{children}</div>
      </div>
    </div>
  </div>
);

/* --------------------------- ADMIN FORM -------------------------- */
const AdminForm = ({ mode, admin, onCancel, onSubmit, plans, loadingPlans, branches, loadingBranches }) => {
  const isView = mode === "view";
  const isAdd = mode === "add";
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: admin?.fullName || "",
    gymName: admin?.gymName || "",
    address: admin?.address || "",
    phone: admin?.phone || "",
    email: admin?.email || "",
    password: "",
    status: admin?.status || "active",
    selectedPlanId: "",
    planName: admin?.planName || "",
    planPrice: admin?.price || "",
    planDuration: admin?.duration || "",
    planDescription: admin?.description || "",
    branchId: admin?.branchId || "",
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(admin?.profileImage || null);

  useEffect(() => {
    if (admin && plans.length > 0 && admin.planName) {
      const matchedPlan = plans.find(
        (p) => p.name === admin.planName && p.price.toString() === (admin.price || "").toString()
      );
      if (matchedPlan) {
        setFormData((prev) => ({ ...prev, selectedPlanId: matchedPlan.id }));
      }
    }
    if (admin?.profileImage) {
      setProfilePreview(admin.profileImage);
    } else {
      setProfilePreview(null);
    }
  }, [admin, plans]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanChange = (planId) => {
    const selectedPlan = plans.find((p) => p.id == planId);
    if (selectedPlan) {
      setFormData((prev) => ({
        ...prev,
        selectedPlanId: planId,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price.toString(),
        planDuration: selectedPlan.duration,
        planDescription: selectedPlan.description || `Plan for ${selectedPlan.duration} @ ₹${selectedPlan.price}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedPlanId: "",
        planName: "",
        planPrice: "",
        planDuration: "",
        planDescription: "",
      }));
    }
  };

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active",
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isView) return onCancel();
    onSubmit(formData, profileImageFile);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Profile Image */}
      <div className="mb-4 text-center">
        <h6 className="fw-bold mb-2 text-primary">Profile Picture</h6>
        <div
          className="mx-auto rounded-circle overflow-hidden mb-2"
          style={{ width: "100px", height: "100px", border: "2px solid #eee" }}
        >
          {profilePreview ? (
            <img
              src={profilePreview}
              alt="Profile"
              className="w-100 h-100 object-fit-cover"
            />
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
              <span className="text-muted">No Image</span>
            </div>
          )}
        </div>
        {!isView && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="form-control form-control-sm"
            />
            <small className="text-muted">Allowed: JPG, PNG (Max 5MB)</small>
          </div>
        )}
      </div>

      {/* Personal Info */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3 text-primary">Personal Information</h6>
        <div className="row g-2 mb-3">
          <div className="col-12">
            <label className="form-label fs-6">Full Name *</label>
            <input
              name="fullName"
              className="form-control form-control-sm"
              value={formData.fullName}
              onChange={handleInputChange}
              readOnly={isView}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fs-6">Gym Name *</label>
            <input
              name="gymName"
              className="form-control form-control-sm"
              value={formData.gymName}
              onChange={handleInputChange}
              readOnly={isView}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fs-6">Branch Name *</label>
            {loadingBranches ? (
              <div className="form-control form-control-sm" disabled>
                Loading branches...
              </div>
            ) : (
              <select
                name="branchId"
                className="form-select form-select-sm"
                value={formData.branchId}
                onChange={handleInputChange}
                disabled={isView}
                required
              >
                <option value="">-- Select Branch --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fs-6">Phone *</label>
            <input
              name="phone"
              className="form-control form-control-sm"
              value={formData.phone}
              onChange={handleInputChange}
              readOnly={isView}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fs-6">Email *</label>
            <input
              name="email"
              type="email"
              className="form-control form-control-sm"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={isView}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fs-6">Address *</label>
            <input
              name="address"
              className="form-control form-control-sm"
              value={formData.address}
              onChange={handleInputChange}
              readOnly={isView}
              required
            />
          </div>
        </div>
      </div>

      {/* Login Info */}
      {isAdd && (
        <div className="mb-4">
          <h6 className="fw-bold mb-3 text-primary">Login Information</h6>
          <div className="row g-2 mb-3">
            <div className="col-12">
              <label className="form-label fs-6">Password *</label>
              <input
                name="password"
                type="password"
                className="form-control form-control-sm"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Plan Info */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3 text-primary">Plan Information</h6>
        <div className="row g-2 mb-3">
          <div className="col-12">
            <label className="form-label fs-6">Select Plan</label>
            {loadingPlans ? (
              <div className="form-control form-control-sm" disabled>
                Loading plans...
              </div>
            ) : (
              <select
                className="form-select form-select-sm"
                value={formData.selectedPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                disabled={isView}
              >
                <option value="">-- Choose Plan --</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (₹{plan.price}, {plan.duration})
                  </option>
                ))}
              </select>
            )}
          </div>

          {formData.selectedPlanId && (
            <>
              <div className="col-12 col-md-6">
                <label className="form-label fs-6">Price</label>
                <input
                  className="form-control form-control-sm"
                  value={formData.planPrice}
                  readOnly
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fs-6">Duration</label>
                <input
                  className="form-control form-control-sm"
                  value={formData.planDuration}
                  readOnly
                />
              </div>
              <div className="col-12">
                <label className="form-label fs-6">Description</label>
                <textarea
                  name="planDescription"
                  className="form-control form-control-sm"
                  rows="2"
                  value={formData.planDescription}
                  onChange={handleInputChange}
                  readOnly={isView}
                ></textarea>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="d-flex align-items-center mb-3">
        <label className="form-label me-3 mb-0 fs-6">Status</label>
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.status === "active"}
            onChange={handleStatusToggle}
            disabled={isView}
          />
          <span className="ms-2">{formData.status === "active" ? "Active" : "Inactive"}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onCancel}>
          Close
        </button>
        {!isView && (
          <button
            type="submit"
            className="btn btn-sm px-3"
            style={{ background: "#6EB2CC", color: "#fff" }}
          >
            {mode === "add" ? "Save Admin" : "Update Admin"}
          </button>
        )}
      </div>
    </form>
  );
};

export default SuperAdminAdmin;