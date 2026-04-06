import asyncHandler from "express-async-handler";
import CommitteeMinutes from "../models/commiteeMinutesModel.js";
import ProcurementRequest from "../models/procurementModel.js";
import AuditLog from "../models/auditLogModel.js";

/* =========================================
   CREATE / SAVE MINUTES
========================================= */
export const createCommitteeMinutes = asyncHandler(async (req, res) => {
  const {
    procurementId,
    meetingDate,
    meetingPlace,
    evaluationReport,
    decisionText,
    committeeMembers,
  } = req.body;

  const procurement = await ProcurementRequest.findById(procurementId);

  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  const exists = await CommitteeMinutes.findOne({
    procurement: procurementId,
  });

  if (exists) {
    res.status(400);
    throw new Error("Minutes already created for this procurement");
  }

  const minutes = await CommitteeMinutes.create({
    procurement: procurementId,
    meetingDate,
    meetingPlace,
    evaluationReport,
    decisionText,
    committeeMembers,
    createdBy: req.user._id,
  });

  await AuditLog.create({
    action: "COMMITTEE_MINUTES_CREATED",
    entity: "CommitteeMinutes",
    entityId: minutes._id,
    performedBy: req.user._id,
    role: req.user.role,
    description: "Committee minutes created",
  });

  res.status(201).json(minutes);
});

/* =========================================
   GET MINUTES BY PROCUREMENT
========================================= */
export const getMinutesByProcurement = asyncHandler(async (req, res) => {
  const minutes = await CommitteeMinutes.findOne({
    procurement: req.params.procurementId,
  })
    .populate("procurement", "title referenceNumber")
    .populate("createdBy", "fullName");

  if (!minutes) {
    res.status(404);
    throw new Error("Minutes not found");
  }

  res.json(minutes);
});

/* =========================================
   UPDATE MINUTES
========================================= */
export const updateCommitteeMinutes = asyncHandler(async (req, res) => {
  const minutes = await CommitteeMinutes.findById(req.params.id);

  if (!minutes) {
    res.status(404);
    throw new Error("Minutes not found");
  }

  const fields = [
    "meetingDate",
    "meetingPlace",
    "evaluationReport",
    "decisionText",
    "committeeMembers",
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) minutes[f] = req.body[f];
  });

  await minutes.save();

  await AuditLog.create({
    action: "COMMITTEE_MINUTES_UPDATED",
    entity: "CommitteeMinutes",
    entityId: minutes._id,
    performedBy: req.user._id,
    role: req.user.role,
    description: "Committee minutes updated",
  });

  res.json(minutes);
});

/* =========================================
   DELETE MINUTES
========================================= */
export const deleteCommitteeMinutes = asyncHandler(async (req, res) => {
  const minutes = await CommitteeMinutes.findById(req.params.id);

  if (!minutes) {
    res.status(404);
    throw new Error("Minutes not found");
  }

  await minutes.deleteOne();

  await AuditLog.create({
    action: "COMMITTEE_MINUTES_DELETED",
    entity: "CommitteeMinutes",
    entityId: minutes._id,
    performedBy: req.user._id,
    role: req.user.role,
    description: "Committee minutes deleted",
  });

  res.json({ message: "Minutes deleted" });
});