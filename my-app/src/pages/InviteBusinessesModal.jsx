import React, { useEffect, useState } from "react";
import axios from "axios";
import "./InviteBusinessesModal.css";

const InviteBusinessesModal = ({ procurementId, onClose }) => {
  const [businesses, setBusinesses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    loadBusinesses();
  }, [search]);

  const loadBusinesses = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/businesses?search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBusinesses(res.data);
    } catch {
      setMessage("❌ Failed to load businesses");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const invite = async () => {
    if (selected.length === 0) {
      return setMessage("❌ Select at least one business");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/invitations",
        {
          procurementId,
          businessIds: selected,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Businesses invited successfully");

      setTimeout(onClose, 1200);
    } catch {
      setMessage("❌ Invitation failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <header>
          <h3>Invite Businesses</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </header>

        {message && <p className="modal-message">{message}</p>}

        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="business-list">
          {businesses.map((b) => (
            <label key={b._id} className="business-item">
              <input
                type="checkbox"
                checked={selected.includes(b._id)}
                onChange={() => toggleSelect(b._id)}
              />

              <div>
                <strong>{b.name}</strong>

                <span>{b.categories?.join(", ")}</span>

                <span>
                  Contact: {b.contactPerson?.name}
                </span>

                <span>{b.phone}</span>

                <span>{b.email}</span>
              </div>
            </label>
          ))}
        </div>

        <footer>
          <button className="primary-btn" onClick={invite}>
            Send Invitations
          </button>
        </footer>
      </div>
    </div>
  );
};

export default InviteBusinessesModal;