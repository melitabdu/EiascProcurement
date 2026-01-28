import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    mosqueCode: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String }, // Telebirr or generated mock ID
    transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    donorName: { type: String },      // optional: if user not logged in
    method: { type: String, default: "mock" }, // 'mock', 'Telebirr', 'cash'
    status: { type: String, default: "pending" }, // 'pending', 'success', 'failed'
    transferDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Transfer", transferSchema);
