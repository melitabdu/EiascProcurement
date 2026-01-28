import mongoose from "mongoose";

/* ================= QUOTATION ITEM ================= */
const quotationItemSchema = new mongoose.Schema(
  {
    procurementItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    quoted: {
      type: Boolean,
      default: false,
    },

    unitPrice: {
      type: Number,
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      default: null,
    },

    deliveryTimeDays: {
      type: Number,
      default: null, // ✅ FIX: NOT REQUIRED
      min: 0,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

/* ================= QUOTATION ================= */
const quotationSchema = new mongoose.Schema(
  {
    items: {
      type: [quotationItemSchema],
      required: true,
    },

    priceValidityUntil: {
      type: Date,
      required: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    submittedAt: {
      type: Date,
    },
  },
  { _id: false }
);

/* ================= INVITATION ================= */
const invitationSchema = new mongoose.Schema(
  {
    procurement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementRequest",
      required: true,
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    sealed: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: [
        "invited",
        "submitted",
        "opened",
        "shortlisted",
        "awarded",
        "rejected",
      ],
      default: "invited",
    },

    quotation: {
      type: quotationSchema,
      default: null,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
invitationSchema.index({ procurement: 1, business: 1 }, { unique: true });
invitationSchema.index({ status: 1 });

export default mongoose.model("Invitation", invitationSchema);
