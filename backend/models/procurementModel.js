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
    itemName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true, trim: true },
  },
  { _id: true }
);

/* ================= MAIN PROCUREMENT SCHEMA ================= */
const procurementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    referenceNumber: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true },

    requestingDepartment: { type: String, required: true, trim: true },
    requestingOffice: { type: String, trim: true },
    requestedBy: { type: String, required: true, trim: true },

    items: { type: [procurementItemSchema], required: true },

    type: {
      type: String,
      enum: ["open", "invited"],
      default: "invited",
    },

    status: {
      type: String,
      enum: ["draft", "published", "closed", "awarded", "evaluated", "archived"],
      default: "draft",
    },

    invitedBusinesses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    ],

    documents: { type: [documentSchema], default: [] },

    /* ===== SEALED BID OPENING (ADDED) ===== */
    bidOpened: {
      type: Boolean,
      default: false,
    },
    bidOpenRequested: {
  type: Boolean,
  default: false,
},

    bidOpenedAt: {
      type: Date,
    },

    bidOpenedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        fullName: String,
        approvedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ProcurementRequest", procurementSchema);
