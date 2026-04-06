import asyncHandler from "express-async-handler";
import Procurement from "../models/procurementModel.js";
import Invitation from "../models/invitationModel.js";
import { logAudit } from "../utils/auditLogger.js";
import User from "../models/userModel.js";

/* ======================================================
   CREATE PROCUREMENT
====================================================== */
export const createProcurement = asyncHandler(async (req, res) => {
  const procurement = await Procurement.create({
    ...req.body,
    status: "draft",
    bidOpened: false,
    bidOpenRequested: false,
    bidOpenedBy: [],
    createdBy: req.user._id,
  });

  await logAudit({
    user: req.user,
    action: "PROCUREMENT_CREATED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: "Created procurement",
    newValue: procurement,
    req,
  });

  res.status(201).json(procurement);
});

/* ======================================================
   GET ALL PROCUREMENTS
====================================================== */
export const getProcurements = asyncHandler(async (req, res) => {
  const procurements = await Procurement.find()
    .sort("-createdAt")
    .populate("createdBy", "fullName email");

  res.json(procurements);
});

/* ======================================================
   GET OPEN PROCUREMENTS (PUBLIC)
====================================================== */
export const getOpenProcurements = asyncHandler(async (req, res) => {
  const procurements = await Procurement.find({
    type: "open",          // ✅ correct field
    status: "published",   // ✅ only live procurements
    bidOpened: false,
    isDeleted: { $ne: true },
  });

  res.json(procurements);
});

/* ======================================================
   GET INVITED PROCUREMENTS (BUSINESS)
====================================================== */
export const getInvitedProcurements = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({
    business: req.user._id,
  }).populate("procurement");

  res.json(invitations);
});

/* ======================================================
   UPDATE DRAFT PROCUREMENT
====================================================== */
export const updateDraftProcurement = asyncHandler(async (req, res) => {
  const procurement = await Procurement.findById(req.params.id);

  if (!procurement) throw new Error("Procurement not found");

  if (procurement.bidOpened) {
    res.status(400);
    throw new Error("Cannot update. Bid already opened.");
  }

  const oldData = procurement.toObject();

  Object.assign(procurement, req.body);

  await procurement.save();

  await logAudit({
    user: req.user,
    action: "PROCUREMENT_UPDATED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: "Updated procurement",
    oldValue: oldData,
    newValue: procurement,
    req,
  });

  res.json(procurement);
});

/* ======================================================
   UPDATE STATUS
====================================================== */
export const updateProcurementStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const allowedStatuses = [
    "draft",
    "published",
    "closed",
    "evaluated",
    "awarded",
    "archived",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const procurement = await Procurement.findById(req.params.id);

  if (!procurement) {
    return res.status(404).json({ message: "Procurement not found" });
  }

  const oldStatus = procurement.status;

  if (oldStatus === status) {
    return res.status(400).json({
      message: "Status is already set to this value",
    });
  }

  /* ==============================
     PROFESSIONAL STATUS TRANSITIONS
  ============================== */

  const allowedTransitions = {
    draft: ["published"],
    published: ["closed"],
    closed: ["evaluated"],
    evaluated: ["awarded"],
    awarded: ["archived"],
    archived: [],
  };

  if (!allowedTransitions[oldStatus].includes(status)) {
    return res.status(400).json({
      message: `Cannot change status from ${oldStatus} to ${status}`,
    });
  }

  /* ==============================
     AUTO FLAG WHEN CLOSED
  ============================== */

  if (status === "evaluated" && !procurement.bidOpened) {
    return res.status(400).json({
      message: "Cannot evaluate before bid opening",
    });
  }

  procurement.status = status;

  await procurement.save();

  /* ==============================
     AUDIT LOG
  ============================== */

  await logAudit({
    user: req.user,
    action: "PROCUREMENT_STATUS_UPDATED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: `Status changed from ${oldStatus} to ${status}`,
    oldValue: { status: oldStatus },
    newValue: { status },
    req,
  });

  res.json(procurement);
});
/* ======================================================
   ARCHIVE PROCUREMENT
====================================================== */
export const archiveProcurement = asyncHandler(async (req, res) => {
  const procurement = await Procurement.findById(req.params.id);

  if (!procurement) throw new Error("Not found");

  procurement.archived = true;

  await procurement.save();

  await logAudit({
    user: req.user,
    action: "PROCUREMENT_ARCHIVED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: "Archived procurement",
    newValue: { archived: true },
    req,
  });

  res.json({ message: "Archived successfully" });
});

/* ======================================================
   DELETE PROCUREMENT
====================================================== */
export const deleteProcurement = asyncHandler(async (req, res) => {
  const procurement = await Procurement.findById(req.params.id);

  if (!procurement) throw new Error("Not found");

  if (procurement.bidOpened) {
    res.status(400);
    throw new Error("Cannot delete. Bid already opened.");
  }

  await procurement.deleteOne();

  await logAudit({
    user: req.user,
    action: "PROCUREMENT_DELETED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: "Deleted procurement",
    req,
  });

  res.json({ message: "Deleted successfully" });
});

/* ======================================================
   EXTEND DEADLINE
====================================================== */
export const extendDeadline = asyncHandler(async (req, res) => {
  const procurement = await Procurement.findById(req.params.id);

  if (!procurement) throw new Error("Not found");

  if (procurement.bidOpened) {
    res.status(400);
    throw new Error("Cannot extend deadline. Bid already opened.");
  }

  const oldDeadline = procurement.deadline;

  procurement.deadline = req.body.deadline;

  await procurement.save();

  await logAudit({
    user: req.user,
    action: "DEADLINE_EXTENDED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: "Deadline extended",
    oldValue: { deadline: oldDeadline },
    newValue: { deadline: req.body.deadline },
    req,
  });

  res.json(procurement);
});

/* ======================================================
   ADMIN REQUEST BID OPEN
====================================================== */
export const approveBidOpen = asyncHandler(async (req, res) => {
  const procurement = await Procurement.findById(req.params.id);

  if (!procurement) throw new Error("Not found");

  if (procurement.bidOpened) {
    return res.status(400).json({
      message: "Bid already opened",
      bidOpened: true,
    });
  }

  procurement.bidOpenRequested = true;

  await procurement.save();

  await logAudit({
    user: req.user,
    action: "BID_OPEN_REQUESTED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: "Admin requested bid opening ceremony",
    req,
  });

  res.json({ message: "Bid opening ceremony initiated" });
});

/* ======================================================
   COMMITTEE APPROVAL
====================================================== */
export const committeeApproveOpen = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const procurement = await Procurement.findById(req.params.id);

  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  if (procurement.bidOpened) {
    return res.status(400).json({
      message: "Bid already opened",
      bidOpened: true,
    });
  }

  if (!procurement.bidOpenRequested) {
    return res.status(400).json({
      message: "Opening ceremony not initiated by admin",
    });
  }

  const member = await User.findOne({ phone, role: "committee" });

  if (!member || !(await member.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid committee credentials");
  }

  const alreadyApproved = procurement.bidOpenedBy.find(
    (m) => m.user.toString() === member._id.toString()
  );

  if (alreadyApproved) {
    return res.status(400).json({
      message: "You already approved",
    });
  }

  procurement.bidOpenedBy.push({
    user: member._id,
    fullName: member.fullName,
    approvedAt: new Date(),
  });

  await logAudit({
    user: member,
    action: "BID_OPEN_APPROVED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: "Committee member approved bid opening",
    req,
  });

  if (procurement.bidOpenedBy.length >= 3) {
    procurement.bidOpened = true;
    procurement.bidOpenedAt = new Date();
    procurement.status = "closed";

    await logAudit({
      user: member,
      action: "BID_OPENED",
      entityType: "Procurement",
      entityId: procurement._id,
      description: "Bid opened automatically after committee approval",
      req,
    });
  }

  await procurement.save();

  res.json({
    message: "Approval recorded",
    approvalsCount: procurement.bidOpenedBy.length,
    bidOpened: procurement.bidOpened,
  });
});

/* ======================================================
   MANUAL FINALIZE (ADMIN FORCE OPEN)
====================================================== */
export const finalizeBidOpen = asyncHandler(async (req, res) => {
  const procurement = await Procurement.findById(req.params.id);

  if (!procurement) throw new Error("Not found");

  if (procurement.bidOpened) {
    res.status(400);
    throw new Error("Bid already opened");
  }

  procurement.bidOpened = true;
  procurement.bidOpenedAt = new Date();
  procurement.status = "closed";

  await procurement.save();

  await logAudit({
    user: req.user,
    action: "BID_OPENED",
    entityType: "Procurement",
    entityId: procurement._id,
    description: "Bid opened and submissions locked",
    req,
  });

  res.json({ message: "Bid opened successfully" });
});