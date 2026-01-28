import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    mosqueCode: { type: String },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["Friday 10 Birr", "Zakat", "Waqf", "Sadaqa", "General"],
      default: "Friday 10 Birr",
    },
    paymentMethod: {
      type: String,
      enum: ["Telebirr", "Cash", "Other"],
      default: "Telebirr",
    },
    transactionId: { type: String },
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
