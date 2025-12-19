import React, { useState, useEffect } from "react";
import axiosInstance from "../../Api/axiosInstance";
import BaseUrl from "../../Api/BaseUrl";
import {
  Search,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Filter,
} from "lucide-react";
import GetAdminId from "../../Api/GetAdminId";

const AdminMember = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  // Plans state
  const [apiPlans, setApiPlans] = useState([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [planError, setPlanError] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
      return null;
    }
  };

  const user = getUserFromStorage();
  const memberId = user?.id || null;
  const branchId = user?.branchId || null;
  const name = user?.fullName || null;
  const staffId = user?.staffId || null;
  const adminId = GetAdminId();
  // Form states
  const [newMember, setNewMember] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    planId: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    startDate: new Date().toISOString().split("T")[0],
    paymentMode: "cash",
    amountPaid: "",
    interestedIn: "",
    status: "Active",
    profileImage: null, // Store file object directly
    profileImagePreview: "", // For preview
  });

  const [editMember, setEditMember] = useState({
    id: "",
    fullName: "",
    phone: "",
    email: "",
    planId: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    interestedIn: "",
    status: "Active",
    profileImage: null, // Store file object directly
    profileImagePreview: "", // For preview
    existingProfileImage: "", // Store existing image URL
  });

  const [renewPlan, setRenewPlan] = useState({
    memberId: "",
    plan: "",
    paymentMode: "cash",
    amountPaid: "",
  });

  // Handle profile image change for both add and edit forms
  const handleProfileImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditMember({
            ...editMember,
            profileImage: file, // Store the actual file
            profileImagePreview: reader.result, // For preview
          });
        } else {
          setNewMember({
            ...newMember,
            profileImage: file, // Store the actual file
            profileImagePreview: reader.result, // For preview
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter members based on search term and status
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "" || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Fetch members by admin ID
  const fetchMembersByAdminId = async () => {
    setMembersLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BaseUrl}members/admin/${adminId}`
      );

      if (response.data && response.data.success) {
        const formattedMembers = response.data.data.map((member) => ({
          id: member.id,
          name: member.fullName,
          phone: member.phone,
          email: member.email,
          gender: member.gender,
          plan: getPlanNameById(member.planId),
          planId: member.planId,
          address: member.address,
          dob: member.dateOfBirth,
          planStart: member.membershipFrom,
          expiry: member.membershipTo,
          status: member.status,
          interestedIn: member.interestedIn,
          profileImage: member.profileImage || "", // ✅ ADD THIS LINE
        }));

        setMembers(formattedMembers);
        console.log("Members loaded successfully:", formattedMembers);
      } else {
        console.error("API response error:", response.data);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  // Fetch a single member by ID
  const fetchMemberById = async (id) => {
    try {
      // Add BaseUrl prefix and fix the endpoint
      const response = await axiosInstance.get(
        `${BaseUrl}members/detail/${id}`
      );
      console.log("API response for member detail:", response.data);

      if (response.data?.success) {
        const member = response.data.data;
        return {
          id: member.id,
          name: member.fullName,
          phone: member.phone,
          email: member.email,
          gender: member.gender,
          plan: getPlanNameById(member.planId), // This might fail if plans aren't loaded yet
          planId: member.planId,
          address: member.address,
          dob: member.dateOfBirth,
          // Fix typos in property names
          planStart: member.membershipFrom,
          expiry: member.membershipTo,
          status: member.status,
          interestedIn: member.interestedIn,
          profileImage: member.profileImage || "",
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching member:", err);
      return null;
    }
  };

  // Fetch plans from API
  const fetchPlansFromAPI = async () => {
    setPlanLoading(true);
    setPlanError(null);

    try {
      const response = await axiosInstance.get(
        `${BaseUrl}MemberPlan?adminId=${adminId}`
      );

      if (response.data && response.data.success) {
        // FIX: Keep the original case for 'type' and include 'trainerType'
        const formattedPlans = response.data.plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          sessions: plan.sessions,
          validity: plan.validityDays,
          price: `₹${plan.price.toLocaleString()}`,
          active: true,
          type: plan.type, // Keep original case (e.g., "PERSONAL", "GROUP", "MEMBER")
          trainerType: plan.trainerType, // Include trainerType
        }));

        setApiPlans(formattedPlans);
        setPlansLoaded(true);
        console.log("Plans loaded successfully:", formattedPlans);
      } else {
        setPlanError("Failed to fetch plans. Please try again.");
        console.error("API response error:", response.data);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setPlanError(
        err.response?.data?.message ||
        "Failed to fetch plans. Please try again."
      );
    } finally {
      setPlanLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchMembersByAdminId();
    fetchPlansFromAPI();
  }, []);

  // Handle add member with API call
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();

      // Append all member data
      formData.append("adminId", adminId);
      formData.append("fullName", newMember.fullName);
      formData.append("email", newMember.email);
      formData.append("password", newMember.password);
      formData.append("phone", newMember.phone);
      formData.append("gender", newMember.gender);
      formData.append("dateOfBirth", newMember.dateOfBirth);
      formData.append("address", newMember.address);
      formData.append("interestedIn", newMember.interestedIn);
      formData.append("planId", newMember.planId);
      formData.append("membershipFrom", newMember.startDate);
      formData.append(
        "paymentMode",
        newMember.paymentMode.charAt(0).toUpperCase() +
        newMember.paymentMode.slice(1)
      );
      formData.append("amountPaid", newMember.amountPaid);
      formData.append("status", newMember.status);

      // Append image if selected
      if (newMember.profileImage) {
        formData.append("profileImage", newMember.profileImage);
      }

      // Make API call with FormData
      const response = await axiosInstance.post(
        `${BaseUrl}members/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        // Refresh members list
        await fetchMembersByAdminId();

        setNewMember({
          fullName: "",
          phone: "",
          email: "",
          password: "",
          planId: "",
          address: "",
          gender: "",
          dateOfBirth: "",
          startDate: new Date().toISOString().split("T")[0],
          paymentMode: "cash",
          amountPaid: "",
          interestedIn: "",
          status: "Active",
          profileImage: null,
          profileImagePreview: "",
        });

        setShowAddForm(false);
        alert("Member added successfully!");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit member with API call
  const handleEditMember = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();

      // Append all member data
      formData.append("adminId", adminId);
      formData.append("fullName", editMember.fullName);
      formData.append("email", editMember.email);
      formData.append("phone", editMember.phone);
      formData.append("gender", editMember.gender);
      formData.append("address", editMember.address);
      formData.append("dateOfBirth", editMember.dateOfBirth);
      formData.append("interestedIn", editMember.interestedIn);
      formData.append("status", editMember.status);
      formData.append("planId", editMember.planId);

      // Append image if selected
      if (editMember.profileImage) {
        formData.append("profileImage", editMember.profileImage);
      }

      // Make API call with FormData
      const response = await axiosInstance.put(
        `${BaseUrl}members/update/${editMember.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.success) {
        // Refresh members list to get updated data
        await fetchMembersByAdminId();

        setShowEditForm(false);
        alert("Member updated successfully!");
      } else {
        alert("Failed to update member. Please try again.");
      }
    } catch (error) {
      console.error("Error updating member:", error);
      alert("Failed to update member. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setDeleteLoading(true);

      try {
        const response = await axiosInstance.delete(
          `${BaseUrl}members/delete/${id}`
        );

        if (response.data && response.data.success) {
          // Refresh members list
          await fetchMembersByAdminId();

          alert("Member deleted successfully!");
        } else {
          alert("Failed to delete member. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting member:", error);
        alert("Failed to delete member. Please try again.");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleEditFormOpen = (member) => {
    try {
      console.log("Opening edit form for member:", member);

      // Use the member data directly from the list
      setEditMember({
        id: member.id,
        fullName: member.name,
        email: member.email,
        phone: member.phone,
        gender: member.gender,
        address: member.address,
        dateOfBirth: member.dob,
        interestedIn: member.interestedIn,
        status: member.status,
        planId: member.planId,
        profileImage: null,
        profileImagePreview: member.profileImage || "",
        existingProfileImage: member.profileImage || "",
      });
      setShowEditForm(true);
    } catch (error) {
      console.error("Error in handleEditFormOpen:", error);
      alert("An error occurred while opening the edit form. Please try again.");
    }
  };

  const handleRenewPlan = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        adminId: adminId,
        planId: parseInt(renewPlan.plan),
        paymentMode:
          renewPlan.paymentMode.charAt(0).toUpperCase() +
          renewPlan.paymentMode.slice(1),
        amountPaid: parseFloat(renewPlan.amountPaid),
      };

      const response = await axiosInstance.put(
        `${BaseUrl}members/renew/${renewPlan.memberId}`,
        payload
      );

      if (response.data && response.data.success) {
        // Refresh members list to get updated data
        await fetchMembersByAdminId();

        setRenewPlan({
          memberId: "",
          plan: "",
          paymentMode: "cash",
          amountPaid: "",
        });
        setShowRenewForm(false);
        alert("Membership renewed successfully!");
      } else {
        alert("Failed to renew membership. Please try again.");
      }
    } catch (error) {
      console.error("Error renewing membership:", error);
      alert("Failed to renew membership. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRenewFormOpen = (member) => {
    setRenewPlan({
      ...renewPlan,
      memberId: member.id.toString(),
      plan: member.planId, // Use planId here as well
    });
    setShowRenewForm(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-success";
      case "Inactive":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  const getPlanNameById = (planId) => {
    if (!planId || apiPlans.length === 0) return "Unknown Plan";
    const plan = apiPlans.find((p) => p.id === parseInt(planId));
    return plan ? plan.name : "Unknown Plan";
  };

  // Get filtered plans based on API response structure
  const getFilteredPlans = (interestedIn) => {
    if (!plansLoaded || apiPlans.length === 0) {
      console.log("Plans not loaded or empty.");
      return [];
    }

    let filtered = [];
    switch (interestedIn) {
      case "Personal Training":
        // Filter for plans where type is "PERSONAL"
        filtered = apiPlans.filter((plan) => plan.type === "PERSONAL");
        break;
      case "Personal Trainer":
        // Filter for plans where trainerType is "personal"
        filtered = apiPlans.filter((plan) => plan.trainerType === "personal");
        break;
      case "General Trainer":
        // Filter for plans where trainerType is "general"
        filtered = apiPlans.filter((plan) => plan.trainerType === "general");
        break;
      case "Group Classes":
        // Filter for plans where type is "GROUP"
        filtered = apiPlans.filter((plan) => plan.type === "GROUP");
        break;
      default:
        filtered = [];
        break;
    }
    console.log(`Filtering for "${interestedIn}":`, filtered);
    return filtered;
  };

  return (
    <div className="container-fluid py-2 py-md-4">
      {/* Header - Responsive */}
      <div className="row mb-3 mb-md-4 align-items-center">
        <div className="col-12 col-md-6 mb-3 mb-md-0">
          <h2 className="fw-bold mb-0 text-center text-md-start">
            Members Management
          </h2>
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex justify-content-center justify-content-md-end">
            <button
              className="btn text-white w-100 w-md-auto"
              style={{ backgroundColor: "#6EB2CC" }}
              onClick={() => setShowAddForm(true)}
            >
              <UserPlus size={18} className="me-2" />
              <span className="d-none d-sm-inline">Add Member</span>
              <span className="d-sm-none">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter - Responsive */}
      <div className="row mb-3 mb-md-4 g-2 g-md-3">
        <div className="col-12 col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Table - Responsive */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {/* Desktop Table View */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Plan</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {membersLoading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></div>
                        Loading members...
                      </td>
                    </tr>
                  ) : filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td>
                          {member.profileImage ? (
                            <img
                              src={member.profileImage}
                              alt="Profile"
                              className="rounded-circle"
                              style={{
                                width: "36px",
                                height: "36px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white"
                              style={{ width: "36px", height: "36px" }}
                            >
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </td>
                        <td>{member.name}</td>
                        <td>{member.phone}</td>
                        <td>{member.email}</td>
                        <td>{member.gender}</td>
                        <td>{getPlanNameById(member.planId)}</td>
                        <td>{new Date(member.expiry).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`badge ${getStatusClass(member.status)}`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewMember(member)}
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleEditFormOpen(member)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                color: "#6EB2CC",
                                borderColor: "#6EB2CC",
                              }}
                              onClick={() => handleRenewFormOpen(member)}
                              title="Renew Plan"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteMember(member.id)}
                              title="Delete"
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? (
                                <div
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        No members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none">
            {membersLoading ? (
              <div className="text-center py-4">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></div>
                Loading members...
              </div>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div key={member.id} className="border-bottom p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt="Profile"
                          className="rounded-circle me-3"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white me-3"
                          style={{ width: "50px", height: "50px" }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h6 className="mb-1 fw-bold">{member.name}</h6>
                        <span
                          className={`badge ${getStatusClass(member.status)}`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        Actions
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleViewMember(member)}
                          >
                            <Eye size={16} className="me-2" /> View
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleEditFormOpen(member)}
                          >
                            <Edit size={16} className="me-2" /> Edit
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleRenewFormOpen(member)}
                          >
                            <RefreshCw size={16} className="me-2" /> Renew
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? (
                              <>
                                <div
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 size={16} className="me-2" /> Delete
                              </>
                            )}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="row g-2 text-sm">
                    <div className="col-6">
                      <strong>Phone:</strong> {member.phone}
                    </div>
                    <div className="col-6">
                      <strong>Gender:</strong> {member.gender}
                    </div>
                    <div className="col-6">
                      <strong>Plan:</strong> {getPlanNameById(member.planId)}
                    </div>
                    <div className="col-6">
                      <strong>Expiry:</strong>{" "}
                      {new Date(member.expiry).toLocaleDateString()}
                    </div>
                    <div className="col-12">
                      <strong>Email:</strong> {member.email}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">No members found</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Member</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddForm(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <form onSubmit={handleAddMember}>
                  <div className="col-12 text-center mb-3">
                    {newMember.profileImagePreview ? (
                      <img
                        src={newMember.profileImagePreview}
                        alt="Preview"
                        className="rounded-circle"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          border: "2px solid #ddd",
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light border rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "100px", height: "100px" }}
                      >
                        <User size={40} className="text-muted" />
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control mt-2"
                      accept="image/*"
                      onChange={(e) => handleProfileImageChange(e, false)}
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={newMember.fullName}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newMember.phone}
                        onChange={(e) =>
                          setNewMember({ ...newMember, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={newMember.email}
                        onChange={(e) =>
                          setNewMember({ ...newMember, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={newMember.password}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newMember.dateOfBirth}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={newMember.status}
                        onChange={(e) =>
                          setNewMember({ ...newMember, status: e.target.value })
                        }
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Gender <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender"
                            id="male"
                            value="Male"
                            checked={newMember.gender === "Male"}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                gender: e.target.value,
                              })
                            }
                            required
                          />
                          <label className="form-check-label" htmlFor="male">
                            Male
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender"
                            id="female"
                            value="Female"
                            checked={newMember.gender === "Female"}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                gender: e.target.value,
                              })
                            }
                            required
                          />
                          <label className="form-check-label" htmlFor="female">
                            Female
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender"
                            id="other"
                            value="Other"
                            checked={newMember.gender === "Other"}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                gender: e.target.value,
                              })
                            }
                            required
                          />
                          <label className="form-check-label" htmlFor="other">
                            Other
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Interested In <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex flex-wrap gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="personalTraining"
                            value="Personal Training"
                            checked={
                              newMember.interestedIn === "Personal Training"
                            }
                            onChange={(e) => {
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                                planId: "",
                              });
                            }}
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="personalTraining"
                          >
                            Personal Training
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="personalTrainer"
                            value="Personal Trainer"
                            checked={
                              newMember.interestedIn === "Personal Trainer"
                            }
                            onChange={(e) => {
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                                planId: "",
                              });
                            }}
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="personalTrainer"
                          >
                            Personal Trainer
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="generalTrainer"
                            value="General Trainer"
                            checked={
                              newMember.interestedIn === "General Trainer"
                            }
                            onChange={(e) => {
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                                planId: "",
                              });
                            }}
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="generalTrainer"
                          >
                            General Trainer
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="groupClasses"
                            value="Group Classes"
                            checked={newMember.interestedIn === "Group Classes"}
                            onChange={(e) => {
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                                planId: "",
                              });
                            }}
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="groupClasses"
                          >
                            Group Classes
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newMember.address}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            address: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Plan <span className="text-danger">*</span>
                      </label>
                      {planLoading ? (
                        <div className="form-select text-center">
                          <div
                            className="spinner-border spinner-border-sm text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <span className="ms-2">Loading plans...</span>
                        </div>
                      ) : planError ? (
                        <div className="alert alert-danger py-2">
                          {planError}
                        </div>
                      ) : (
                        <select
                          className="form-select"
                          value={newMember.planId}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              planId: e.target.value,
                            })
                          }
                          required
                          disabled={!newMember.interestedIn}
                        >
                          <option value="">
                            {newMember.interestedIn
                              ? "Select Plan"
                              : "Please select 'Interested In' first"}
                          </option>
                          {plansLoaded &&
                            getFilteredPlans(newMember.interestedIn).map(
                              (plan) => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.name} - {plan.price} ({plan.validity}{" "}
                                  days)
                                </option>
                              )
                            )}
                        </select>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Start Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={newMember.startDate}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            startDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Payment Mode <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={newMember.paymentMode}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            paymentMode: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Amount Paid <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={newMember.amountPaid}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            amountPaid: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn text-white"
                      style={{ backgroundColor: "#6EB2CC" }}
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Member"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Member</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditForm(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <form onSubmit={handleEditMember}>
                  <div className="row g-3">
                    <div className="col-12 text-center mb-3">
                      {editMember.profileImagePreview ? (
                        <img
                          src={editMember.profileImagePreview}
                          alt="Preview"
                          className="rounded-circle"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            border: "2px solid #ddd",
                          }}
                        />
                      ) : editMember.existingProfileImage ? (
                        <img
                          src={editMember.existingProfileImage}
                          alt="Profile"
                          className="rounded-circle"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            border: "2px solid #ddd",
                          }}
                        />
                      ) : (
                        <div
                          className="bg-light border rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "100px", height: "100px" }}
                        >
                          <User size={40} className="text-muted" />
                        </div>
                      )}
                      <input
                        type="file"
                        className="form-control mt-2"
                        accept="image/*"
                        onChange={(e) => handleProfileImageChange(e, true)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editMember.fullName}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editMember.phone}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editMember.email}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={editMember.status}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            status: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Interested In <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-3 flex-wrap">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="personalTraining"
                            value="Personal Training"
                            checked={
                              newMember.interestedIn === "Personal Training"
                            }
                            onChange={(e) => {
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                                planId: "", // Reset plan selection when interested in changes
                              });
                            }}
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="personalTraining"
                          >
                            Personal Training
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="personalTrainer"
                            value="Personal Trainer"
                            checked={
                              newMember.interestedIn === "Personal Trainer"
                            }
                            onChange={(e) => {
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                                planId: "", // Reset plan selection when interested in changes
                              });
                            }}
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="personalTrainer"
                          >
                            Personal Trainer
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="general"
                            value="General"
                            checked={newMember.interestedIn === "General"}
                            onChange={(e) => {
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                                planId: "", // Reset plan selection when interested in changes
                              });
                            }}
                            required
                          />
                          <label className="form-check-label" htmlFor="general">
                            General Trainer
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="groupClasses"
                            value="Group Classes"
                            checked={newMember.interestedIn === "Group Classes"}
                            onChange={(e) => {
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                                planId: "", // Reset plan selection when interested in changes
                              });
                            }}
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="groupClasses"
                          >
                            Group Classes
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Membership Plan</label>
                      <select
                        className="form-select"
                        value={editMember.planId}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            planId: e.target.value,
                          })
                        }
                        required
                        disabled={!editMember.interestedIn}
                      >
                        <option value="">
                          {editMember.interestedIn
                            ? "Select Plan"
                            : "Please select 'Interested In' first"}
                        </option>
                        {plansLoaded &&
                          getFilteredPlans(editMember.interestedIn).map(
                            (plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name} - {plan.price} ({plan.validity}{" "}
                                days)
                              </option>
                            )
                          )}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        value={editMember.gender}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editMember.dateOfBirth}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editMember.address}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="modal-footer mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn text-white"
                      style={{ backgroundColor: "#6EB2CC" }}
                      disabled={editLoading}
                    >
                      {editLoading ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renew Plan Modal */}
      {showRenewForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Renew Membership Plan</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRenewForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleRenewPlan}>
                  <div className="mb-3">
                    <label className="form-label">Membership Plan</label>
                    <select
                      className="form-select"
                      value={renewPlan.plan}
                      onChange={(e) =>
                        setRenewPlan({ ...renewPlan, plan: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Plan</option>
                      {plansLoaded &&
                        apiPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - {plan.price} ({plan.validity} days)
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Payment Mode</label>
                    <select
                      className="form-select"
                      value={renewPlan.paymentMode}
                      onChange={(e) =>
                        setRenewPlan({
                          ...renewPlan,
                          paymentMode: e.target.value,
                        })
                      }
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount Paid</label>
                    <input
                      type="number"
                      className="form-control"
                      value={renewPlan.amountPaid}
                      onChange={(e) =>
                        setRenewPlan({
                          ...renewPlan,
                          amountPaid: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowRenewForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn text-white"
                      style={{ backgroundColor: "#6EB2CC" }}
                    >
                      Renew Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Member Modal */}
      {showViewModal && selectedMember && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Member Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <div className="row">
                  <div className="col-12 col-lg-4 text-center mb-4 mb-lg-0">
                    {selectedMember.profileImage ? (
                      <img
                        src={selectedMember.profileImage}
                        alt="Profile"
                        className="rounded-circle mb-3"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="d-flex justify-content-center align-items-center rounded-circle bg-primary text-white mx-auto mb-3"
                        style={{ width: "120px", height: "120px" }}
                      >
                        <span className="fs-1 fw-bold">
                          {selectedMember.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                    <h5 className="mb-2">{selectedMember.name}</h5>
                    <span
                      className={`badge ${getStatusClass(
                        selectedMember.status
                      )}`}
                    >
                      {selectedMember.status}
                    </span>
                  </div>
                  <div className="col-12 col-lg-8">
                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <strong>Phone:</strong>
                        <div>{selectedMember.phone}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Email:</strong>
                        <div>{selectedMember.email}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Gender:</strong>
                        <div>{selectedMember.gender}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Plan:</strong>
                        <div>{getPlanNameById(selectedMember.planId)}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Plan Start:</strong>
                        <div>
                          {new Date(
                            selectedMember.planStart
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Expiry:</strong>
                        <div>
                          {new Date(selectedMember.expiry).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Date of Birth:</strong>
                        <div>
                          {new Date(selectedMember.dob).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Interested In:</strong>
                        <div>{selectedMember.interestedIn}</div>
                      </div>
                      <div className="col-12">
                        <strong>Address:</strong>
                        <div>{selectedMember.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary w-100 w-md-auto"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMember;
