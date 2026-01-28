import mongoose from "mongoose";

const mosqueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    region: { type: String },
    zone: { type: String },
    woreda: { type: String },
    phone: { type: String },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalCollected: { type: Number, default: 0 },
    lastTransferDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Mosque", mosqueSchema);
