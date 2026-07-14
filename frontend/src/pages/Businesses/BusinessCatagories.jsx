import React, { useEffect, useState } from "react";
import api from "../../services/api"; // Adjust path if necessary
import "./BusinessCatagories.css";

const FIXED_CATEGORIES = [
  "Construction",
  "IT & Software",
  "Stationery & Office Supplies",
  "Consulting",
  "Transport & Logistics",
  "Printing",
  "Electrical & Electronics",
  "Furniture",
  "Cleaning Services",
  "Other",
];

const BusinessCategories = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch businesses
  const fetchBusinesses = async (category = null) => {
    setLoading(true);

    try {
      const endpoint = category
        ? `/businesses/category/${encodeURIComponent(category)}`
        : "/businesses";

      const res = await api.get(endpoint);

      let data = res.data;

      // Show 8 random businesses when no category is selected
      if (!category && Array.isArray(data)) {
        data = [...data].sort(() => Math.random() - 0.5).slice(0, 8);
      }

      setBusinesses(data);
    } catch (error) {
      console.error("Error loading businesses:", error);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleCategoryClick = (category) => {
    if (category === activeCategory) {
      setActiveCategory(null);
      fetchBusinesses();
    } else {
      setActiveCategory(category);
      fetchBusinesses(category);
    }
  };

  return (
    <div className="business-page">
      {/* Categories */}
      <section className="categories-section">
        <h2>Business Categories</h2>

        <p className="section-desc">
          Browse suppliers and service providers by category.
        </p>

        <div className="category-grid">
          {FIXED_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-card ${
                activeCategory === cat ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(cat)}
            >
              <div className="category-icon">🏷️</div>
              <h3>{cat}</h3>
            </button>
          ))}
        </div>
      </section>

      {/* Businesses */}
      <section className="business-list-section">
        <h2>
          {activeCategory
            ? `${activeCategory} Businesses`
            : "Featured Businesses"}
        </h2>

        {loading ? (
          <p>Loading businesses...</p>
        ) : businesses.length === 0 ? (
          <p>No businesses found.</p>
        ) : (
          <div className="business-grid">
            {businesses.map((biz) => (
              <div key={biz._id} className="business-card">
                <img
                  src={biz.logo || "https://via.placeholder.com/100"}
                  alt={biz.name}
                  className="business-logo"
                />

                <h3>{biz.name}</h3>

                <p className="business-cat">{biz.category}</p>

                <p className="business-desc">
                  {biz.description?.slice(0, 80) ||
                    "No description available."}
                </p>

                {biz.website ? (
  <a
    href={
      biz.website.startsWith("http")
        ? biz.website
        : `https://${biz.website}`
    }
    target="_blank"
    rel="noopener noreferrer"
    className="business-link"
  >
    🌐 Visit Website →
  </a>
) : (
  <p className="business-phone">
    📞 {biz.phone || "Phone not available"}
  </p>
)}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BusinessCategories;