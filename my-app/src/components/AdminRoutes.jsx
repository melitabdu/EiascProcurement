import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const { pathname } = useLocation();

  // ✅ If no admin token, force them to /admin/register
  if (!token) {
    if (pathname !== "/admin/register") {
      return <Navigate to="/admin/register" replace />;
    }
  }

  return children;
};

export default AdminRoute;
