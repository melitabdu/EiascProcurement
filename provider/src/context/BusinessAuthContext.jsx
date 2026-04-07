import React, { createContext, useContext, useState } from "react";

const BusinessAuthContext = createContext(null);

export const BusinessAuthProvider = ({ children }) => {
  const storedBusiness = (() => {
    try {
      const data = localStorage.getItem("businessUser");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  const [token, setToken] = useState(
    localStorage.getItem("businessToken")
  );
  const [business, setBusiness] = useState(storedBusiness);

  const loginBusiness = (token, businessData) => {
    localStorage.setItem("businessToken", token);
    localStorage.setItem("businessUser", JSON.stringify(businessData));
    setToken(token);
    setBusiness(businessData);
  };

  const logoutBusiness = () => {
    localStorage.removeItem("businessToken");
    localStorage.removeItem("businessUser");
    setToken(null);
    setBusiness(null);
  };

  return (
    <BusinessAuthContext.Provider
      value={{
        token,
        business,
        loginBusiness,
        logoutBusiness,
      }}
    >
      {children}
    </BusinessAuthContext.Provider>
  );
};

export const useBusinessAuth = () => {
  const context = useContext(BusinessAuthContext);
  if (!context) {
    throw new Error(
      "useBusinessAuth must be used inside BusinessAuthProvider"
    );
  }
  return context;
};
