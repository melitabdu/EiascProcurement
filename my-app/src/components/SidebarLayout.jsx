import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./SidebarLayout.css";

export default function SidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const navigate = useNavigate();

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("adminToken"));
    };

    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="app-container">
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2>Admin Panel</h2>

        <nav>
          <ul>
            {token && (
              <>
                <li>
                  <Link to="/admin/dashboard">Dashboard</Link>
                </li>

                <li>
                  <Link to="/admin/business/add">Add Business</Link>
                </li>

                <li>
                  <Link to="/admin/business/list">Business List</Link>
                </li>

                <li>
                  <Link to="/admin/procurements">Manage Procurements</Link>
                </li>

                <li>
                  <Link to="/admin/procurements/requests">
                    Staff Requests
                  </Link>
                </li>

                {/* 🔐 Sealed / New Bids */}
                <li>
                  <Link to="/admin/procurements/quotations/new">
                    📨 New (Sealed) Bids
                  </Link>
                </li>

                {/* 📊 Opened Bids */}
                <li>
                  <Link to="/admin/procurements/quotations/opened">
                    📊 Opened Bids
                  </Link>
                </li>

                {/* 👥 Committee Registration */}
                <li>
                  <Link to="/admin/committee">
                    👥 Committee Registration
                  </Link>
                </li>
               

<li>
  <Link to="/admin/audit-logs">
    Audit Logs
  </Link>
</li>

                <li>
                  <Link to="/admin/advideos">Advertising Videos</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {token && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </aside>

      <main
        className="main-content"
        onClick={() => sidebarOpen && setSidebarOpen(false)}
      >
        <Outlet />
      </main>
    </div>
  );
}
