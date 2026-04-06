import asyncHandler from "express-async-handler";
import Award from "../models/awardModel.js";
import Invitation from "../models/invitationModel.js";
import ProcurementRequest from "../models/procurementModel.js";

/* ======================================================
   CREATE AWARD (SELECT WINNER)
====================================================== */
export const createAward = asyncHandler(async (req, res) => {
  const { procurementId, invitationId, decisionReason, evaluationSummary } =
    req.body;

  const procurement = await ProcurementRequest.findById(procurementId);

  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  if (!procurement.bidOpened) {
    res.status(400);
    throw new Error("Bids must be opened first");
  }

  const existingAward = await Award.findOne({ procurement: procurementId });
  if (existingAward) {
    res.status(400);
    throw new Error("Procurement already awarded");
  }

  const invitation = await Invitation.findById(invitationId).populate(
    "business"
  );

  if (!invitation || invitation.status !== "opened") {
    res.status(400);
    throw new Error("Invalid winning invitation");
  }

  const totalAmount =
    invitation.quotation?.items?.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    ) || 0;

  const award = await Award.create({
    procurement: procurementId,
    winningBusiness: invitation.business._id,
    winningInvitation: invitationId,
    awardAmount: totalAmount,
    decisionReason,
    evaluationSummary,
    awardedBy: req.user._id,
  });

  // Update invitation statuses
  await Invitation.updateMany(
    { procurement: procurementId },
    { status: "rejected" }
  );

  invitation.status = "awarded";
  await invitation.save();

  // Update procurement
  procurement.status = "awarded";
  await procurement.save();

  res.status(201).json(award);
});

/* ======================================================
   GET AWARD BY PROCUREMENT
====================================================== */
export const getAwardByProcurement = asyncHandler(async (req, res) => {
  const award = await Award.findOne({
    procurement: req.params.procurementId,
  })
    .populate("winningBusiness", "name email")
    .populate("awardedBy", "fullName")
    .populate("procurement", "title referenceNumber");

  if (!award) {
    res.status(404);
    throw new Error("Award not found");
  }

  res.json(award);
});

/* ======================================================
   GET ALL AWARDS
====================================================== */
export const getAllAwards = asyncHandler(async (req, res) => {
  const awards = await Award.find()
    .populate("procurement", "title referenceNumber")
    .populate("winningBusiness", "name")
    .sort({ createdAt: -1 });

  res.json(awards);
});

/* ======================================================
   CANCEL AWARD
====================================================== */
export const cancelAward = asyncHandler(async (req, res) => {
  const award = await Award.findById(req.params.id);

  if (!award) {
    res.status(404);
    throw new Error("Award not found");
  }

  award.status = "cancelled";
  await award.save();

  const procurement = await ProcurementRequest.findById(award.procurement);
  procurement.status = "closed";
  await procurement.save();

  res.json({ message: "Award cancelled successfully" });
});
