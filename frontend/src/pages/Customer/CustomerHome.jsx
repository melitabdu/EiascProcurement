// src/pages/Customer/CustomerHome.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BusinessCategories from "../Businesses/BusinessCatagories";
import AdvertisingSection from "../../components/AdvertisingSection";
import "./CustomerHome.css";

const CustomerHome = () => {
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/businesses");
        const businesses = res.data;

        // Randomized featured businesses
        const shuffled = [...businesses].sort(() => 0.5 - Math.random());
        setFeaturedBusinesses(shuffled.slice(0, 6)); // Show top 6
      } catch (err) {
        console.error("Error loading businesses:", err);
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <div className="customer-home">
      {/* ===== Hero Section ===== */}
      <section className="hero">
        <div className="hero-overlay">
          <h1>Welcome to EIASC Procurement Portal</h1>
          <p>
            Discover verified suppliers, explore tenders, and connect with businesses
            that power procurement excellence.
          </p>
          <Link to="/businesses" className="hero-btn">
            Explore Businesses
          </Link>
        </div>
      </section>

      {/* ===== Categories Section ===== */}
      <BusinessCategories />

      {/* ===== Featured Businesses Section ===== */}
      <section className="featured-businesses">
        <h2>🌟 Featured Businesses</h2>
        <p className="section-desc">
          Promoted suppliers and service providers currently advertising on our platform.
        </p>
        <div className="business-grid">
          {featuredBusinesses.length > 0 ? (
            featuredBusinesses.map((b) => (
              <div key={b._id} className="business-card">
                <img
                  src={b.logo || "/placeholder.png"}
                  alt={b.name}
                  className="business-logo"
                />
                <h3>{b.name}</h3>
                <p>{b.category}</p>
                <p>{b.address || "No address provided"}</p>
              </div>
            ))
          ) : (
            <p>No featured businesses available.</p>
          )}
        </div>
      </section>

      {/* ===== Advertising Videos Section ===== */}
      <AdvertisingSection />
    </div>
  );
};

export default CustomerHome;
