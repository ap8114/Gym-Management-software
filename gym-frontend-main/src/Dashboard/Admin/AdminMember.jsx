import React, { useState, useEffect } from "react";
import axiosInstance from "../../Api/axiosInstance"; // Import your axios instance
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
import GetAdminId from "../../../src/Api/GetAdminId";

const AdminMember = () => {
  const adminId = GetAdminId();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [editLoading, setEditLoading] = useState(false); // Add edit loading state
  const [deleteLoading, setDeleteLoading] = useState(false); // Add delete loading state
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState(null);
  const [membersLoading, setMembersLoading] = useState(false); // Add loading state for members
  // Plans state
  const [apiPlans, setApiPlans] = useState([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [planError, setPlanError] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Form states
  const [newMember, setNewMember] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    branchId: "",
    planId: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    startDate: new Date().toISOString().split("T")[0],
    paymentMode: "cash",
    amountPaid: "",
    interestedIn: "", // Added field for "Interested In" selection
    status: "Active", // Added status field
  });

  // ✅ FIX: Updated editMember state to include all necessary fields for API
  const [editMember, setEditMember] = useState({
    id: "",
    fullName: "", // ✅ Changed from 'name' to 'fullName'
    phone: "",
    email: "",
    branchId: "", // ✅ Changed from 'branch' to 'branchId'
    planId: "", // ✅ Changed from 'plan' to 'planId'
    address: "",
    gender: "",
    dateOfBirth: "", // ✅ Changed from 'dob' to 'dateOfBirth'
    interestedIn: "", // ✅ Added field
    status: "Active", // ✅ Added status field
  });

  const [renewPlan, setRenewPlan] = useState({
    memberId: "",
    plan: "",
    paymentMode: "cash",
    amountPaid: "",
  });

  // Get unique branches for filter
  const uniqueBranches = [...new Set(members.map((member) => member.branch))];

  // Filter members based on search term, status and branch
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "" || member.status === filterStatus;
    const matchesBranch =
      filterBranch === "" || member.branchId === parseInt(filterBranch);
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Fetch members by admin ID
  const fetchMembersByAdminId = async () => {
    setMembersLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BaseUrl}members/admin/${adminId}`
      );

      if (response.data && response.data.success) {
        // Map API response to match our component structure
        const formattedMembers = response.data.data.map((member) => ({
          id: member.id,
          name: member.fullName,
          phone: member.phone,
          email: member.email,
          gender: member.gender,
          branch: member.branchId, // We'll need to map branchId to branch name
          plan: member.planId, // We'll need to map planId to plan name
          address: member.address,
          dob: member.dateOfBirth,
          planStart: member.membershipFrom,
          expiry: member.membershipTo,
          status: member.status,
          interestedIn: member.interestedIn,
          // Store original IDs for editing
          branchId: member.branchId,
          planId: member.planId,
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

  // Fetch plans from API
  const fetchPlansFromAPI = async () => {
    setPlanLoading(true);
    setPlanError(null);

    try {
      // Get adminId from localStorage using "userId" key with fallback to '4'
      const adminId = localStorage.getItem("userId") || "4";

      // Make API call to get plans by admin ID
      const response = await axiosInstance.get(
        `${BaseUrl}MemberPlan?adminId=${adminId}`
      );

      if (response.data && response.data.success) {
        // Format API response to match our component structure
        const formattedPlans = response.data.plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          sessions: plan.sessions,
          validity: plan.validityDays,
          price: `₹${plan.price.toLocaleString()}`,
          active: true, // Assuming all plans from API are active by default
          branch: "Downtown", // Default branch since API doesn't provide it
          type: plan.type.toLowerCase(), // Convert to lowercase for our component
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

  // Fetch branches
  const fetchBranches = async () => {
    setBranchesLoading(true);
    setBranchesError(null);
    try {
      const adminId = localStorage.getItem("userId") || "5"; // fallback to 5 as per your note
      const response = await axiosInstance.get(
        `${BaseUrl}branches/by-admin/${adminId}`
      );
      if (response.data?.success && Array.isArray(response.data.branches)) {
        setBranches(response.data.branches);
      } else {
        setBranchesError("No branches found.");
        setBranches([]);
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      setBranchesError("Failed to load branches.");
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchMembersByAdminId();
    fetchPlansFromAPI();
    fetchBranches();
  }, []);

  // Handle add member with API call
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the payload for the API
      const payload = {
        adminId: adminId, // ✅ Added adminId to the payload
        fullName: newMember.fullName,
        email: newMember.email,
        password: newMember.password,
        phone: newMember.phone,
        gender: newMember.gender,
        dateOfBirth: newMember.dateOfBirth,
        address: newMember.address,
        interestedIn: newMember.interestedIn,
        branchId: parseInt(newMember.branchId), // Convert to number
        planId: parseInt(newMember.planId), // Convert to number
        membershipFrom: newMember.startDate, // Map startDate to membershipFrom
        paymentMode:
          newMember.paymentMode.charAt(0).toUpperCase() +
          newMember.paymentMode.slice(1), // Capitalize first letter
        amountPaid: parseFloat(newMember.amountPaid), // Convert to number
      };

      // Make API call using axiosInstance and BaseUrl
      const response = await axiosInstance.post(
        `${BaseUrl}/members/create`,
        payload
      );

      // If the API call is successful, add the member to the local state
      if (response.data) {
        // Refresh the members list to get the updated data
        await fetchMembersByAdminId();

        // Reset the form
        setNewMember({
          fullName: "",
          phone: "",
          email: "",
          password: "",
          branchId: "",
          planId: "",
          address: "",
          gender: "",
          dateOfBirth: "",
          startDate: new Date().toISOString().split("T")[0],
          paymentMode: "cash",
          amountPaid: "",
          interestedIn: "",
          status: "Active",
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

  // ✅ FIX: Handle edit member with API call
  const handleEditMember = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      // ✅ FIX: Prepare the payload for the API to match the expected structure
      const payload = {
        adminId: adminId, // ✅ Added adminId to the payload
        fullName: editMember.fullName,
        email: editMember.email,
        phone: editMember.phone,
        gender: editMember.gender,
        address: editMember.address,
        dateOfBirth: editMember.dateOfBirth,
        interestedIn: editMember.interestedIn,
        status: editMember.status, // ✅ Added status
        branchId: parseInt(editMember.branchId), // ✅ Added branchId
        planId: parseInt(editMember.planId), // ✅ Added planId
      };

      // ✅ FIX: Make API call using axiosInstance and BaseUrl with the correct URL
      const response = await axiosInstance.put(
        `${BaseUrl}members/update/${editMember.id}`,
        payload
      );

      // ✅ FIX: If the API call is successful, update the member in the local state
      if (response.data && response.data.success) {
        // Update the member in the state with the response data
        setMembers(
          members.map((member) =>
            member.id === editMember.id
              ? { ...member, ...response.data.member }
              : member
          )
        );

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

  // Handle delete member with API call
  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setDeleteLoading(true);

      try {
        // Make API call using axiosInstance and BaseUrl
        const response = await axiosInstance.delete(
          `${BaseUrl}members/delete/${id}`
        );

        // If the API call is successful, remove the member from the local state
        if (response.data && response.data.success) {
          setMembers(members.filter((member) => member.id !== id));
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

  // Handle view member
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  // ✅ FIX: Handle edit form open with correct field mapping
  const handleEditFormOpen = (member) => {
    setEditMember({
      id: member.id,
      fullName: member.name, // ✅ Map 'name' to 'fullName'
      email: member.email,
      phone: member.phone,
      gender: member.gender,
      address: member.address,
      dateOfBirth: member.dob, // ✅ Map 'dob' to 'dateOfBirth'
      interestedIn: member.interestedIn,
      status: member.status, // ✅ Map 'status'
      branchId: member.branchId, // ✅ Map 'branchId'
      planId: member.planId, // ✅ Map 'planId'
    });
    setShowEditForm(true);
  };

  // Handle renew plan
  const handleRenewPlan = (e) => {
    e.preventDefault();
    const today = new Date();
    const planStart = today.toISOString().split("T")[0];

    // Calculate expiry based on plan
    let expiry = new Date(today);

    // Find the selected plan to determine its validity
    const selectedPlan = apiPlans.find(
      (plan) => plan.id.toString() === renewPlan.plan
    );
    if (selectedPlan) {
      // Add validity days from the plan
      expiry.setDate(expiry.getDate() + parseInt(selectedPlan.validity));
    } else {
      // Fallback to plan name parsing if the plan is not found
      if (renewPlan.plan.includes("Monthly")) {
        expiry.setMonth(expiry.getMonth() + 1);
      } else if (renewPlan.plan.includes("Quarterly")) {
        expiry.setMonth(expiry.getMonth() + 3);
      } else if (renewPlan.plan.includes("Annual")) {
        expiry.setFullYear(expiry.getFullYear() + 1);
      }
    }

    // Find the plan name for display
    const planName = selectedPlan ? selectedPlan.name : renewPlan.plan;

    setMembers(
      members.map((member) =>
        member.id === parseInt(renewPlan.memberId)
          ? {
              ...member,
              plan: planName,
              planStart,
              expiry: expiry.toISOString().split("T")[0],
              status: "Active",
            }
          : member
      )
    );

    setRenewPlan({
      memberId: "",
      plan: "",
      paymentMode: "cash",
      amountPaid: "",
    });
    setShowRenewForm(false);
  };

  // Handle renew form open
  const handleRenewFormOpen = (member) => {
    setRenewPlan({
      ...renewPlan,
      memberId: member.id.toString(),
      plan: member.plan,
    });
    setShowRenewForm(true);
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-success";
      // case "Expired": return "bg-danger";
      // case "Frozen": return "bg-info";
      // case "Pending": return "bg-warning";
      case "Inactive":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  // Get branch name by ID
  const getBranchNameById = (branchId) => {
    const branch = branches.find((b) => b.id === parseInt(branchId));
    return branch ? branch.name : "Unknown Branch";
  };

  // Get plan name by ID
  const getPlanNameById = (planId) => {
    const plan = apiPlans.find((p) => p.id === parseInt(planId));
    return plan ? plan.name : "Unknown Plan";
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
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {branchesLoading ? (
              <option>Loading branches...</option>
            ) : branchesError ? (
              <option className="text-danger">{branchesError}</option>
            ) : (
              branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            {/* <option value="Expired">Expired</option>
            <option value="Frozen">Frozen</option>
            <option value="Pending">Pending</option> */}
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
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Branch</th>
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
                        <td>{member.name}</td>
                        <td>{member.phone}</td>
                        <td>{member.email}</td>
                        <td>{member.gender}</td>
                        <td>{getBranchNameById(member.branchId)}</td>
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
                    <div>
                      <h6 className="mb-1 fw-bold">{member.name}</h6>
                      <span
                        className={`badge ${getStatusClass(member.status)}`}
                      >
                        {member.status}
                      </span>
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
                      <strong>Branch:</strong>{" "}
                      {getBranchNameById(member.branchId)}
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

      {/* Add Member Modal - Fixed with editable start date, Interested In section, email, password, and status */}
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
                    {/* Added Interested In section */}
                    <div className="col-12">
                      <label className="form-label">
                        Interested In <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-3">
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
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                              })
                            }
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
                            id="groupClasses"
                            value="Group Classes"
                            checked={newMember.interestedIn === "Group Classes"}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                              })
                            }
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="groupClasses"
                          >
                            Group Classes
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="interestedIn"
                            id="both"
                            value="Both"
                            checked={newMember.interestedIn === "Both"}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                interestedIn: e.target.value,
                              })
                            }
                            required
                          />
                          <label className="form-check-label" htmlFor="both">
                            Both
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
                        Branch <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={newMember.branchId}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            branchId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Branch</option>
                        {branchesLoading ? (
                          <option>Loading branches...</option>
                        ) : branchesError ? (
                          <option className="text-danger">
                            {branchesError}
                          </option>
                        ) : (
                          branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))
                        )}
                      </select>
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
                        >
                          <option value="">Select Plan</option>
                          {plansLoaded &&
                            apiPlans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name} - {plan.price} ({plan.validity}{" "}
                                days)
                              </option>
                            ))}
                          {/* Fallback options if API plans aren't loaded */}
                          {!plansLoaded && (
                            <>
                              <option value="11">Basic Monthly</option>
                              <option value="12">Basic Quarterly</option>
                              <option value="13">Basic Annual</option>
                              <option value="14">Standard Monthly</option>
                              <option value="15">Standard Quarterly</option>
                              <option value="16">Standard Annual</option>
                              <option value="17">Premium Monthly</option>
                              <option value="18">Premium Quarterly</option>
                              <option value="19">Premium Annual</option>
                            </>
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

      {/* ✅ FIX: Edit Member Modal - Fixed with Status field and correct API payload */}
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
                        {/* <option value="Expired">Expired</option>
                        <option value="Frozen">Frozen</option>
                        <option value="Pending">Pending</option> */}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Branch</label>
                      <select
                        className="form-select"
                        value={editMember.branchId}
                        onChange={(e) =>
                          setEditMember({
                            ...editMember,
                            branchId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
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
                      >
                        <option value="">Select Plan</option>
                        {plansLoaded &&
                          apiPlans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name} - {plan.price} ({plan.validity} days)
                            </option>
                          ))}
                        {/* Fallback options if API plans aren't loaded */}
                        {!plansLoaded && (
                          <>
                            <option value="Basic Monthly">Basic Monthly</option>
                            <option value="Basic Quarterly">
                              Basic Quarterly
                            </option>
                            <option value="Basic Annual">Basic Annual</option>
                            <option value="Standard Monthly">
                              Standard Monthly
                            </option>
                            <option value="Standard Quarterly">
                              Standard Quarterly
                            </option>
                            <option value="Standard Annual">
                              Standard Annual
                            </option>
                            <option value="Premium Monthly">
                              Premium Monthly
                            </option>
                            <option value="Premium Quarterly">
                              Premium Quarterly
                            </option>
                            <option value="Premium Annual">
                              Premium Annual
                            </option>
                          </>
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
                    {/* Added Interested In section to Edit form */}
                    <div className="col-12">
                      <label className="form-label">Interested In</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="editInterestedIn"
                            id="editPersonalTraining"
                            value="Personal Training"
                            checked={
                              editMember.interestedIn === "Personal Training"
                            }
                            onChange={(e) =>
                              setEditMember({
                                ...editMember,
                                interestedIn: e.target.value,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editPersonalTraining"
                          >
                            Personal Training
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="editInterestedIn"
                            id="editGroupClasses"
                            value="Group Classes"
                            checked={
                              editMember.interestedIn === "Group Classes"
                            }
                            onChange={(e) =>
                              setEditMember({
                                ...editMember,
                                interestedIn: e.target.value,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editGroupClasses"
                          >
                            Group Classes
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="editInterestedIn"
                            id="editBoth"
                            value="Both"
                            checked={editMember.interestedIn === "Both"}
                            onChange={(e) =>
                              setEditMember({
                                ...editMember,
                                interestedIn: e.target.value,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editBoth"
                          >
                            Both
                          </label>
                        </div>
                      </div>
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

      {/* Renew Plan Modal - Fixed */}
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
                      {/* Fallback options if API plans aren't loaded */}
                      {!plansLoaded && (
                        <>
                          <option value="Basic Monthly">Basic Monthly</option>
                          <option value="Basic Quarterly">
                            Basic Quarterly
                          </option>
                          <option value="Basic Annual">Basic Annual</option>
                          <option value="Standard Monthly">
                            Standard Monthly
                          </option>
                          <option value="Standard Quarterly">
                            Standard Quarterly
                          </option>
                          <option value="Standard Annual">
                            Standard Annual
                          </option>
                          <option value="Premium Monthly">
                            Premium Monthly
                          </option>
                          <option value="Premium Quarterly">
                            Premium Quarterly
                          </option>
                          <option value="Premium Annual">Premium Annual</option>
                        </>
                      )}
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

      {/* View Member Modal - Fixed with Interested In field */}
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
                        <strong>Branch:</strong>
                        <div>{getBranchNameById(selectedMember.branchId)}</div>
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
                        <strong>Gender:</strong>
                        <div>{selectedMember.gender}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <strong>Date of Birth:</strong>
                        <div>
                          {new Date(selectedMember.dob).toLocaleDateString()}
                        </div>
                      </div>
                      {/* Added Interested In field to View modal */}
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
