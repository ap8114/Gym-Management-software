import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import Logo from "../assets/Logo/Logo.png"; // Default fallback logo
import Account from "../Dashboard/Member/Account";
import { Link } from "react-router-dom";
import axiosInstance from "../Api/axiosInstance";


const Navbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // State for dynamic logo and loading status
  const [appLogo, setAppLogo] = useState(Logo); // Initialize with default logo
  const [loading, setLoading] = useState(true); // For initial loading state

  const dropdownRef = useRef();

  // Get user data from localStorage
  const getUserFromLocalStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  // Initialize profile state with user data from localStorage
  const user = getUserFromLocalStorage();
  const [profile, setProfile] = useState({
    name: user?.fullName || "Admin",
    email: user?.email || "admin@gymapp.com",
    phone: user?.phone || "+91 90000 00000",
    role: user?.roleName || "Super Admin",
    branch: user?.branchName || "All Branches",
    notifyEmail: true,
    notifySMS: false,
  });

  // --- CHANGE 2: Update fetchAppSettings to use axiosInstance ---
  const fetchAppSettings = async () => {
    try {
      const userData = getUserFromLocalStorage();
      if (!userData || !userData.id) {
        console.error("Admin ID not found in localStorage. Cannot fetch logo.");
        setAppLogo(Logo);
        setLoading(false);
        return;
      }

      const adminId = userData.id;
      // The endpoint path is relative to the baseURL in your axiosInstance
      const endpoint = `/adminSettings/app-settings/admin/${adminId}`;

      // Use axiosInstance.get() instead of fetch()
      const response = await axiosInstance.get(endpoint);

      // Axios automatically throws an error for non-2xx responses, so no need for response.ok check.
      // The data from the server is available in response.data
      const result = response.data;

      if (result.success && result.data && result.data.logo) {
        setAppLogo(result.data.logo);
        console.log("Logo successfully fetched from API.");
      } else {
        console.log("No logo found in API response. Using default.");
        setAppLogo(Logo);
      }
    } catch (error) {
      // Axios provides a more detailed error object
      console.error("Error fetching app settings with axios:", error.response ? error.response.data : error.message);
      setAppLogo(Logo); // Fallback to default on any error
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // useEffect to fetch logo on mount and then every minute (no changes here)
  useEffect(() => {
    fetchAppSettings(); // Initial fetch when component mounts

    const intervalId = setInterval(fetchAppSettings, 5000); // Fetch every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Existing useEffect for profile management (no changes here)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = getUserFromLocalStorage();
      if (updatedUser) {
        setProfile({
          name: updatedUser.fullName || "Admin",
          email: updatedUser.email || "admin@gymapp.com",
          phone: updatedUser.phone || "+91 90000 00000",
          role: updatedUser.roleName || "Super Admin",
          branch: updatedUser.branchName || "All Branches",
          notifyEmail: true,
          notifySMS: false,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(() => {
      const currentUser = getUserFromLocalStorage();
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        handleStorageChange();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showProfileModal ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showProfileModal]);

  const handleSaveProfile = () => {
    try {
      const currentUser = getUserFromLocalStorage();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          fullName: profile.name,
          email: profile.email,
          phone: profile.phone,
          branchName: profile.branch
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      alert("Profile saved!");
      setShowProfileModal(false);
    } catch (error) {
      console.error("Error saving profile to localStorage:", error);
      alert("Error saving profile!");
    }
  };

  return (
    <>
      <nav
        className="navbar navbar-expand px-3 py-2 d-flex justify-content-between align-items-center fixed-top"
        style={{
          backgroundColor: "#2f6a87",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn p-2"
            style={{
              backgroundColor: "transparent",
              borderColor: "white",
              color: "white",
              borderRadius: "6px",
              border: "2px solid white",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.color = "#000";
              e.target.style.borderColor = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "white";
              e.target.style.borderColor = "white";
            }}
            onClick={toggleSidebar}
          >
            <FaBars color="currentColor" />
          </button>

          {/* Dynamic Logo with loading state */}
          <div>
            {loading ? (
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <img
                src={appLogo}
                alt="Logo"
                style={{
                  height: "50px",
                  width: "200px",
                  objectFit: "contain"
                }}
                onError={(e) => {
                  e.target.onerror = null; // Prevents infinite loop
                  e.target.src = Logo; // Fallback to default logo on error
                }}
              />
            )}
          </div>
        </div>

        {/* Notification and User */}
        <div className="me-2 d-flex align-items-center gap-3 position-relative">
          {/* Notification */}
          {/* <div className="position-relative">
            <FaBell size={18} color="white" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </div> */}

          {/* User Profile */}
          <div className="dropdown" ref={dropdownRef}>
            <div
              className="d-flex align-items-center gap-2 cursor-pointer text-white"
              role="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle size={35} />
              <div className="d-none d-sm-block text-white">
                <small className="mb-0">Welcome    {profile.role} </small>
                <div className="fw-bold">{profile.name}</div>
              </div>
            </div>

            {dropdownOpen && (
              <ul
                className="dropdown-menu show mt-2 shadow-sm"
                style={{
                  position: "absolute",
                  right: 0,
                  minWidth: "200px",
                  maxWidth: "calc(100vw - 30px)",
                  zIndex: 1000,
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <li>
                  <Link to="/member/account" className="text-decoration-none">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                      }}
                    >
                      Profile
                    </button>
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item text-danger" to="/">Logout</Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;