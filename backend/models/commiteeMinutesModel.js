import mongoose from "mongoose";

const committeeMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: "" },
  signature: { type: String, default: "" }, // optional future digital sign
});

const bidOpeningMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  openedAt: { type: Date },
});

const committeeMinutesSchema = new mongoose.Schema(
  {
    procurement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementRequest",
      required: true,
      unique: true,
    },

    meetingDate: {
      type: Date,
      required: true,
    },

    meetingPlace: {
      type: String,
      default: "",
    },

    /* ================= SNAPSHOT DATA ================= */
    quotationSummarySnapshot: {
      type: Array, // store final evaluated table snapshot
      default: [],
    },

    bidOpeningMembers: [bidOpeningMemberSchema],

    /* ================= REPORT SECTIONS ================= */
    evaluationReport: {
      type: String,
      default: "",
    },

    decisionText: {
      type: String,
      required: true,
    },

    managerialDecision: {
      type: String,
      default: "",
    },

    managerName: {
      type: String,
      default: "",
    },

    /* ================= SIGNATURES ================= */
    committeeMembers: [committeeMemberSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const CommitteeMinutes = mongoose.model(
  "CommitteeMinutes",
  committeeMinutesSchema
);

export default CommitteeMinutes;