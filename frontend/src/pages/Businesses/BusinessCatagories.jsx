import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BusinessCatagories.css";

const API_URL = "http://localhost:5000/api/businesses"; // your backend base URL

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

  // 🟢 Fetch businesses — all random if no category is selected
  const fetchBusinesses = async (category = null) => {
    setLoading(true);
    try {
      const endpoint = category
        ? `${API_URL}/category/${encodeURIComponent(category)}`
        : `${API_URL}`;
      const res = await axios.get(endpoint);
      let data = res.data;

      // If showing "advertised" (random) businesses
      if (!category) {
        data = data.sort(() => 0.5 - Math.random()).slice(0, 8); // show 8 random
      }

      setBusinesses(data);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses(); // load random advertised businesses initially
  }, []);

  // 🟣 When a category is clicked
  const handleCategoryClick = (category) => {
    if (category === activeCategory) {
      // unselect category -> back to random
      setActiveCategory(null);
      fetchBusinesses();
    } else {
      setActiveCategory(category);
      fetchBusinesses(category);
    }
  };

  return (
    <div className="business-page">
      {/* Categories Section */}
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

      {/* Businesses Section */}
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
                  {biz.description?.slice(0, 80) || "No description available."}
                </p>
                {biz.website && (
                  <a
                    href={biz.website}
                    target="_blank"
                    rel="noreferrer"
                    className="business-link"
                  >
                    Visit Website →
                  </a>
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
