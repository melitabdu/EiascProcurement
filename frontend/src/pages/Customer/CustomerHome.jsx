// src/pages/Customer/CustomerHome.jsx

import React from "react";
import { Link } from "react-router-dom";
import BusinessCategories from "../Businesses/BusinessCatagories";
import AdvertisingSection from "../../components/AdvertisingSection";
import "./CustomerHome.css";

const CustomerHome = () => {
  return (
    <div className="customer-home">
      {/* ===== Hero Section ===== */}
      <section className="hero">
        <div className="hero-overlay">
          <h1>Welcome to EIASC Procurement Portal</h1>

          <p>
            Discover verified suppliers, explore tenders, and connect with
            businesses that power procurement excellence.
          </p>

          <Link to="/businesses" className="hero-btn">
            Explore Businesses
          </Link>
        </div>
      </section>

      {/* ===== Business Categories & Featured Businesses ===== */}
      <BusinessCategories />

      {/* ===== Advertising Videos ===== */}
      <AdvertisingSection />
    </div>
  );
};

export default CustomerHome;