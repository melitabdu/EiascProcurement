import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    goalAmount: { type: Number },
    collectedAmount: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
