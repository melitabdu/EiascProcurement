import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminQuotationSummary from "./AdminQuotationSummary"; // summary component
import "./AdminQuotationsPage.css";

const AdminQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [summaryProcurementId, setSummaryProcurementId] = useState(null); // for summary view
  const token = localStorage.getItem("adminToken");
  const hasFetched = useRef(false); // prevents infinite loop

  useEffect(() => {
    if (!token || hasFetched.current) return;

    hasFetched.current = true;
    loadQuotations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setMessage(err.response?.data?.message || "❌ Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Loading quotations...</p>;
  if (quotations.length === 0) return <p>No quotations submitted yet.</p>;

  return (
    <div className="quotation-page">
      <h2>📑 Submitted Quotations</h2>
      {message && <p className="error">{message}</p>}

      {/* Show summary page if a procurement is selected */}
      {summaryProcurementId ? (
        <div>
          <button onClick={() => setSummaryProcurementId(null)} className="back-button">
            🔙 Back to Quotations
          </button>
          <AdminQuotationSummary procurementId={summaryProcurementId} />
        </div>
      ) : (
        quotations.map((inv) => {
          const q = inv.quotation;
          return (
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
                {q?.priceValidityUntil
                  ? new Date(q.priceValidityUntil).toDateString()
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
                      <tr key={item.procurementItemId || idx}>
                        <td>{idx + 1}</td>
                        <td>{item.itemName || "—"}</td>
                        <td>{item.unit || "—"}</td>
                        <td>{item.quantity}</td>
                        <td>
                          {item.unitPrice != null
                            ? item.unitPrice.toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          {item.totalPrice != null
                            ? item.totalPrice.toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          {item.deliveryTimeDays != null
                            ? item.deliveryTimeDays
                            : "—"}
                        </td>
                        <td>{item.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ✅ View Summary Button */}
              <button
                className="summary-button"
                onClick={() =>
                  setSummaryProcurementId(inv.procurement?._id || null)
                }
              >
                📊 View Summary
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminQuotationsPage;
