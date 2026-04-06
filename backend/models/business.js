import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC BUSINESS INFO
    ========================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    categories: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    description: {
      type: String,
      trim: true,
    },

    businessType: {
      type: String,
      enum: ["Private", "PLC", "NGO", "Government", "Other"],
      default: "Private",
    },

    yearEstablished: {
      type: Number,
    },

    /* =========================
       CONTACT INFORMATION
    ========================= */

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    /* =========================
       CONTACT PERSON
    ========================= */

    contactPerson: {
      name: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      position: {
        type: String,
        trim: true,
      },
    },

    /* =========================
       LEGAL INFORMATION
    ========================= */

    tinNumber: {
      type: String,
      trim: true,
    },

    businessLicenseNumber: {
      type: String,
      trim: true,
    },

    /* =========================
       MEDIA
    ========================= */

    logo: {
      type: String,
    },

    documents: [
      {
        type: String,
      },
    ],

    /* =========================
       LOCATION
    ========================= */

    location: {
      lat: Number,
      lng: Number,
    },

    /* =========================
       STATUS
    ========================= */

    verified: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);