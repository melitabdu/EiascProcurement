import React, { useEffect, useState } from "react";
import axios from "axios";

const CommitteeMinutesForm = ({ procurementId, onSaved }) => {
  const token = localStorage.getItem("adminToken");

  const [form, setForm] = useState({
    meetingDate: "",
    meetingPlace: "",
    evaluationReport: "",
    decisionText: "",
    managerialDecision: "",
    committeeMembers: [],
  });

  const [isEditing, setIsEditing] = useState(false);

  // Load existing minutes (if any)
  useEffect(() => {
    const loadMinutes = async () => {
      try {
        const res = await axios.get(
  `http://localhost:5000/api/committee-minutes/procurement/${procurementId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

        if (res.data) {
          setForm(res.data);
          setIsEditing(true);
        }
      } catch (err) {
        console.log("No previous minutes found");
      }
    };

    loadMinutes();
  }, [procurementId, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveMinutes = async () => {
  try {
    let res;

    if (isEditing) {
      res = await axios.put(
        `http://localhost:5000/api/committee-minutes/${form._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      res = await axios.post(
        `http://localhost:5000/api/committee-minutes`,
        { ...form, procurement: procurementId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    onSaved(res.data);
    alert("Minutes saved successfully");
    setIsEditing(true);
  } catch (err) {
    alert("Failed to save minutes");
  }
};

  return (
    <div className="minutes-form">
      <h2>{isEditing ? "✏ Edit Committee Minutes" : "📝 Add Committee Minutes"}</h2>

      <label>Meeting Date</label>
      <input
        type="date"
        name="meetingDate"
        value={form.meetingDate}
        onChange={handleChange}
      />

      <label>Meeting Place</label>
      <input
        type="text"
        name="meetingPlace"
        value={form.meetingPlace}
        onChange={handleChange}
      />

      <label>Evaluation Report</label>
      <textarea
        name="evaluationReport"
        rows="4"
        value={form.evaluationReport}
        onChange={handleChange}
      />

      <label>Committee Decision</label>
      <textarea
        name="decisionText"
        rows="4"
        value={form.decisionText}
        onChange={handleChange}
      />

      {/* ✅ Managerial Decision moved here at END */}
      <label>Managerial Decision</label>
      <textarea
        name="managerialDecision"
        rows="4"
        value={form.managerialDecision}
        onChange={handleChange}
      />

      <button onClick={saveMinutes}>
        {isEditing ? "Update Minutes" : "Save Minutes"}
      </button>
    </div>
  );
};

export default CommitteeMinutesForm;