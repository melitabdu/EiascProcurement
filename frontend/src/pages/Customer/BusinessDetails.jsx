import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import './BusinessDetails.css'


const BusinessDetails = () => {
  const { id } = useParams();

  const [business, setBusiness] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await api.get(`/businesses/${id}`);
        setBusiness(res.data);
      } catch (error) {
        console.error("Failed to load business:", error);
        setError("Business not found.");
      }
    };

    fetchBusiness();
  }, [id]);


  if (error) {
    return <p>{error}</p>;
  }


  if (!business) {
    return <p>Loading business...</p>;
  }


  return (
    <div className="business-details">

      <img
        src={business.logo || "/default-logo.png"}
        alt={business.name}
        className="business-details-logo"
      />


      <h1>
        {business.name}
      </h1>


      <p>
        <strong>Category:</strong>{" "}
        {
          Array.isArray(business.categories)
            ? business.categories.join(", ")
            : "No category"
        }
      </p>


      <h3>
        Description
      </h3>

      <p>
        {business.description || "No description available"}
      </p>


      <p>
        📞 {business.phone || "Phone not available"}
      </p>


      <p>
        📧 {business.email || "Email not available"}
      </p>


      {business.website && (

        <a
          href={
            business.website.startsWith("http")
              ? business.website
              : `https://${business.website}`
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          🌐 Visit Website
        </a>

      )}


      <p>
        📍 {business.address || "Address not available"}
      </p>


    </div>
  );
};


export default BusinessDetails;