import mongoose from "mongoose";

/* ================= DOCUMENT ================= */
const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String },
  },
  { _id: false }
);

/* ================= PROCUREMENT ITEMS ================= */
const procurementItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unit: {
      type: String,
      required: true,
      trim: true, // pcs, kg, box, lot
    },
  },
  { _id: true } // important for quotation mapping
);

/* ================= MAIN PROCUREMENT SCHEMA ================= */
const procurementSchema = new mongoose.Schema(
  {
    /* ===== BASIC INFO ===== */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    deadline: {
      type: Date,
      required: true,
    },

    /* ===== REQUESTING DETAILS ===== */
    requestingDepartment: {
      type: String,
      required: true,
      trim: true,
    },

    requestingOffice: {
      type: String,
      trim: true,
    },

    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },

    /* ===== MULTI ITEMS ===== */
    items: {
      type: [procurementItemSchema],
      validate: [
        {
          validator: (items) => items.length > 0,
          message: "At least one procurement item is required",
        },
      ],
    },

    /* ===== PROCUREMENT TYPE ===== */
    type: {
      type: String,
      enum: ["open", "invited"],
      default: "invited",
    },

    /* ===== STATUS ===== */
    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "closed",
        "awarded",
        "completed",
        "archived",
      ],
      default: "draft",
    },

    /* ===== INVITED BUSINESSES ===== */
    invitedBusinesses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
      },
    ],

    /* ===== DOCUMENTS ===== */
    documents: {
      type: [documentSchema],
      default: [],
    },

    /* ===== AUDIT ===== */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
procurementSchema.index({ referenceNumber: 1 });
procurementSchema.index({ status: 1 });
procurementSchema.index({ deadline: 1 });

export default mongoose.model("ProcurementRequest", procurementSchema);
