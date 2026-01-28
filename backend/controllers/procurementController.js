import asyncHandler from "express-async-handler";
import ProcurementRequest from "../models/procurementModel.js";
import Invitation from "../models/invitationModel.js";

/* ============================
   CREATE PROCUREMENT (ADMIN)
============================ */
export const createProcurement = asyncHandler(async (req, res) => {
  let {
    title,
    referenceNumber,
    description,
    category,
    budget,
    deadline,
    requestingDepartment,
    requestingOffice,
    requestedBy,
    type,
    items,
  } = req.body;

  /* ✅ PARSE ITEMS (FORM-DATA SAFE) */
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      res.status(400);
      throw new Error("Invalid items format");
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("At least one procurement item is required");
  }

  for (const item of items) {
    if (!item.itemName || !item.quantity || !item.unit) {
      res.status(400);
      throw new Error(
        "Each item must have itemName, quantity and unit"
      );
    }
  }

  const procurement = await ProcurementRequest.create({
    title,
    referenceNumber,
    description,
    category,
    budget,
    deadline: new Date(deadline),
    requestingDepartment,
    requestingOffice: requestingOffice || "",
    requestedBy,
    type: type || "invited",
    status: "draft",
    items,
    createdBy: req.user._id,
  });

  res.status(201).json(procurement);
});

/* ============================
   GET ALL PROCUREMENTS (ADMIN)
============================ */
export const getProcurements = asyncHandler(async (req, res) => {
  const procurements = await ProcurementRequest.find({
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .populate("createdBy", "fullName email role");

  res.json(procurements);
});

/* ============================
   UPDATE DRAFT PROCUREMENT
============================ */
export const updateDraftProcurement = asyncHandler(async (req, res) => {
  const procurement = await ProcurementRequest.findById(
    req.params.id
  );

  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  if (procurement.status !== "draft") {
    res.status(400);
    throw new Error("Only draft procurements can be edited");
  }

  const invitationCount = await Invitation.countDocuments({
    procurement: procurement._id,
  });

  if (invitationCount > 0) {
    res.status(400);
    throw new Error(
      "Cannot edit procurement after invitations"
    );
  }

  let { items } = req.body;

  if (typeof items === "string") {
    items = JSON.parse(items);
  }

  if (items) {
    for (const item of items) {
      if (!item.itemName || !item.quantity || !item.unit) {
        res.status(400);
        throw new Error("Invalid item data");
      }
    }
    procurement.items = items;
  }

  const editableFields = [
    "title",
    "description",
    "category",
    "budget",
    "deadline",
    "requestingDepartment",
    "requestingOffice",
    "requestedBy",
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      procurement[field] = req.body[field];
    }
  });

  await procurement.save();
  res.json(procurement);
});

/* ============================
   GET OPEN PROCUREMENTS (PUBLIC)
============================ */
export const getOpenProcurements = asyncHandler(async (req, res) => {
  const procurements = await ProcurementRequest.find({
    status: "published",
    isDeleted: false,
  }).sort({ deadline: 1 });

  res.json(procurements);
});

/* ============================
   GET INVITED PROCUREMENTS (BUSINESS)
============================ */
export const getInvitedProcurements = asyncHandler(async (req, res) => {
  if (req.user.role !== "business") {
    res.status(403);
    throw new Error("Access denied");
  }

  const procurements = await ProcurementRequest.find({
    type: "invited",
    invitedBusinesses: req.user.businessId,
    isDeleted: false,
  }).select(
    "title referenceNumber category budget deadline status items requestingDepartment"
  );

  res.json(procurements);
});

/* ============================
   UPDATE PROCUREMENT STATUS
============================ */
export const updateProcurementStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = [
    "draft",
    "published",
    "closed",
    "awarded",
    "completed",
    "archived",
  ];

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid procurement status");
  }

  const procurement = await ProcurementRequest.findById(
    req.params.id
  );

  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  procurement.status = status;
  await procurement.save();

  res.json(procurement);
});

/* ============================
   ARCHIVE PROCUREMENT (SOFT)
============================ */
export const archiveProcurement = asyncHandler(async (req, res) => {
  const procurement = await ProcurementRequest.findById(
    req.params.id
  );

  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  procurement.isDeleted = true;
  procurement.status = "archived";

  await procurement.save();

  res.json({ message: "Procurement archived successfully" });
});

/* ============================
   DELETE PROCUREMENT (HARD)
============================ */
export const deleteProcurement = asyncHandler(async (req, res) => {
  const procurement = await ProcurementRequest.findById(
    req.params.id
  );

  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  if (procurement.status !== "draft") {
    res.status(400);
    throw new Error(
      "Only draft procurements can be deleted"
    );
  }

  const invitationsCount = await Invitation.countDocuments({
    procurement: procurement._id,
  });

  if (invitationsCount > 0) {
    res.status(400);
    throw new Error(
      "Cannot delete procurement with invitations"
    );
  }

  await procurement.deleteOne();
  res.json({ message: "Procurement permanently deleted" });
});
