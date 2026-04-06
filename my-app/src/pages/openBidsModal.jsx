import React, { useState } from "react";
import axios from "axios";

const OpenBidsModal = ({ procurement, onClose, onOpened }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [approvals, setApprovals] = useState(
    procurement?.bidOpenedBy?.length || 0
  );
  const [message, setMessage] = useState("");

  // ✅ NEW STATE
  const [initiated, setInitiated] = useState(
    procurement?.bidOpenRequested || false
  );

  const token = localStorage.getItem("adminToken");

  /* ======================
     INITIATE OPENING (ADMIN)
  ====================== */
  const initiateOpening = async () => {
  try {
    const res = await axios.post(
      `http://localhost:5000/api/procurements/${procurement._id}/approve-open`,
      {}, // no body needed
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

      setInitiated(true);
      setMessage(res.data.message || "✅ Opening initiated");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Failed to initiate opening"
      );
    }
  };

  /* ======================
     COMMITTEE APPROVAL
  ====================== */
  const approve = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/procurements/${procurement._id}/committee-approve`,
        { phone, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApprovals(res.data.approvalsCount);
      setPhone("");
      setPassword("");
      setMessage(res.data.message || "✅ Approval recorded");

      if (res.data.bidOpened === true) {
        onOpened();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "❌ Approval failed";

      setMessage(errorMessage);

      if (errorMessage.toLowerCase().includes("already opened")) {
        onOpened();
      }
    }
  };

  /* ======================
     FINALIZE (ADMIN)
  ====================== */
  const finalize = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/procurements/${procurement._id}/finalize-open`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onOpened();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "❌ Finalization failed";

      setMessage(errorMessage);

      if (errorMessage.toLowerCase().includes("already opened")) {
        onOpened();
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>🔐 Bid Opening Ceremony</h3>

        <p><b>{procurement.title}</b></p>
        <p>Approvals: {approvals} / 3 required</p>

        {/* ========================= */}
        {/* ✅ ADMIN INITIATE BUTTON */}
        {/* ========================= */}
        <button
          onClick={initiateOpening}
          disabled={initiated}
          className="initiate-btn"
        >
          {initiated ? "✅ Opening Initiated" : "🚀 Initiate Opening"}
        </button>

        {/* ========================= */}
        {/* COMMITTEE SECTION */}
        {/* ========================= */}
        <input
          placeholder="Committee Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!initiated}
        />

        <input
          type="password"
          placeholder="Committee Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!initiated}
        />

        <button onClick={approve} disabled={!initiated}>
          Approve Opening
        </button>

        {/* ========================= */}
        {/* FINALIZE */}
        {/* ========================= */}
        {approvals >= 3 && (
          <button className="finalize-btn" onClick={finalize}>
            🔓 Finalize Opening
          </button>
        )}

        {message && <p className="message">{message}</p>}

        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OpenBidsModal;