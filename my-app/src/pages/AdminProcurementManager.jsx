import React, { useEffect, useState } from "react";
import axios from "axios";
import InviteBusinessesModal from "./InviteBusinessesModal";
import "./AdminProcurementManager.css";

const AdminProcurementManagement = () => {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [inviteFor, setInviteFor] = useState(null);

  /* ======================
     EDIT MODE
  ====================== */
  const [editId, setEditId] = useState(null);

  /* ======================
     FORM STATE
  ====================== */
  const [title, setTitle] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [requestingDepartment, setRequestingDepartment] = useState("");
  const [requestingOffice, setRequestingOffice] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [type, setType] = useState("invited");

  const [items, setItems] = useState([
    { itemName: "", quantity: "", unit: "" },
  ]);

  const token = localStorage.getItem("adminToken");

  /* ======================
     LOAD PROCUREMENTS
  ====================== */
  useEffect(() => {
    loadProcurements();
  }, []);

  const loadProcurements = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/procurements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProcurements(res.data || []);
    } catch {
      setMessage("❌ Failed to load procurements");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     STATUS UPDATE (FIXED)
  ====================== */
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/procurements/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Status updated successfully");

      // Update locally without reloading entire list
      setProcurements((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, status: res.data.status } : p
        )
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to update status");
    }
  };

  /* ======================
     ITEM HANDLERS
  ====================== */
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { itemName: "", quantity: "", unit: "" }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /* ======================
     RESET FORM
  ====================== */
  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setReferenceNumber("");
    setDescription("");
    setCategory("");
    setBudget("");
    setDeadline("");
    setRequestingDepartment("");
    setRequestingOffice("");
    setRequestedBy("");
    setType("invited");
    setItems([{ itemName: "", quantity: "", unit: "" }]);
  };

  /* ======================
     SUBMIT (CREATE / EDIT)
  ====================== */
  const submitProcurement = async (e) => {
    e.preventDefault();

    if (!title || !referenceNumber || !requestingDepartment || !deadline) {
      setMessage("❌ Please fill all required fields");
      return;
    }

    if (items.some((i) => !i.itemName || !i.quantity || !i.unit)) {
      setMessage("❌ All items must have name, quantity and unit");
      return;
    }

    try {
      if (editId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/procurements/${editId}`,
          {
            title,
            referenceNumber,
            description,
            category,
            budget,
            deadline,
            requestingDepartment,
            requestingOffice,
            requestedBy,
            type,
            items,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("✅ Procurement updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/procurements`,
          {
            title,
            referenceNumber,
            description,
            category,
            budget,
            deadline,
            requestingDepartment,
            requestingOffice,
            requestedBy,
            type,
            items,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("✅ Procurement created successfully");
      }

      resetForm();
      loadProcurements();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Operation failed");
    }
  };

  /* ======================
     LOAD PROCUREMENT TO EDIT
  ====================== */
  const editProcurement = (p) => {
    setEditId(p._id);
    setTitle(p.title);
    setReferenceNumber(p.referenceNumber);
    setDescription(p.description || "");
    setCategory(p.category || "");
    setBudget(p.budget || "");
    setDeadline(p.deadline?.split("T")[0] || "");
    setRequestingDepartment(p.requestingDepartment);
    setRequestingOffice(p.requestingOffice || "");
    setRequestedBy(p.requestedBy || "");
    setType(p.type || "invited");
    setItems(p.items || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <p className="loading">Loading…</p>;

  return (
    <div className="procurement-page">
      <h2>📦 Procurement Management</h2>
      {message && <p className="message">{message}</p>}

      {/* ========================= */}
      {/* CREATE / EDIT FORM */}
      {/* ========================= */}
      <form className="procurement-form" onSubmit={submitProcurement}>
        <h3>{editId ? "✏ Edit Procurement" : "➕ Create New Procurement"}</h3>

        <input placeholder="Procurement Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Reference Number *" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
        <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="number" placeholder="Estimated Budget" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <input placeholder="Requesting Department *" value={requestingDepartment} onChange={(e) => setRequestingDepartment(e.target.value)} />
        <input placeholder="Requesting Office" value={requestingOffice} onChange={(e) => setRequestingOffice(e.target.value)} />
        <input placeholder="Requested By" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="invited">Invited</option>
          <option value="open">Open</option>
        </select>

        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <h4>📋 Procurement Items</h4>
        {items.map((item, index) => (
          <div key={index} className="item-row">
            <input placeholder="Item Name" value={item.itemName} onChange={(e) => handleItemChange(index, "itemName", e.target.value)} />
            <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} />
            <input placeholder="Unit" value={item.unit} onChange={(e) => handleItemChange(index, "unit", e.target.value)} />
            <button type="button" className="remove-btn" onClick={() => removeItem(index)}>❌</button>
          </div>
        ))}

        <button type="button" className="add-btn" onClick={addItem}>➕ Add Item</button>

        <div className="form-actions">
          <button type="submit">💾 {editId ? "Update" : "Save"} Procurement</button>
          {editId && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel Edit</button>}
        </div>
      </form>

      {/* ========================= */}
      {/* PROCUREMENT LIST */}
      {/* ========================= */}
      <div className="procurement-list">
        <h3>📄 Existing Procurements</h3>

        {procurements.map((p) => (
          <div key={p._id} className="procurement-card">
            <h4>{p.title}</h4>
            <p><b>Ref:</b> {p.referenceNumber}</p>
            <p><b>Department:</b> {p.requestingDepartment}</p>
            <p><b>Status:</b> {p.status}</p>

            <b>Items:</b>
            <ul>
              {p.items?.map((it, i) => (
                <li key={i}>{it.itemName} – {it.quantity} {it.unit}</li>
              ))}
            </ul>

            <div className="status-update">
              <select
                value={p.status}
                onChange={(e) =>
                  updateStatus(p._id, e.target.value)
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="evaluated">Evaluated</option>
                <option value="awarded">Awarded</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="card-actions">
              <button className="edit-btn" onClick={() => editProcurement(p)}>✏ Edit</button>
              <button
                className="invite-btn"
                disabled={p.status !== "published"}
                onClick={() => setInviteFor(p._id)}
              >
                ✉ Invite Businesses
              </button>
            </div>
          </div>
        ))}
      </div>

      {inviteFor && (
        <InviteBusinessesModal
          procurementId={inviteFor}
          onClose={() => setInviteFor(null)}
        />
      )}
    </div>
  );
};

export default AdminProcurementManagement;