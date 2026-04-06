import mongoose from "mongoose";

const awardSchema = new mongoose.Schema(
  {
    procurement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementRequest",
      required: true,
      unique: true,
    },

    winningBusiness: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    winningInvitation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invitation",
      required: true,
    },

    awardAmount: {
      type: Number,
      required: true,
    },

    decisionReason: {
      type: String,
      required: true,
      trim: true,
    },

    evaluationSummary: {
      type: String,
      default: "",
      trim: true,
    },

    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    awardedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["awarded", "cancelled"],
      default: "awarded",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Award", awardSchema);
