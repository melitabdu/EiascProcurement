import React, { useState } from "react";
import axios from "axios";
import { useBusinessAuth } from "../context/BusinessAuthContext";
import { useNavigate } from "react-router-dom";
import "./BusinessLoginPage.css";

const BusinessLoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginBusiness, business } = useBusinessAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!phone || !password) {
      setMessage("❌ Phone and password are required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/business/login", {
        phone,
        password,
      });

      // loginBusiness stores token + business info
      loginBusiness(res.data.token, res.data.business);

      setMessage("✅ Login successful!");
      setLoading(false);

      // redirect to dashboard
      navigate("/business/dashboard");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Business Login</h2>

      {business && (
        <div className="business-preview">
          {business.logo && (
            <img src={business.logo} alt="Business Logo" className="business-logo-preview" />
          )}
          <h3>{business.name}</h3>
        </div>
      )}

      {message && (
        <p className={`form-message ${message.startsWith("❌") ? "error" : "success"}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            placeholder="Enter your phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default BusinessLoginPage;
