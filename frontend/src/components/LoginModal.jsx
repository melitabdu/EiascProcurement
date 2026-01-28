import React, { useState } from 'react';
import './LoginModal.css';
import { login, register } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [isNew, setIsNew] = useState(true);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only 10 digit Ethiopian numbers starting with 09
    if (name === 'phone') {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^09\d{8}$/.test(form.phone)) {
      alert('እባኮትን ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ።');
      return;
    }

    if (form.password.length < 6) {
      alert('የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት።');
      return;
    }

    try {
      setLoading(true);

      const res = isNew
        ? await register(form.name, form.phone, form.password)
        : await login(form.phone, form.password);

      alert(`✅ እንኳን ደህና መጡ ${res.name || ''}`);

      setUser(res);      // save to context
      setToken(res.token); // save token
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || '❌ ስህተት ተከስቷል።');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>✖</button>

        <h2>{isNew ? 'መመዝገብ' : 'ግባ'}</h2>

        <form onSubmit={handleSubmit}>
          {isNew && (
            <input
              type="text"
              name="name"
              placeholder="ስም"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="text"
            name="phone"
            placeholder="ስልክ ቁጥር (09xxxxxxxx)"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="የይለፍ ቃል"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '⏳ በመስራት ላይ...' : isNew ? 'ይመዝገቡ' : 'ግባ'}
          </button>
        </form>

        <p className="toggle-text">
          {isNew ? 'ድርጊት አለዎት?' : 'አዲስ ነዎት?'}{' '}
          <span onClick={() => setIsNew(!isNew)}>
            {isNew ? 'ግባ' : 'ይመዝገቡ'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
