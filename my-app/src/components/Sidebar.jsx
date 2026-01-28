import React from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2 className="logo">Tesfa Admin</h2>
      <button onClick={() => navigate('/add-provider')} className="sidebar-btn">➕ Add Providers</button>
      <button onClick={() => navigate('/list-providers')} className="sidebar-btn">📋 List Providers</button>
      <button onClick={() => navigate('/bookings')} className="sidebar-btn">📆 Bookings</button>
            <button
        onClick={() => navigate('/admin/ads')} className="sidebar-btn">  Manage Advertising Videos
      </button>

    </div>
  );
};

// ✅ This fixes the import error
export default Sidebar;
