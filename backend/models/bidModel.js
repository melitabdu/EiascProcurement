import mongoose from "mongoose";

const bidSchema = mongoose.Schema(
  {
    procurement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Procurement",
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invitation",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    proposal: {
      type: String,
      required: true,
    },
    deliveryTime: {
      type: String,
    },
    status: {
      type: String,
      enum: ["submitted", "shortlisted", "rejected", "awarded"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bid", bidSchema);
