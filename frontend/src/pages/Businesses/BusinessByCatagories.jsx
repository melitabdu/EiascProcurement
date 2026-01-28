import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./BusinessByCatagory.css";

const BusinessByCategory = () => {
  const { category } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/businesses/category/${category}`);
        setBusinesses(res.data);
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [category]);

  if (loading) return <p>Loading businesses...</p>;

  return (
    <section className="business-section">
      <h2>{category} Suppliers</h2>
      <Link to="/businesses" className="back-link">← Back to Categories</Link>

      <div className="business-grid">
        {businesses.map((b) => (
          <div key={b._id} className="business-card">
            <img src={b.logo || "/default-logo.png"} alt={b.name} className="business-logo" />
            <h3>{b.name}</h3>
            <p>{b.description || "No description provided."}</p>
            <p>📞 {b.phone}</p>
            <p>📧 {b.email}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BusinessByCategory;
