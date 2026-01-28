// src/context/AdminAuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);

  const loginAdmin = (token) => {
    localStorage.setItem('adminToken', token);
    setToken(token);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ token, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
