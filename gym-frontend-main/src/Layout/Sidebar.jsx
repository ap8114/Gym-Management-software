import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUsers,
  faCalendarAlt,
  faClipboardCheck,
  faDollarSign,
  faComments,
  faChalkboardTeacher,
  faGear,
  faChevronDown,
  faUserTag,
  faFileAlt,
  faUserGear,
  faCalculator,
  faChartLine,
  faAddressBook,
  faCalendarDays,
  faClapperboard,
  faStarOfDavid,
  faMoneyBillAlt,
  faNetworkWired,
  faChartArea,
  faCaretRight,
  faEye,
  faBookAtlas,
  faUserGroup,
  faCogs
} from "@fortawesome/free-solid-svg-icons";

import "./Sidebar.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);
  const [userRole, setUserRole] = useState(null); // Initialize as null instead of "admin"

  useEffect(() => {
    // Get role from localStorage and ensure it's uppercase to match our keys
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role.toUpperCase()); // Convert to uppercase to match our keys
    }
  }, []); // Add empty dependency array to run only once on mount

  // Listen for storage changes to update role when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem("userRole");
      if (role) {
        setUserRole(role.toUpperCase());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleMenu = (menuKey) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setCollapsed(true);
  };

  // ------------------ MENUS ------------------
  const allMenus = {
    SUPERADMIN: [
      { name: "Dashboard", icon: faChartBar, path: "/superadmin/dashboard" },
      { name: "Branches", icon: faGear, path: "/admin/AdminBranches" },
      { name: "Admin", icon: faUsers, path: "/superadmin/Admin" },
      { name: "Request Plan", icon: faClipboardCheck, path: "/superadmin/request-plan" },
      { name: "Plans & Pricing", icon: faChartLine, path: "/superadmin/Plans&Pricing" },
      { name: "Payments", icon: faMoneyBillAlt, path: "/superadmin/payments" },
      // { name: "Setting", icon:  faCogs, path: "/superadmin/setting" },
      { name: "Setting", icon: faCogs, path: "/member/account" },
    ],

    ADMIN: [
      { name: "Dashboard", icon: faChartBar, path: "/admin/admin-dashboard" },
      { name: "Members", icon: faUsers, path: "/admin/AdminMember" },
      { name: "Create Plan", icon: faUsers, path: "/admin/createplan" },
      { name: "Classes Schedule", icon: faUsers, path: "/admin/classesSchedule" },
      { name: "Session Bookings", icon: faCalendarAlt, path: "/admin/bookings" },

      {
        name: "Staff",
        icon: faUsers,
        key: "Staff",
        subItems: [
          { label: "Manage Staff", path: "/admin/staff/manage-staff" },
          { label: "Attendance", path: "/admin/staff/attendance" },
          { label: "Salary Calculator", path: "/admin/staff/salary-calculator" }
        ]
      },
      { name: "Shift Managment", icon: faCalendarAlt, path: "/admin/shift-managment" },
      { name: "Task Managment", icon: faCalendarAlt, path: "/admin/task-managment" },

      {
        name: "Personal Training Details",
        icon: faFileAlt,
        path: "/admin/booking/personal-training"
      },

      // {
      //   name: "Payments",
      //   icon: faCalculator,
      //   path: "/admin/payments/membership",
      // },

      {
        name: "Reports",
        icon: faChartLine,
        key: "reports",
        subItems: [
          { label: "Sales Report", path: "/admin/reports/sales" },
          { label: "Attendance Report", path: "/admin/reports/AttendanceReport" }
        ]
      },

      {
        name: "Settings",
        icon: faGear,
        // path: "/admin/settings/RoleManagement"
        path: "/admin/settings"
      }
    ],

    HOUSEKEEPING: [
      { name: "Dashboard", icon: faChartBar, path: "/housekeeping/dashboard" },
      { name: "Shift Management", icon: faUsers, path: "/housekeeping/shift-management" },
      { name: "Task Checklist", icon: faCalendarAlt, path: "/housekeeping/duty-roster" },
      { name: "QR Check-in", icon: faGear, path: "/housekeeping/qrcheckin" },
      { name: "Attendance Marking", icon: faUserTag, path: "/housekeeping/membership-plan" },

      // { name: "Duty Roster", icon: faUsers, path: "/housekeeping/members" },
      // { name: "Notifications", icon: faCalendarDays, path: "/housekeeping/class-schedule" }
    ],

    GENERALTRAINER: [
      { name: "Dashboard", icon: faChartBar, path: "/generaltrainer/dashboard" },
      { name: "Classes Schedule", icon: faUsers, path: "/generaltrainer/classesschedule" },
      { name: "Shift Managment", icon: faCalendarAlt, path: "/GeneralTrainer/shift-managment" },
      { name: "Task Checklist", icon: faCalendarAlt, path: "/housekeeping/duty-roster" },
      { name: "Session Bookings", icon: faCalendarAlt, path: "/generaltrainer/bookings" },
      { name: "Qr Check-in", icon: faGear, path: "/generaltrainer/qrcheckin" },
      { name: "Attendance", icon: faClipboardCheck, path: "/generaltrainer/attendance" },
      { name: "GroupPlans & Bookings", icon: faUserGroup, path: "/generaltrainer/groupplansbookings" },
      { name: "Reports Classes", icon: faFileAlt, path: "/generaltrainer/Reports" },
    ],

    PERSONALTRAINER: [
      { name: "Dashboard", icon: faChartBar, path: "/personaltrainer/dashboard" },
      { name: "Classes Schedule", icon: faUsers, path: "/personaltrainer/classesschedule" },
      { name: "Shift Managment", icon: faCalendarAlt, path: "/personaltrainer/shift-managment" },
      { name: "Task Checklist", icon: faCalendarAlt, path: "/housekeeping/duty-roster" },
      { name: "Session Bookings", icon: faCalendarAlt, path: "/personaltrainer/bookings" },
      { name: "QR Check-in", icon: faGear, path: "/personaltrainer/qrcheckin" },
      { name: "Attendance", icon: faGear, path: "/personaltrainer/personalattendance" },
      { name: "Plans & Bookings", icon: faBookAtlas, path: "/personaltrainer/PersonalPlansBookings" },
    ],

    RECEPTIONIST: [
      { name: "Dashboard", icon: faChartBar, path: "/receptionist/dashboard" },
      { name: "QR Check-in", icon: faGear, path: "/receptionist/qrcheckin" },
      { name: "Walk-in Registration", icon: faFileAlt, path: "/receptionist/walk-in-registration" },
      // { name: "New Sign-ups", icon: faFileAlt, path: "/receptionist/new-sign-ups" },
      { name: "QR Attendance", icon: faFileAlt, path: "/receptionist/qr-attendance" },
      { name: "Book Classes & Sessions", icon: faFileAlt, path: "/receptionist/book-classes-sessions" },
      { name: "Payment", icon: faFileAlt, path: "/receptionist/payemnet" }
    ],



    MANAGER: [
      { name: "Dashboard", icon: faChartBar, path: "/manager/dashboard" },
      { name: "Members", icon: faUsers, path: "/manager/members" },
      { name: "Duty Roster", icon: faClipboardCheck, path: "/manager/duty-roster" },
      { name: "Class Schedule", icon: faCalendarAlt, path: "/manager/class-schedule" },
      { name: "Reports", icon: faFileAlt, path: "/manager/reports" },
      { name: "Communication", icon: faComments, path: "/manager/communication" },
    ],

    MEMBER: [
      { name: "Dashboard", icon: faChartBar, path: "/member/dashboard" },
      // { name: "Task Checklist", icon: faCalendarAlt, path: "/housekeeping/duty-roster" },
      { name: "QR Check-in", icon: faGear, path: "/member/qrcheckin" },
      { name: "Attendance", icon: faGear, path: "/member/memberattendance" },
      { name: "View Plan", icon: faEye, path: "/member/viewplan" },
      { name: "Requests Plan", icon: faEye, path: "/member/requestplan" },
      { name: "Class Schedule", icon: faClapperboard, path: "/member/classSchedule" },
      { name: "My Account", icon: faMoneyBillAlt, path: "/member/account" }
    ],




  };

  // Default to ADMIN if no role is found
  const userMenus = userRole ? allMenus[userRole] : allMenus.ADMIN;

  // Add a loading state or fallback if userRole is still null
  if (!userRole) {
    return <div className="sidebar-container">
      <div className="sidebar">
        <div className="p-3 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>;
  }

  return (
    <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar">
        <ul className="menu">
          {userMenus.map((menu, index) => {
            if (!menu.subItems) {
              return (
                <li key={index} className="menu-item">
                  <div
                    className={`menu-link ${isActive(menu.path) ? "active" : ""}`}
                    onClick={() => handleNavigate(menu.path)}
                  >
                    <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                    {!collapsed && <span className="menu-text">{menu.name}</span>}
                  </div>
                </li>
              );
            }

            return (
              <li key={index} className="menu-item">
                <div
                  className="menu-link mb-2"
                  onClick={() => toggleMenu(menu.key)}
                >
                  <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                  {!collapsed && <span className="menu-text">{menu.name}</span>}
                  {!collapsed && (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`arrow-icon ${activeMenu === menu.key ? "rotate" : ""}`}
                    />
                  )}
                </div>

                {!collapsed && activeMenu === menu.key && (
                  <ul className="submenu">
                    {menu.subItems.map((sub, i) => (
                      <li
                        key={i}
                        className={`submenu-item mb-2 ${isActive(sub.path) ? "active-sub" : ""}`}
                        onClick={() => handleNavigate(sub.path)}
                      >
                        {sub.label}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;