import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ openLogin }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/logo.png" alt="Tesfa Procurement" className="logo-img" />
        <h1 className="navbar-title">EIASC Procurement Portal</h1>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/businesses">Businesses</Link></li>
        <li><Link to="/procurements">Procurements</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
      <button onClick={openLogin} className="login-btn">Login</button>
    </nav>
  );
};

export default Navbar;
