import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminQuotationSummary from "./AdminQuotationSummary";
import "./AdminQuotationsPage.css";

const AdminOpenedQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [summaryProcurementId, setSummaryProcurementId] = useState(null);

  const token = localStorage.getItem("adminToken");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token || hasFetched.current) return;
    hasFetched.current = true;
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/invitations/submitted`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      /* ================= FILTER OPENED BIDS ================= */
      const opened = (res.data || []).filter(
        (inv) =>
          inv.procurement &&
          inv.procurement.deadline &&
          inv.procurement.bidOpened === true
      );

      /* ================= GROUP BY PROCUREMENT ================= */
      const grouped = {};

      opened.forEach((inv) => {
        const ref = inv.procurement.referenceNumber || "UNKNOWN";

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
      setMessage(err.response?.data?.message || "❌ Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Loading quotations...</p>;

  if (quotations.length === 0) return <p>No opened bids yet.</p>;

  return (
    <div className="quotation-page">
      <h2>📑 Opened Bids</h2>

      {message && <p className="error">{message}</p>}

      {summaryProcurementId ? (
        <div>
          <button
            onClick={() => setSummaryProcurementId(null)}
            className="back-button"
          >
            🔙 Back to Bids
          </button>

          <AdminQuotationSummary procurementId={summaryProcurementId} />
        </div>
      ) : (
        quotations.map((group, idx) => {
          const { procurement, quotations: invs } = group;

          /* ================= CREATE ITEM LOOKUP ================= */
          const itemMap = {};
          procurement.items?.forEach((it) => {
            itemMap[it._id] = it;
          });

          return (
            <div key={procurement._id || idx} className="quotation-card">
              <h3>
                📝 {procurement.referenceNumber} | {procurement.title}
              </h3>

              <p>
                <b>Total Businesses Submitted:</b> {invs.length}
              </p>

              {invs.map((inv, i) => {
                const q = inv.quotation;

                return (
                  <div key={inv._id || i} className="quotation-inner-card">
                    <h4>🏢 {inv.business?.name || "—"}</h4>

                    <p>Status: {inv.status}</p>

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
                            <th>Unit Price (ETB)</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>

                        <tbody>
                          {q?.items?.map((item, idx2) => {
                            const procurementItem =
                              itemMap[item.procurementItemId];

                            return (
                              <tr
                                key={
                                  item.procurementItemId ||
                                  item._id ||
                                  idx2
                                }
                              >
                                <td>{idx2 + 1}</td>

                                <td>
                                  {procurementItem?.itemName || "—"}
                                </td>

                                <td>
                                  {procurementItem?.unit || "—"}
                                </td>

                                <td>
                                  {item.unitPrice != null
                                    ? item.unitPrice.toLocaleString()
                                    : "—"}
                                </td>

                                <td>{item.remarks || "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              <button
                className="summary-button"
                onClick={() => setSummaryProcurementId(procurement._id)}
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

export default AdminOpenedQuotationsPage;