import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CustomerHome from "./pages/Customer/CustomerHome";
import BusinessCategories from "./pages/Businesses/BusinessCatagories"; // ✅ corrected name
import BusinessByCategory from "./pages/Businesses/BusinessByCatagories"; // ✅ corrected name
import LoginModal from "./components/LoginModal";

import "./App.css";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  return (
    <div className="App">
      <Router>
        <Navbar openLogin={openLogin} />
        {showLogin && <LoginModal onClose={closeLogin} />}
        <main>
          <Routes>
            {/* 🏠 Home page */}
            <Route path="/" element={<CustomerHome />} />

            {/* 🏢 Business sections */}
            <Route path="/businesses" element={<BusinessCategories />} />
            <Route path="/businesses/:category" element={<BusinessByCategory />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
};

export default App;
