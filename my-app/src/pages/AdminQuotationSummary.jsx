import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminQuotationsPage.css";

const AdminQuotationSummary = ({ procurementId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!procurementId) return;

    if (!token) {
      setMessage("❌ Admin not logged in");
      setLoading(false);
      return;
    }

    const loadSummary = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/invitations/summary/${procurementId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        setMessage(
          err.response?.data?.message ||
            "❌ Failed to load quotation summary (check token)"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [procurementId, token]);

  if (loading) return <p className="loading">Loading summary...</p>;
  if (!summary) return <p className="error">{message}</p>;

  const { procurement, businesses, items } = summary;

  return (
    <div className="quotation-page">
      <h2>🏆 Quotation Summary</h2>

      <p>
        <b>Procurement:</b> {procurement.title} | <b>Ref:</b>{" "}
        {procurement.referenceNumber} | <b>Department:</b>{" "}
        {procurement.requestingDepartment}
      </p>

      <div className="table-wrapper">
        <table className="summary-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Unit</th>
              <th>Qty</th>
              {businesses.map((b) => (
                <th key={b.businessId}>{b.name}</th>
              ))}
              <th>Winner</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, idx) => (
              <tr key={item.itemId}>
                <td>{idx + 1}</td>
                <td>{item.itemName}</td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>

                {businesses.map((b) => {
                  const quote = item.quotes[b.businessId];

                  return (
                    <td key={b.businessId}>
                      {quote ? (
                        <b>{quote.unitPrice.toLocaleString()} ETB</b>
                      ) : (
                        "—"
                      )}
                    </td>
                  );
                })}

                <td>
                  {item.winnerBusinessId
                    ? businesses.find(
                        (b) => b.businessId === item.winnerBusinessId
                      )?.name
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={() => window.print()} className="print-button">
        🖨️ Export / Print
      </button>
    </div>
  );
};

export default AdminQuotationSummary;
