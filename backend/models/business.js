import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
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

    address: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,        // 🔒 prevents duplicates
      lowercase: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    logo: String,

    documents: [String],

    location: {
      lat: Number,
      lng: Number,
    },

    verified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);
