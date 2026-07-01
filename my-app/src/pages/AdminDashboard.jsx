// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import './AdminDashBoard.css';

const AdminDashboard = () => {
  const [search, setSearch] = useState('');

  // Example stats (replace with backend data if needed)
  const stats = [
    { title: 'Total Businesses', value: 3 },
    { title: 'Active Ads', value: 2 },
  ];

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="admin-dashboard-container">
      <h2>📊 Admin Dashboard</h2>

      {/* Search bar */}
      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={handleSearchChange}
        />
        <button>🔍</button>
      </div>

      {/* Statistics cards */}
      <div className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.value}</h3>
            <p>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="dashboard-links">
        <h3>Quick Actions</h3>
        <div className="links-grid">
          <button onClick={() => window.location.href = '/admin/business/add'}>
            ➕ Add Business
          </button>
          <button onClick={() => window.location.href = '/admin/business/list'}>
            📋 Business List
          </button>
          <button onClick={() => window.location.href = '/admin/advideos'}>
            🎥 Manage Ads
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
