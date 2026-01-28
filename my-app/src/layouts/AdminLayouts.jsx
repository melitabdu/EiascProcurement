import React from 'react';
import Sidebar from '../components/Sidebar'; // Assuming you have a Sidebar component for admin navigation
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
