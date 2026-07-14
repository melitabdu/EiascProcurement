import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import "./BusinessByCatagory.css";

const BusinessByCategory = () => {
  const { category } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await api.get(
          `/businesses/category/${encodeURIComponent(category)}`
        );
        setBusinesses(res.data);
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [category]);

  if (loading) {
    return <p>Loading businesses...</p>;
  }

  return (
    <section className="business-section">
      <h2>{category} Suppliers</h2>

      <Link to="/businesses" className="back-link">
        ← Back to Categories
      </Link>

      {businesses.length === 0 ? (
        <p className="no-businesses">
          No businesses found in this category.
        </p>
      ) : (
        <div className="business-grid">
          {businesses.map((b) => (
            <div key={b._id} className="business-card">
              <img
                src={b.logo || "/default-logo.png"}
                alt={b.name}
                className="business-logo"
              />

              <h3>{b.name}</h3>

              <p className="business-desc">
                {b.description || "No description provided."}
              </p>

              <p className="business-email">
                📧 {b.email || "Email not available"}
              </p>

              {b.website ? (
                <a
                  href={
                    b.website.startsWith("http")
                      ? b.website
                      : `https://${b.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="business-link"
                >
                  🌐 Visit Website →
                </a>
              ) : (
                <p className="business-phone">
                  📞 {b.phone || "Phone not available"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default BusinessByCategory;