import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import Logo from "../assets/Logo/Logo.png"
import Account from "../Dashboard/Member/Account";
import { Link } from "react-router-dom";
const Navbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  useEffect(() => {
    // Update profile when user data changes in localStorage
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

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also check for direct changes in the same tab
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

  // prevent background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showProfileModal ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showProfileModal]);

  const handleSaveProfile = () => {
    // Save updated profile to localStorage
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
          {/* Toggle Button with Custom Hover */}
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

          {/* Text Logo */}
          <div>
            <img
              src={Logo}
              alt="Logo"
              style={{
                height: "50px",   // apne hisaab se change kar sakte ho
                width: "200px",
                objectFit: "contain"
              }}
            />
          </div>
        </div>

        {/* Notification and User */}
        <div className="d-flex align-items-center gap-3 position-relative">
          {/* Notification */}
          <div className="position-relative">
            <FaBell size={18} color="white" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </div>

          {/* User Profile */}
          <div className="dropdown" ref={dropdownRef}>
            <div
              className="d-flex align-items-center gap-2 cursor-pointer text-white"
              role="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle size={24} />
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
                        // setShowProfileModal(true);
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
                  <a className="dropdown-item text-danger" href="/">Logout</a>
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