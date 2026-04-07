import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BusinessLoginPage from './pages/BusinessLoginPage';
import BusinessDashboard from './pages/BusinessDashboard';
import { BusinessAuthProvider } from './context/BusinessAuthContext';

const App = () => {
  return (
    <BusinessAuthProvider>
      <Routes>
        <Route path="/" element={<BusinessLoginPage />} />
        <Route path="/login" element={<BusinessLoginPage />} />
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
      </Routes>
    </BusinessAuthProvider>
  );
};

export default App;
