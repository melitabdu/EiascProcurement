import React, { useState } from "react";
import axios from "axios";

const AdminCommitteePage = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fullName || !phone || !password) {
      setMessage("❌ Full name, phone, and password are required");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/committee`,
        {
          fullName,
          phone,
          email: email || undefined, // optional but supported
          password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Committee member registered successfully");

      // Reset form
      setFullName("");
      setPhone("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Registration failed");
    }
  };

  return (
    <div className="committee-page">
      <h2>👥 Register Bid Opening Committee Member</h2>

      {message && <p className="message">{message}</p>}

      <form className="committee-form" onSubmit={submitHandler}>
        <input
          type="text"
          placeholder="Full Name *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Temporary Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">➕ Register Committee Member</button>
      </form>
    </div>
  );
};

export default AdminCommitteePage;
