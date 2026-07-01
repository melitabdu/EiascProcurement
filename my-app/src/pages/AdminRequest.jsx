import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminRequest.css';

const Request = () => {
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    purpose: '',
    department: '',
    estimatedCost: '',
    urgency: 'Normal',
  });

  // Fetch all requests by logged-in staff
  useEffect(() => {
    const fetchRequests = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/requests/my`
    );
    setRequests(res.data);
  } catch (err) {
    console.error(err);
  }
};
    
    fetchRequests();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit request
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/requests', formData);
      alert('Request submitted successfully!');
      setFormData({
        itemName: '',
        quantity: '',
        purpose: '',
        department: '',
        estimatedCost: '',
        urgency: 'Normal',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to submit request.');
    }
  };

  return (
    <div className="request-container">
      <h2>Procurement Request Form</h2>

      <form onSubmit={handleSubmit} className="request-form">
        <label>Item Name:</label>
        <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required />

        <label>Quantity:</label>
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />

        <label>Purpose:</label>
        <textarea name="purpose" value={formData.purpose} onChange={handleChange} required></textarea>

        <label>Department:</label>
        <input type="text" name="department" value={formData.department} onChange={handleChange} required />

        <label>Estimated Cost (ETB):</label>
        <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} />

        <label>Urgency:</label>
        <select name="urgency" value={formData.urgency} onChange={handleChange}>
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
        </select>

        <button type="submit">Submit Request</button>
      </form>

      <h3>My Requests</h3>
      <table className="request-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Department</th>
            <th>Status</th>
            <th>Approved By</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req._id}>
              <td>{req.itemName}</td>
              <td>{req.quantity}</td>
              <td>{req.department}</td>
              <td>{req.status}</td>
              <td>{req.approvedBy || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Request;
