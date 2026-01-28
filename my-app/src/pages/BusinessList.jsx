import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BussinessList.css";

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Get admin token from localStorage (adjust if you use context)
  const token = localStorage.getItem("adminToken");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =========================
  // Fetch all businesses
  // =========================
  const fetchBusinesses = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(
        "http://localhost:5000/api/businesses",
        authConfig
      );
      setBusinesses(res.data);
    } catch (err) {
      console.error("Failed to fetch businesses", err);
      setMessage(
        err.response?.data?.message || "❌ Failed to load businesses"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Delete a business
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this business?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/businesses/${id}`,
        authConfig
      );
      setMessage("✅ Business deleted successfully");
      setBusinesses((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Failed to delete business");
    }
  };

  // =========================
  // Fetch businesses on mount
  // =========================
  useEffect(() => {
    if (!token) {
      setMessage("❌ Admin not logged in");
      setLoading(false);
      return;
    }
    fetchBusinesses();
  }, [token]);

  // =========================
  // Render
  // =========================
  if (loading) return <p>Loading businesses...</p>;

  return (
    <div className="business-list-container">
      <h2>Registered Businesses</h2>
      {message && <p className="form-message">{message}</p>}

      {businesses.length === 0 ? (
        <p>No businesses found.</p>
      ) : (
        <div className="business-grid">
          {businesses.map((b) => (
            <div key={b._id} className="business-card">
              {b.logo && (
                <img src={b.logo} alt={b.name} className="business-logo" />
              )}
              <h3>{b.name}</h3>
              <p>
                <strong>Categories:</strong>{" "}
                {Array.isArray(b.categories) ? b.categories.join(", ") : b.categories}
              </p>
              <p>
                <strong>Address:</strong> {b.address || "—"}
              </p>
              <p>
                <strong>Phone:</strong> {b.phone || "—"}
              </p>
              <p>
                <strong>Email:</strong> {b.email || "—"}
              </p>
              {b.website && (
                <p>
                  <strong>Website:</strong>{" "}
                  <a href={b.website} target="_blank" rel="noreferrer">
                    {b.website}
                  </a>
                </p>
              )}
              {b.location?.lat && b.location?.lng && (
                <p>
                  📍 {b.location.lat.toFixed(3)}, {b.location.lng.toFixed(3)}
                </p>
              )}
              <div className="business-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(b._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessList;
