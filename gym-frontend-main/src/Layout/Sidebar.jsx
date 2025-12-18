import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faCodeBranch,
  faUserShield,
  faClipboardList,
  faTags,
  faCreditCard,
  faCogs,
  faUsers,
  faPlusCircle,
  faChalkboardTeacher,
  faCalendarCheck,
  faUserTie,
  faClock,
  faChevronDown,
  faTasks,
  faDumbbell,
  faChartPie,
  faTools,
  faBroom,
  faQrcode,
  faUserCheck,
  faCalendar,
  faClipboardCheck,
  faLayerGroup,
  faFileInvoice,
  faBookAtlas,
  faUserPlus,
  faDoorOpen,
  faMoneyCheckAlt,
  faUserFriends,
  faComments,
  faEye,
  faClapperboard,
  faIdCard
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
      { name: "Branches", icon: faCodeBranch, path: "/admin/AdminBranches" },
      { name: "Admin", icon: faUserShield, path: "/superadmin/Admin" },
      { name: "Request Plan", icon: faClipboardList, path: "/superadmin/request-plan" },
      { name: "Plans & Pricing", icon: faTags, path: "/superadmin/Plans&Pricing" },
      { name: "Payments", icon: faCreditCard, path: "/superadmin/payments" },
      { name: "Setting", icon: faCogs, path: "/member/account" },
    ],

    ADMIN: [
      { name: "Dashboard", icon: faChartBar, path: "/admin/admin-dashboard" },
      { name: "Members", icon: faUsers, path: "/admin/AdminMember" },
      { name: "QR Check-in", icon: faQrcode, path: "/admin/qrcheckin" },
      { name: "Create Plan", icon: faPlusCircle, path: "/admin/createplan" },
      { name: "Classes Schedule", icon: faChalkboardTeacher, path: "/admin/classesSchedule" },
      { name: "Session Bookings", icon: faCalendarCheck, path: "/admin/bookings" },

      {
        name: "Staff",
        icon: faUserTie,
        key: "Staff",
        subItems: [
          { label: "Manage Staff", path: "/admin/staff/manage-staff" },
          { label: "Attendance", path: "/admin/staff/attendance" },
          { label: "Salary Calculator", path: "/admin/staff/salary-calculator" }
        ]
      },

      { name: "Shift Management", icon: faClock, path: "/admin/shift-managment" },
      { name: "Task Management", icon: faTasks, path: "/admin/task-managment" },
      { name: "Personal Training Details", icon: faDumbbell, path: "/admin/booking/personal-training" },

      {
        name: "Reports",
        icon: faChartPie,
        key: "reports",
        subItems: [
          { label: "Sales Report", path: "/admin/reports/sales" },
          { label: "Attendance Report", path: "/admin/reports/AttendanceReport" }
        ]
      },

      { name: "Settings", icon: faTools, path: "/admin/settings" }
    ],

    HOUSEKEEPING: [
      { name: "Dashboard", icon: faChartBar, path: "/housekeeping/dashboard" },
      { name: "Shift Management", icon: faClock, path: "/housekeeping/shift-management" },
      { name: "Task Checklist", icon: faBroom, path: "/housekeeping/duty-roster" },
      { name: "QR Check-in", icon: faQrcode, path: "/housekeeping/qrcheckin" },
      // { name: "Attendance Marking", icon: faUserCheck, path: "/housekeeping/membership-plan" }
    ],

    GENERALTRAINER: [
      { name: "Dashboard", icon: faChartBar, path: "/generaltrainer/dashboard" },
      { name: "Classes Schedule", icon: faCalendar, path: "/generaltrainer/classesschedule" },
      { name: "Shift Management", icon: faClock, path: "/GeneralTrainer/shift-managment" },
      // { name: "Task Checklist", icon: faTasks, path: "/housekeeping/duty-roster" },
      { name: "Session Bookings", icon: faCalendarCheck, path: "/generaltrainer/bookings" },
      { name: "QR Check-in", icon: faQrcode, path: "/generaltrainer/qrcheckin" },
      { name: "Attendance", icon: faClipboardCheck, path: "/generaltrainer/attendance" },
      { name: "Group Plans & Bookings", icon: faLayerGroup, path: "/generaltrainer/groupplansbookings" },
      { name: "Reports Classes", icon: faFileInvoice, path: "/generaltrainer/Reports" },
    ],

    PERSONALTRAINER: [
      { name: "Dashboard", icon: faChartBar, path: "/personaltrainer/dashboard" },
      { name: "Classes Schedule", icon: faCalendar, path: "/personaltrainer/classesschedule" },
      { name: "Shift Management", icon: faClock, path: "/personaltrainer/shift-managment" },
      // { name: "Task Checklist", icon: faTasks, path: "/housekeeping/duty-roster" },
      { name: "Session Bookings", icon: faCalendarCheck, path: "/personaltrainer/bookings" },
      { name: "QR Check-in", icon: faQrcode, path: "/personaltrainer/qrcheckin" },
      { name: "Attendance", icon: faClipboardCheck, path: "/personaltrainer/personalattendance" },
      { name: "Plans & Bookings", icon: faBookAtlas, path: "/personaltrainer/PersonalPlansBookings" },
      { name: "Reports Classes", icon: faFileInvoice, path: "/personaltrainer/report" },
    ],

    RECEPTIONIST: [
      { name: "Dashboard", icon: faChartBar, path: "/receptionist/dashboard" },
      { name: "Walk-in Registration", icon: faUserPlus, path: "/receptionist/walk-in-registration" },
      { name: "Book Classes & Sessions", icon: faCalendarCheck, path: "/receptionist/book-classes-sessions" },
      { name: "QR Check-in", icon: faQrcode, path: "/receptionist/qrcheckin" },
      { name: "Attendance Marking", icon: faDoorOpen, path: "/receptionist/qr-attendance" },
         { name: "Housekeeping Check-out", icon: faDoorOpen, path: "/receptionist/report-attendance-checkout" },
      { name: "Reports Attendance", icon: faFileInvoice, path: "/receptionist/reportattendance" },
      { name: "Reports Classes", icon: faFileInvoice, path: "/receptionist/report" },
    ],

    MANAGER: [
      { name: "Dashboard", icon: faChartBar, path: "/manager/dashboard" },
      { name: "Members", icon: faUserFriends, path: "/manager/members" },
      { name: "Duty Roster", icon: faClipboardCheck, path: "/manager/duty-roster" },
      { name: "Class Schedule", icon: faCalendar, path: "/manager/class-schedule" },
      { name: "Reports", icon: faFileInvoice, path: "/manager/reports" },
      { name: "Communication", icon: faComments, path: "/manager/communication" },
    ],

    MEMBER: [
      { name: "Dashboard", icon: faChartBar, path: "/member/dashboard" },
      { name: "QR Check-in", icon: faQrcode, path: "/member/qrcheckin" },
      { name: "Attendance", icon: faClipboardCheck, path: "/member/memberattendance" },
      { name: "View Plan", icon: faEye, path: "/member/viewplan" },
      // { name: "Requests Plan", icon: faClipboardList, path: "/member/requestplan" },
      { name: "Class Schedule", icon: faClapperboard, path: "/member/classSchedule" },
      { name: "My Account", icon: faIdCard, path: "/member/account" }
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