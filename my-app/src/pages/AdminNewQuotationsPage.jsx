import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import OpenBidsModal from "./OpenBidsModal";
import "./AdminQuotationsPage.css";

const AdminNewQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedProcurement, setSelectedProcurement] = useState(null);

  const token = localStorage.getItem("adminToken");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token || hasFetched.current) return;
    hasFetched.current = true;
    loadSealedQuotations();
  }, []);

  const loadSealedQuotations = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.get(
        "http://localhost:5000/api/invitations/submitted",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Only check if NOT opened
      const sealed = (res.data || []).filter(
        (inv) =>
          inv.procurement &&
          inv.procurement.bidOpened !== true
      );

      const grouped = {};

      sealed.forEach((inv) => {
        const ref =
          inv.procurement.referenceNumber ||
          inv.procurement._id;

        if (!grouped[ref]) {
          grouped[ref] = {
            procurement: inv.procurement,
            quotations: [],
          };
        }

        grouped[ref].quotations.push(inv);
      });

      setQuotations(Object.values(grouped));
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Failed to load sealed quotations"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="loading">Loading sealed bids...</p>;
  }

  return (
    <div className="quotation-page">
      <h2>🔐 Sealed Bids (Awaiting Opening Ceremony)</h2>

      {message && <p className="error">{message}</p>}

      {quotations.length === 0 && (
        <p>No sealed bids waiting for opening.</p>
      )}

      {quotations.map((group, idx) => {
        const { procurement, quotations: invs } = group;

        return (
          <div
            key={procurement._id || idx}
            className="quotation-card"
          >
            <h3>
              📝 {procurement.referenceNumber} | {procurement.title}
            </h3>

            <p>
              <b>Total Businesses Submitted:</b> {invs.length}
            </p>

            <div className="quotation-list">
              {invs.map((inv, i) => (
                <div
                  key={inv._id || i}
                  className="quotation-inner-card"
                >
                  <h4>
                    🏢 {inv.business?.name || "Unknown Business"}
                  </h4>
                  <p>Status: {inv.status}</p>
                  <p>
                    Submitted:{" "}
                    {new Date(inv.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="sealed-warning">
              🔒 Financial proposals remain sealed until official opening.
            </div>

            <button
              className="open-button"
              onClick={() =>
                setSelectedProcurement(procurement)
              }
            >
              🔐 Open Bid Ceremony
            </button>
          </div>
        );
      })}

      {selectedProcurement && (
        <OpenBidsModal
          procurement={selectedProcurement}
          onClose={() => setSelectedProcurement(null)}
          onOpened={() => {
            setSelectedProcurement(null);
            loadSealedQuotations();
          }}
        />
      )}
    </div>
  );
};

export default AdminNewQuotationsPage;