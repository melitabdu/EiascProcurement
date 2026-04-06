import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";

import AdminLogin from "./pages/AdminLogin";
import AdminDashbord from "./pages/AdminDashbord";
import SidebarLayout from "./components/SidebarLayout";
import AdminRoute from "./components/AdminRoutes";
import AdminVideoManager from "./pages/AdVideoManager";
import AdminRegister from "./pages/AdminRegister";
import AddBusiness from "./pages/AddBusiness";
import BusinessList from "./pages/BusinessList";
import AdminProcurementManager from "./pages/AdminProcurementManager";
import Request from "./pages/AdminRequest";

/* ✅ Quotation Pages */
import AdminOpenedQuotationsPage from "./pages/AdminOpenedQuotationsPage";
import AdminNewQuotationsPage from "./pages/AdminNewQuotationsPage";

/* ✅ NEW Committee Page */
import AdminCommitteePage from "./pages/AdminCommitteePage";
import AdminAuditLogs from "./pages/AdminAuditLogs";



const App = () => {
  const token = localStorage.getItem("adminToken");

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminAuthProvider>
              <SidebarLayout />
            </AdminAuthProvider>
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashbord />} />
        <Route path="business/add" element={<AddBusiness />} />
        <Route path="business/list" element={<BusinessList />} />
        <Route path="procurements" element={<AdminProcurementManager />} />
        <Route path="procurements/requests" element={<Request />} />

        {/* 🔐 Sealed / New Bids */}
        <Route
          path="procurements/quotations/new"
          element={<AdminNewQuotationsPage />}
        />

        {/* 📊 Opened Bids */}
        <Route
          path="procurements/quotations/opened"
          element={<AdminOpenedQuotationsPage />}
        />

        {/* 👥 Committee Registration */}
        <Route
          path="committee"
          element={<AdminCommitteePage />}
        />

        <Route path="advideos" element={<AdminVideoManager />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />

        {/* Default fallback inside admin */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Global fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={token ? "/admin/dashboard" : "/admin/login"}
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;
