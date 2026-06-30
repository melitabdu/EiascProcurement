import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./AddBusiness.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const businessCategories = [
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

const LocationMarker = ({ setLatLng }) => {
  useMapEvents({
    click(e) {
      setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const AddBusiness = () => {
  const [form, setForm] = useState({
    name: "",
    categories: [],
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    latitude: "",
    longitude: "",
    password: "",

    // ✅ NEW FIELDS
    contactPersonName: "",
    contactPersonPhone: "",
    contactPersonPosition: "",
  });

  const [logo, setLogo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const adminToken = localStorage.getItem("adminToken");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setLatLng = ({ lat, lng }) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleCategoryChange = (category) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setLoading(true);

  try {
    const formData = new FormData();

    formData.append("name", form.name);
    form.categories.forEach((c) => formData.append("categories[]", c));
    formData.append("description", form.description);
    formData.append("address", form.address);
    formData.append("phone", form.phone);
    formData.append("email", form.email);
    formData.append("website", form.website);
    formData.append("password", form.password);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);

    formData.append("contactPersonName", form.contactPersonName);
    formData.append("contactPersonPhone", form.contactPersonPhone);
    formData.append("contactPersonPosition", form.contactPersonPosition);

    if (logo) formData.append("logo", logo);

    documents.forEach((doc) => formData.append("documents", doc));

    const res = await axios.post(
      "http://localhost:5000/api/businesses",
      formData,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    console.log("SUCCESS:", res.data);

    setMessage(`✅ Business "${res.data.business.name}" added successfully`);
  } catch (err) {
    console.log("SERVER RESPONSE:", err.response?.data);
    console.log("STATUS:", err.response?.status);
    console.error(err);

    setMessage(err.response?.data?.message || "Failed to add business");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="add-mosque-container">
      <h2>Add Business</h2>
      {message && <p className="form-message">{message}</p>}

      <form onSubmit={handleSubmit} className="add-mosque-form">
        <label>Business Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Categories</label>
        <div className="category-checkbox-group">
          {businessCategories.map((cat) => (
            <label key={cat}>
              <input
                type="checkbox"
                checked={form.categories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
              />
              {cat}
            </label>
          ))}
        </div>

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <label>Address</label>
        <input name="address" value={form.address} onChange={handleChange} />

        <label>Business Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} />

        <label>Website</label>
        <input name="website" value={form.website} onChange={handleChange} />

        <label>Business Login Password</label>
        <input
          type="text"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {/* ✅ CONTACT PERSON SECTION */}
        <h3>Contact Person</h3>

        <label>Name</label>
        <input
          name="contactPersonName"
          value={form.contactPersonName}
          onChange={handleChange}
          required
        />

        <label>Phone</label>
        <input
          name="contactPersonPhone"
          value={form.contactPersonPhone}
          onChange={handleChange}
          required
        />

        <label>Position</label>
        <input
          name="contactPersonPosition"
          value={form.contactPersonPosition}
          onChange={handleChange}
        />

        <label>Logo</label>
        <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />

        <label>Documents</label>
        <input type="file" multiple onChange={(e) => setDocuments([...e.target.files])} />

        <label>Map Location</label>
        <MapContainer center={[9.03, 38.74]} zoom={6} style={{ height: 300 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {form.latitude && (
            <Marker position={[form.latitude, form.longitude]} />
          )}
          <LocationMarker setLatLng={setLatLng} />
        </MapContainer>

        <p>
          Lat: {form.latitude || "-"} | Lng: {form.longitude || "-"}
        </p>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Business"}
        </button>
      </form>
    </div>
  );

}
export default AddBusiness;