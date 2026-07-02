import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useBusinessAuth } from "../context/BusinessAuthContext";
import "./BusinessDashboard.css";

const BusinessDashboard = () => {
  const { token, business, logoutBusiness } = useBusinessAuth();
  const [invitations, setInvitations] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [message, setMessage] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const loadInvitations = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://eiascprocurement-2.onrender.com/api/invitations/business",
        authHeaders
      );
      setInvitations(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Failed to load invitations");
    }
  }, [token]);

  useEffect(() => {
    if (business?.businessId) {
      loadInvitations();
    }
  }, [business, loadInvitations]);

  const handleItemChange = (invId, itemId, field, value) => {
    setQuotes((prev) => ({
      ...prev,
      [invId]: {
        ...prev[invId],
        items: {
          ...prev[invId]?.items,
          [itemId]: { ...prev[invId]?.items?.[itemId], [field]: value },
        },
      },
    }));
  };

  const handleGeneralChange = (invId, field, value) => {
    setQuotes((prev) => ({
      ...prev,
      [invId]: { ...prev[invId], [field]: value },
    }));
  };

  const submitQuotation = async (inv) => {
    const q = quotes[inv._id];
    if (!q?.priceValidityUntil)
      return setMessage("❌ Price validity date is required");

    const itemsPayload = (inv.procurement?.items || []).map((item) => {
      const data = q?.items?.[item._id] || {};
      return {
        procurementItemId: item._id,
        unitPrice: data.unitPrice ? Number(data.unitPrice) : null,
        deliveryTimeDays: data.deliveryTimeDays
          ? Number(data.deliveryTimeDays)
          : null,
        remarks: data.remarks || "",
      };
    });

    try {
      await axios.post(
        `https://eiascprocurement-2.onrender.com/api/invitations/${inv._id}/quotation`,
        {
          items: itemsPayload,
          priceValidityUntil: q.priceValidityUntil,
          generalRemarks: q.generalRemarks || "",
        },
        authHeaders
      );
      setMessage("✅ Quotation submitted successfully");
      loadInvitations();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Submission failed");
    }
  };

  const withdrawInvitation = async (invId) => {
    if (!window.confirm("Are you sure you want to withdraw this invitation?"))
      return;

    try {
      await axios.delete(
        `https://eiascprocurement-2.onrender.com/api/invitations/${invId}/withdraw`,
        authHeaders
      );
      setMessage("✅ Invitation withdrawn successfully");
      setInvitations((prev) => prev.filter((inv) => inv._id !== invId));
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Withdrawal failed");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        {business?.logo && (
          <img src={business.logo} alt="Logo" className="business-logo" />
        )}
        <h2>{business?.name || "Supplier Dashboard"}</h2>
        <button className="logout-btn" onClick={logoutBusiness}>
          Logout
        </button>
      </div>

      {message && <p className="form-message">{message}</p>}

      {invitations.length === 0 ? (
        <div className="no-invitation-box">
          <p>No invitations yet. 🎉</p>
        </div>
      ) : (
        invitations.map((inv) => {
          const p = inv.procurement || {
            title: "-",
            items: [],
            description: "",
          };
          const q = quotes[inv._id] || {};

          return (
            <div key={inv._id} className="invitation-card">
              <div className="inv-header">
                <h3>{p.title}</h3>
                <span className={`status-badge ${inv.status}`}>
                  {inv.status.toUpperCase()}
                </span>
              </div>

              <div className="inv-meta">
                <p>
                  <b>Reference:</b> {p.referenceNumber || "-"}
                </p>
                <p>
                  <b>Deadline:</b>{" "}
                  {p.deadline ? new Date(p.deadline).toDateString() : "-"}
                </p>
              </div>

              {p.description && (
                <div className="inv-description">
                  <p><b>Description:</b></p>
                  <p className="description-text">{p.description}</p>
                </div>
              )}

              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Unit Price (ETB)</th>
                      <th>Total</th>
                      <th>Delivery (Days)</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(p.items || []).map((item) => {
                      const itemQuote = q.items?.[item._id] || {};
                      const total = itemQuote.unitPrice
                        ? itemQuote.unitPrice * item.quantity
                        : "";

                      return (
                        <tr key={item._id}>
                          <td>{item.itemName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>
                            <input
                              type="number"
                              value={itemQuote.unitPrice || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  inv._id,
                                  item._id,
                                  "unitPrice",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>{total ? `${total} ETB` : "-"}</td>
                          <td>
                            <input
                              type="number"
                              value={itemQuote.deliveryTimeDays || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  inv._id,
                                  item._id,
                                  "deliveryTimeDays",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={itemQuote.remarks || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  inv._id,
                                  item._id,
                                  "remarks",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="submit-box">
                {inv.status === "submitted" ? (
                  <p className="success-text">
                    ✅ Quotation already submitted
                  </p>
                ) : (
                  <>
                    <label>
                      Price Valid Until
                      <input
                        type="date"
                        value={q.priceValidityUntil || ""}
                        onChange={(e) =>
                          handleGeneralChange(
                            inv._id,
                            "priceValidityUntil",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <textarea
                      value={q.generalRemarks || ""}
                      onChange={(e) =>
                        handleGeneralChange(
                          inv._id,
                          "generalRemarks",
                          e.target.value
                        )
                      }
                    />

                    <div className="button-row">
                      <button onClick={() => submitQuotation(inv)}>
                        Submit Quotation
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => withdrawInvitation(inv._id)}
                      >
                        Withdraw
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default BusinessDashboard;