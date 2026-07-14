import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import CustomerHome from "./pages/Customer/CustomerHome";
import BusinessCategories from "./pages/Businesses/BusinessCatagories";
import BusinessByCategory from "./pages/Businesses/BusinessByCatagories";
import BusinessDetails from "./pages/Customer/BusinessDetails";
import LoginModal from "./components/LoginModal";

import "./App.css";


const App = () => {

  const [showLogin, setShowLogin] = useState(false);


  return (
    <div className="App">

      <Router>

        <Navbar 
          openLogin={() => setShowLogin(true)}
        />


        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
          />
        )}


        <main>

          <Routes>

            {/* Home */}
            <Route
              path="/"
              element={<CustomerHome />}
            />


            {/* All businesses */}
            <Route
              path="/businesses"
              element={<BusinessCategories />}
            />


            {/* Businesses by category */}
            <Route
              path="/businesses/:category"
              element={<BusinessByCategory />}
            />


            {/* Single business details */}
            <Route
              path="/business/:id"
              element={<BusinessDetails />}
            />


          </Routes>

        </main>


      </Router>

    </div>
  );
};


export default App;