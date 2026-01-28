import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminNavbar = () => {
  const { logoutAdmin } = useAdminAuth();

  return (
    <nav className="admin-navbar">
      <h1>Admin Panel</h1>
      <button onClick={logoutAdmin}>Logout</button>
    </nav>
  );
};

export default AdminNavbar;
