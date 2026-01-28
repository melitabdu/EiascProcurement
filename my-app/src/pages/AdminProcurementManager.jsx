import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminQuotationsPage.css";

const AdminQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/invitations/submitted",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQuotations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Loading quotations...</p>;

  return (
    <div className="quotation-page">
      <h2>📑 Submitted Quotations</h2>
      {message && <p className="error">{message}</p>}

      {quotations.length === 0 ? (
        <p>No quotations submitted yet.</p>
      ) : (
        quotations.map((inv) => (
          <div key={inv._id} className="quotation-card">
            <h3>
              🏢 {inv.business?.name || "—"} | 📝{" "}
              {inv.procurement?.referenceNumber || "—"}
            </h3>
            <p>
              <b>Procurement:</b> {inv.procurement?.title || "—"} |{" "}
              <b>Status:</b> {inv.status}
            </p>
            <p>
              <b>Price Valid Until:</b>{" "}
              {inv.quotation?.priceValidityUntil
                ? new Date(inv.quotation.priceValidityUntil).toDateString()
                : "—"}
            </p>

            <div className="table-wrapper">
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Unit Price (ETB)</th>
                    <th>Total Price (ETB)</th>
                    <th>Delivery (Days)</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.quotation?.items?.map((item, idx) => (
                    <tr key={item.procurementItemId}>
                      <td>{idx + 1}</td>
                      <td>{item.itemName || "—"}</td>
                      <td>{item.unit || "—"}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice?.toLocaleString() ?? "—"}</td>
                      <td>{item.totalPrice?.toLocaleString() ?? "—"}</td>
                      <td>{item.deliveryTimeDays ?? "—"}</td>
                      <td>{item.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminQuotationsPage;
