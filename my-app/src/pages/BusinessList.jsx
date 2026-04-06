import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BussinessList.css";

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

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

  useEffect(() => {
    if (!token) {
      setMessage("❌ Admin not logged in");
      setLoading(false);
      return;
    }
    fetchBusinesses();
  }, [token]);

  if (loading) return <p className="loading">Loading businesses...</p>;

  return (
    <div className="business-table-container">
      <h2>Registered Businesses</h2>

      {message && <p className="form-message">{message}</p>}

      {businesses.length === 0 ? (
        <p>No businesses found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="business-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Categories</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Website</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {businesses.map((b) => (
                <tr key={b._id}>
                  <td className="name-cell">
                    {b.logo && (
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="business-logo"
                      />
                    )}
                    {b.name}
                  </td>

                  <td>
                    {Array.isArray(b.categories)
                      ? b.categories.join(", ")
                      : b.categories || "—"}
                  </td>

                  <td>{b.phone || "—"}</td>
                  <td>{b.email || "—"}</td>
                  <td className="truncate">{b.address || "—"}</td>

                  <td>
                    {b.website ? (
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>
                    {b.location?.lat && b.location?.lng
                      ? `${b.location.lat.toFixed(3)}, ${b.location.lng.toFixed(
                          3
                        )}`
                      : "—"}
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(b._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BusinessList;