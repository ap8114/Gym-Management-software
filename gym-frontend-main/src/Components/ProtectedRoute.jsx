import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute - Route protection with role-based access control
 * @param {React.Component} children - Component to render if authorized
 * @param {string|string[]} allowedRoles - Single role or array of roles allowed to access
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 */
const ProtectedRoute = ({ children, allowedRoles = null, requireAuth = true }) => {
  const location = useLocation();
  
  // Get authentication data from localStorage
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // If authentication is required but no token exists, redirect to login
  if (requireAuth && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role-based access is specified, check if user has required role
  if (allowedRoles && userRole) {
    const normalizedUserRole = userRole.toUpperCase();
    const normalizedAllowedRoles = Array.isArray(allowedRoles)
      ? allowedRoles.map(role => role.toUpperCase())
      : [allowedRoles.toUpperCase()];

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      // User doesn't have required role, redirect to their dashboard
      const roleDashboardMap = {
        'SUPERADMIN': '/superadmin/dashboard',
        'ADMIN': '/admin/admin-dashboard',
        'MANAGER': '/manager/dashboard',
        'GENERALTRAINER': '/generaltrainer/dashboard',
        'PERSONALTRAINER': '/personaltrainer/dashboard',
        'MEMBER': '/member/dashboard',
        'HOUSEKEEPING': '/housekeeping/dashboard',
        'RECEPTIONIST': '/receptionist/dashboard',
      };

      const redirectPath = roleDashboardMap[normalizedUserRole] || '/member/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and authorized, render the component
  return children;
};

export default ProtectedRoute;


