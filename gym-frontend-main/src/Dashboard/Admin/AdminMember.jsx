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
  Download,
} from "lucide-react";
import GetAdminId from "../../Api/GetAdminId";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GymLogo from "../../assets/Logo/Logo1.png";
import { numberToWords } from "../../utils/numberToWords";
import ImageCropper from "../../Components/ImageCropper";

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

  // Image cropping states
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [cropperMode, setCropperMode] = useState(null); // 'add' or 'edit'

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
    paymentMode: "cash",
    amountPaid: "",
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
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Create a preview URL and show cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperImage(reader.result);
        setCropperMode(isEdit ? 'edit' : 'add');
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cropped image
  const handleCropComplete = (croppedImageBlob) => {
    // Convert blob to file
    const croppedFile = new File([croppedImageBlob], 'profile-image.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedImageBlob);

    if (cropperMode === 'edit') {
      setEditMember({
        ...editMember,
        profileImage: croppedFile,
        profileImagePreview: previewUrl,
      });
    } else {
      setNewMember({
        ...newMember,
        profileImage: croppedFile,
        profileImagePreview: previewUrl,
      });
    }

    setShowCropper(false);
    setCropperImage(null);
    setCropperMode(null);
  };

  // Handle cropper cancel
  const handleCropperCancel = () => {
    setShowCropper(false);
    setCropperImage(null);
    setCropperMode(null);
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
          profileImage: member.profileImage || "",
          paymentMode: member.paymentMode,
          amountPaid: member.amountPaid,
          joinDate: member.joinDate,
          // Use API's remainingDays if provided, otherwise compute from expiry
          remainingDays:
            typeof member.remainingDays === "number"
              ? member.remainingDays
              : member.membershipTo
                ? Math.ceil((new Date(member.membershipTo) - new Date()) / (1000 * 60 * 60 * 24))
                : null,
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
          paymentMode: member.paymentMode,
          amountPaid: member.amountPaid,
          joinDate: member.joinDate,
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
      formData.append(
        "paymentMode",
        editMember.paymentMode.charAt(0).toUpperCase() +
        editMember.paymentMode.slice(1)
      );
      formData.append("amountPaid", editMember.amountPaid);

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
        paymentMode: member.paymentMode || "cash",
        amountPaid: member.amountPaid || "",
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
    if (!status) return "bg-danger";
    return String(status).toLowerCase() === "active" ? "bg-success" : "bg-danger";
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

  // Function to generate and download receipt as image using html2canvas
  const handleDownloadReceipt = async (member) => {
    try {
      // Fetch full member details to get payment information
      let memberDetails = null;
      let paymentData = null;
      let adminDetails = null;

      // Get adminId from member API response
      let memberAdminId = null;
      
      try {
        const memberResponse = await axiosInstance.get(
          `${BaseUrl}members/detail/${member.id}`
        );
        if (memberResponse.data?.success) {
          // API returns { success: true, member: {...} } or { success: true, data: {...} }
          memberDetails = memberResponse.data.member || memberResponse.data.data;
          // Get adminId from member response
          memberAdminId = memberDetails?.adminId || member?.adminId || adminId;
        }
      } catch (err) {
        console.log("Member details not available");
        memberAdminId = member?.adminId || adminId; // Fallback to member object or current adminId
      }

      // Use memberAdminId for fetching admin details
      const finalAdminId = memberAdminId || adminId;

      // Fetch payment history for the member
      try {
        const paymentResponse = await axiosInstance.get(
          `${BaseUrl}payment/member/${member.id}`
        );
        if (paymentResponse.data?.success && paymentResponse.data.payments?.length > 0) {
          paymentData = paymentResponse.data.payments[0]; // Get latest payment
        }
      } catch (err) {
        console.log("Payment history not available");
      }

      // Fetch admin profile for gymAddress (from member's adminId)
      try {
        const adminResponse = await axiosInstance.get(
          `${BaseUrl}auth/user/${finalAdminId}`
        );
        if (adminResponse.data) {
          adminDetails = adminResponse.data;
        }
      } catch (err) {
        console.log("Admin details not available, using localStorage data");
        // Fallback to localStorage user data
        const userData = getUserFromStorage();
        adminDetails = {
          fullName: userData?.fullName || "Gym Name",
          gymName: userData?.gymName || userData?.fullName || "Gym Name",
          gymAddress: userData?.gymAddress || userData?.address || "Gym Address",
          gstNumber: userData?.gstNumber || "",
          tax: userData?.tax || "5",
          phone: userData?.phone || "",
          email: userData?.email || ""
        };
      }

      // Fetch from app-settings to get gymName (from member's adminId)
      try {
        const settingsResponse = await axiosInstance.get(
          `adminSettings/app-settings/admin/${finalAdminId}`
        );
        if (settingsResponse.data?.data) {
          // Merge settings data with adminDetails, prioritizing settings for gymName
          const settingsData = settingsResponse.data.data;
          if (settingsData.gym_name || settingsData.gymName) {
            adminDetails = { 
              ...adminDetails, 
              gymName: settingsData.gym_name || settingsData.gymName 
            };
          }
        }
      } catch (err) {
        console.log("Settings not available, using admin profile data only");
      }

      // Get plan details
      const plan = apiPlans.find((p) => p.id === parseInt(member.planId));
      const planName = plan ? plan.name : "Membership Plan";
      const planPrice = plan ? parseFloat(plan.price.toString().replace("₹", "").replace(/,/g, "")) : 0;
      const planValidity = plan ? plan.validity : "N/A";
      const planSessions = plan ? plan.sessions : "N/A";

      // Use payment data if available, otherwise use member details or plan price
      const baseAmount = paymentData?.amount || memberDetails?.amountPaid || planPrice || 0;
      const paymentMode = paymentData?.paymentMode || memberDetails?.paymentMode || "Cash";
      const cashPaid = paymentData?.amount || memberDetails?.amountPaid || planPrice || 0;
      const change = 0; // Assuming exact payment, no change
      const invoiceNo = paymentData?.invoiceNo || `INV-${member.id}-${Date.now()}`;
      const paymentDate = paymentData?.paymentDate
        ? new Date(paymentData.paymentDate).toLocaleDateString()
        : new Date().toLocaleDateString();

      // Calculate tax (CGST and SGST - split 50-50)
      const taxRate = parseFloat(adminDetails?.tax || "5"); // Tax rate from admin profile
      const taxAmount = (baseAmount * taxRate) / 100;
      const cgstAmount = taxAmount / 2; // 50% of tax
      const sgstAmount = taxAmount / 2; // 50% of tax
      const subtotal = baseAmount;
      const totalAmount = subtotal + taxAmount;

      // Member details
      const memberName = memberDetails?.fullName || member.name || "N/A";
      const memberPhone = memberDetails?.phone || member.phone || "N/A";
      const memberEmail = memberDetails?.email || member.email || "N/A";
      const memberAddress = memberDetails?.address || member.address || "N/A";
      const memberGender = memberDetails?.gender || member.gender || "N/A";
      const memberDOB = memberDetails?.dateOfBirth
        ? new Date(memberDetails.dateOfBirth).toLocaleDateString()
        : (member.dob ? new Date(member.dob).toLocaleDateString() : "N/A");
      const membershipFrom = memberDetails?.membershipFrom
        ? new Date(memberDetails.membershipFrom).toLocaleDateString()
        : (member.planStart ? new Date(member.planStart).toLocaleDateString() : "N/A");
      const membershipTo = memberDetails?.membershipTo
        ? new Date(memberDetails.membershipTo).toLocaleDateString()
        : (member.expiry ? new Date(member.expiry).toLocaleDateString() : "N/A");
      const memberStatus = memberDetails?.status || member.status || "N/A";

      // Fetch logo from adminSettings API (from member's adminId)
      let logoDataUrl = GymLogo; // Default fallback
      try {
        const logoResponse = await axiosInstance.get(`adminSettings/app-settings/admin/${finalAdminId}`);
        if (logoResponse.data?.data?.logo) {
          logoDataUrl = logoResponse.data.data.logo;
        }
      } catch (err) {
        console.log("Failed to fetch logo, using default");
      }

      // Convert logo to data URL for html2canvas
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        logoDataUrl = await new Promise((resolve) => {
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            } catch (err) {
              resolve(logoDataUrl); // Fallback to original
            }
          };
          img.onerror = () => resolve(logoDataUrl); // Fallback to original
          img.src = logoDataUrl;
        });
      } catch (err) {
        // Keep original logoDataUrl if conversion fails
      }

      // Company details from admin profile API and settings API
      // Priority: settings gym_name/gymName > admin profile gymName > fullName
      const companyName = adminDetails?.gymName || adminDetails?.fullName || "Gym Name";
      // Priority: admin profile gymAddress > address (from admin profile, not member)
      const companyAddress = adminDetails?.gymAddress || adminDetails?.address || "Gym Address";
      const companyGST = adminDetails?.gstNumber || "";
      const companyPhone = adminDetails?.phone || "";
      const companyEmail = adminDetails?.email || "";
      
      // Extract state from address for Place of Supply
      const addressParts = companyAddress.split(',');
      const placeOfSupply = addressParts[addressParts.length - 2]?.trim() || addressParts[addressParts.length - 1]?.trim() || "Telangana";
      
      // Convert amount to words
      const amountInWords = numberToWords(Math.floor(totalAmount));
      const balance = totalAmount - cashPaid;

      // Create receipt HTML with A4 size matching image design (210mm x 297mm = 794px x 1123px at 96dpi)
      const receiptHTML = `
        <div id="receipt-container" style="
          width: 794px;
          min-height: 1123px;
          background: linear-gradient(to bottom, #f0f8ff 0%, #ffffff 20%);
          padding: 35px 45px;
          font-family: Arial, sans-serif;
          color: #1a1a1a;
          margin: 0 auto;
          box-sizing: border-box;
          border: 3px solid #d4af37;
          position: relative;
          overflow: hidden;
        ">
          <!-- Decorative Background Elements -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.05; pointer-events: none; z-index: 0;">
            <div style="position: absolute; top: 20px; left: 20px; font-size: 40px;">❄</div>
            <div style="position: absolute; top: 50px; right: 30px; font-size: 35px;">❄</div>
            <div style="position: absolute; bottom: 100px; left: 40px; font-size: 30px;">❄</div>
            <div style="position: absolute; bottom: 200px; right: 50px; font-size: 35px;">❄</div>
          </div>

          <!-- Content Container -->
          <div style="position: relative; z-index: 1;">
          <!-- Header Section: Logo + Company Details + Invoice Title -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #d4af37;">
            <!-- Left Side: Logo + Company Details -->
            <div style="flex: 1; display: flex; gap: 15px;">
              <!-- Logo -->
              <div style="width: 80px; height: 80px; border: 1px solid #d4af37; display: flex; align-items: center; justify-content: center; padding: 5px; box-sizing: border-box; background: white; flex-shrink: 0;">
                <img src="${logoDataUrl}" alt="Company Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
              </div>
              
              <!-- Company Details -->
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 22px; margin-bottom: 6px; color: #1e3a8a; line-height: 1.2;">${companyName}</div>
                ${companyGST ? `<div style="font-size: 11px; margin-bottom: 4px; color: #4b5563;">GSTIN ${companyGST}</div>` : ''}
                ${companyPhone ? `<div style="font-size: 11px; margin-bottom: 4px; color: #4b5563; display: flex; align-items: center; gap: 5px;">
                  <span style="color: #d4af37; font-size: 12px;">📞</span> ${companyPhone}
                </div>` : ''}
                ${companyEmail ? `<div style="font-size: 11px; margin-bottom: 4px; color: #4b5563; display: flex; align-items: center; gap: 5px;">
                  <span style="color: #d4af37; font-size: 12px;">✉</span> ${companyEmail}
                </div>` : ''}
                <div style="font-size: 11px; line-height: 1.5; color: #4b5563; display: flex; align-items: flex-start; gap: 5px;">
                  <span style="color: #d4af37; font-size: 12px; margin-top: 2px;">📍</span>
                  <span>${companyAddress}</span>
                </div>
              </div>
            </div>
            
            <!-- Right Side: Invoice Title -->
            <div style="text-align: right; flex-shrink: 0; margin-left: 20px;">
              <h1 style="font-size: 26px; font-weight: bold; margin: 0; text-transform: uppercase; color: #1e3a8a; letter-spacing: 3px;">TAX INVOICE</h1>
            </div>
          </div>

          <!-- Invoice Number and Date -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 11px;">
            <div>
              <strong>Invoice No.</strong> ${invoiceNo}
            </div>
            <div>
              <strong>Invoice Date</strong> ${paymentDate}
            </div>
          </div>

          <!-- Bill To Section -->
          <div style="margin-bottom: 20px;">
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px; text-transform: uppercase;">Bill To</div>
            <div style="font-size: 11px; line-height: 1.6;">
              <div style="margin-bottom: 3px;">${memberName}</div>
              <div style="margin-bottom: 3px;">${memberAddress}</div>
              <div style="margin-bottom: 5px;">Mobile ${memberPhone}</div>
              <div style="margin-top: 8px;">
                <strong>Place of Supply</strong> ${placeOfSupply}
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #d0d0d0;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 8px; text-align: left; border: 1px solid #d0d0d0; font-size: 10px; font-weight: bold;">No</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #d0d0d0; font-size: 10px; font-weight: bold;">SERVICES</th>
                <th style="padding: 8px; text-align: center; border: 1px solid #d0d0d0; font-size: 10px; font-weight: bold;">Qty.</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #d0d0d0; font-size: 10px; font-weight: bold;">Rate</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #d0d0d0; font-size: 10px; font-weight: bold;">Tax</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #d0d0d0; font-size: 10px; font-weight: bold;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #d0d0d0; font-size: 10px; text-align: center;">1</td>
                <td style="padding: 8px; border: 1px solid #d0d0d0; font-size: 10px;">
                  ${planName}
                  <br/><small style="color: #666; font-size: 8px;">Gym annual subscription</small>
                </td>
                <td style="padding: 8px; border: 1px solid #d0d0d0; font-size: 10px; text-align: center;">1 PCS</td>
                <td style="padding: 8px; border: 1px solid #d0d0d0; font-size: 10px; text-align: right;">${subtotal.toLocaleString('en-IN')}</td>
                <td style="padding: 8px; border: 1px solid #d0d0d0; font-size: 10px; text-align: right;">${taxAmount.toFixed(0)}<br/><small>(${taxRate}%)</small></td>
                <td style="padding: 8px; border: 1px solid #d0d0d0; font-size: 10px; text-align: right;">${totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <!-- Tax Breakdown and Total -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
            <div style="width: 300px; border: 1px solid #d4af37; padding: 10px; background: #fffef7;">
              <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 10px; border-bottom: 1px solid #e5e7eb;">
                <span><strong>SUBTOTAL</strong></span>
                <span>₹ ${subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 10px; border-bottom: 1px solid #e5e7eb;">
                <span><strong>Taxable Amount</strong></span>
                <span>₹ ${subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 10px; border-bottom: 1px solid #e5e7eb;">
                <span>CGST @${(taxRate/2).toFixed(1)}%</span>
                <span>₹ ${cgstAmount.toFixed(0)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 10px; border-bottom: 1px solid #e5e7eb;">
                <span>SGST @${(taxRate/2).toFixed(1)}%</span>
                <span>₹ ${sgstAmount.toFixed(0)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; font-weight: bold; border-top: 2px solid #d4af37; background: #fef3c7; margin: 5px -10px -10px -10px; padding: 10px;">
                <span>Total Amount</span>
                <span>₹ ${totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div style="margin-bottom: 20px; padding: 12px; border: 1px solid #d4af37; background: #fffef7;">
            <div style="font-weight: bold; font-size: 11px; margin-bottom: 8px; color: #1e3a8a;">Terms & Conditions</div>
            <div style="font-size: 9px; line-height: 1.6; color: #4b5563;">
              <div style="margin-bottom: 4px;">1. Goods once sold will not be taken back or exchanged</div>
              <div>2. All disputes are subject to ${placeOfSupply} jurisdiction only</div>
            </div>
          </div>

          <!-- Payment Summary -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; gap: 15px;">
            <div style="flex: 1; padding: 8px; border: 1px solid #d4af37; background: #fffef7;">
              <div style="font-size: 10px; margin-bottom: 5px; color: #4b5563;"><strong>Received Amount</strong></div>
              <div style="font-size: 12px; font-weight: bold; color: #1e3a8a;">₹${cashPaid.toLocaleString('en-IN')}</div>
            </div>
            <div style="flex: 1; padding: 8px; border: 1px solid #d4af37; background: #fffef7;">
              <div style="font-size: 10px; margin-bottom: 5px; color: #4b5563;"><strong>Balance</strong></div>
              <div style="font-size: 12px; font-weight: bold; color: #1e3a8a;">₹${balance.toFixed(0)}</div>
            </div>
            <div style="flex: 1.5; padding: 8px; border: 1px solid #d4af37; background: #fffef7;">
              <div style="font-size: 10px; margin-bottom: 5px; color: #4b5563;"><strong>Total Amount (in words)</strong></div>
              <div style="font-size: 10px; font-weight: bold; line-height: 1.4; color: #1e3a8a;">${amountInWords}</div>
            </div>
          </div>

          <!-- Signature Section -->
          <div style="margin-top: 50px; text-align: right; padding-top: 20px;">
            <div style="border-top: 2px solid #d4af37; width: 200px; margin-left: auto; padding-top: 8px;">
              <div style="font-size: 11px; font-weight: bold; color: #1e3a8a; margin-bottom: 5px;">Signature</div>
              <div style="font-size: 12px; font-weight: bold; color: #1e3a8a;">${companyName}</div>
            </div>
          </div>
          </div>
        </div>
      `;

      // Create a temporary container
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = receiptHTML;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      document.body.appendChild(tempDiv);

      // Get the receipt container
      const receiptElement = tempDiv.querySelector("#receipt-container");

      // Wait for images to load before converting to canvas
      const images = receiptElement.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if image fails
              }
            })
        )
      );

      // Convert to canvas with high quality (A4 size: 794px x 1123px at 96dpi)
      // Using scale 2 for better quality when zooming
      const canvas = await html2canvas(receiptElement, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher scale for better quality
        width: 794,
        height: receiptElement.scrollHeight,
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: 794,
        windowHeight: receiptElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded in cloned document
          const clonedElement = clonedDoc.querySelector("#receipt-container");
          if (clonedElement) {
            const images = clonedElement.querySelectorAll("img");
            images.forEach((img) => {
              if (img.src && !img.complete) {
                img.style.display = "none";
              }
            });
          }
        }
      });

      // A4 dimensions in mm
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio
      
      // Create PDF with A4 size
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });

      // Convert canvas to image data
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Add image to PDF (full page)
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      // Download PDF
      pdf.save(`Invoice_${invoiceNo}_${memberName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);

      // Clean up
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Failed to generate receipt. Please try again.");
    }
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
                    <th>Remaining Days</th>
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
                          {member.remainingDays === null || member.remainingDays === undefined ? (
                            "-"
                          ) : member.remainingDays <= 10 ? (
                            <span style={{ color: "red", fontWeight: "600" }}>{member.remainingDays}</span>
                          ) : (
                            member.remainingDays
                          )}
                        </td>
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
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleDownloadReceipt(member)}
                              title="Download Receipt"
                            >
                              <Download size={16} />
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
                            className="dropdown-item"
                            onClick={() => handleDownloadReceipt(member)}
                          >
                            <Download size={16} className="me-2" /> Download Receipt
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
                    <div className="col-6">
                      <strong>Remaining:</strong>{" "}
                      {member.remainingDays === null || member.remainingDays === undefined
                        ? "-"
                        : member.remainingDays <= 10
                          ? (
                            <span style={{ color: "red", fontWeight: 600 }}>{member.remainingDays}</span>
                          )
                          : member.remainingDays}
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
                        {/* <div className="form-check">
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
                        </div> */}
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
                            name="editInterestedIn"
                            id="editPersonalTraining"
                            value="Personal Training"
                            checked={
                              editMember.interestedIn === "Personal Training"
                            }
                            onChange={(e) => {
                              setEditMember({
                                ...editMember,
                                interestedIn: e.target.value,
                                planId: "", // Reset plan selection when interested in changes
                              });
                            }}
                            required
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
                            id="editGeneral"
                            value="General Trainer"
                            checked={editMember.interestedIn === "General Trainer"}
                            onChange={(e) => {
                              setEditMember({
                                ...editMember,
                                interestedIn: e.target.value,
                                planId: "", // Reset plan selection when interested in changes
                              });
                            }}
                            required
                          />
                          <label className="form-check-label" htmlFor="editGeneral">
                            General Trainer
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="editInterestedIn"
                            id="editGroupClasses"
                            value="Group Classes"
                            checked={editMember.interestedIn === "Group Classes"}
                            onChange={(e) => {
                              setEditMember({
                                ...editMember,
                                interestedIn: e.target.value,
                                planId: "", // Reset plan selection when interested in changes
                              });
                            }}
                            required
                          />
                          <label
                            className="form-check-label"
                            htmlFor="editGroupClasses"
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
              <div className="col-12 col-md-6">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={editMember.paymentMode}
                  onChange={(e) =>
                    setEditMember({
                      ...editMember,
                      paymentMode: e.target.value,
                    })
                  }
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Amount Paid</label>
                <input
                  type="number"
                  className="form-control"
                  value={editMember.amountPaid}
                  onChange={(e) =>
                    setEditMember({
                      ...editMember,
                      amountPaid: e.target.value,
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
      {/* Image Cropper Modal */}
      {showCropper && cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropperCancel}
        />
      )}
    </div>
  );
};

export default AdminMember;