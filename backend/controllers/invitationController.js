import asyncHandler from "express-async-handler";
import Invitation from "../models/invitationModel.js";
import Procurement from "../models/procurementModel.js";
import { logAudit } from "../utils/auditLogger.js";
import ProcurementRequest from "../models/procurementModel.js";
import { generateEvaluationReport } from "../utils/generateEvaluationReport.js";

/* ======================================================
   INVITE BUSINESSES
====================================================== */
export const inviteBusinesses = asyncHandler(async (req, res) => {
  const { procurementId, businessIds } = req.body;

  const invitations = await Promise.all(
    businessIds.map((businessId) =>
      Invitation.create({
        procurement: procurementId,
        business: businessId,
        sealed: true,
        status: "invited",
      })
    )
  );

  await logAudit({
    action: "BUSINESSES_INVITED",
    entity: "Invitation",
    entityId: procurementId,
    performedBy: req.user._id,
    role: "admin",
    description: "Businesses invited",
    newData: invitations,
    req,
  });

  res.json(invitations);
});

/* ======================================================
   GET INVITATIONS BY PROCUREMENT
====================================================== */
export const getInvitationsByProcurement = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({
    procurement: req.params.id,
  }).populate("business");

  res.json(invitations);
});

/* ======================================================
   GET INVITATIONS BY BUSINESS
====================================================== */
export const getInvitationsByBusiness = asyncHandler(async (req, res) => {
  if (!req.user?.businessId) {
    res.status(403);
    throw new Error("Business access not linked");
  }

  const invitations = await Invitation.find({
    business: req.user.businessId,
  }).populate("procurement");

  res.json(invitations);
});
/* ======================================================
   SUBMIT QUOTATION
====================================================== */
export const submitQuotation = asyncHandler(async (req, res) => {
  const { items, priceValidityUntil, generalRemarks } = req.body;

  if (!req.user?.businessId) {
    res.status(403);
    throw new Error("Business not authenticated");
  }

  const invitation = await Invitation.findById(req.params.id).populate(
    "procurement"
  );

  if (!invitation || invitation.sealed !== true) {
    res.status(403);
    throw new Error("Invalid or closed invitation");
  }

  if (invitation.procurement?.bidOpened) {
    res.status(400);
    throw new Error("Bid already opened. Submission closed.");
  }

  const quotationItems = invitation.procurement.items.map((pItem) => {
    const quoted = items?.find(
      (i) => i.procurementItemId === pItem._id.toString()
    );

    const unitPrice =
      quoted && quoted.unitPrice !== undefined
        ? Number(quoted.unitPrice)
        : null;

    return {
      procurementItemId: pItem._id,
      itemName: pItem.itemName,
      unit: pItem.unit,
      quantity: pItem.quantity || 0,
      unitPrice,
      totalPrice:
        unitPrice !== null ? unitPrice * (pItem.quantity || 0) : null,
      remarks: quoted?.remarks || "",
    };
  });

  invitation.quotation = {
    items: quotationItems,
    priceValidityUntil,
    remarks: generalRemarks || "",
    submittedAt: new Date(),
  };

  invitation.status = "submitted";

  await logAudit({
    action: "QUOTATION_SUBMITTED",
    entity: "Invitation",
    entityId: invitation._id,
    performedBy: req.user.businessId, // ✅ fixed here
    role: "business",
    description: "Quotation submitted",
    newData: invitation.quotation,
    req,
  });

  await invitation.save();

  res.json({ message: "Quotation submitted" });
});
/* ======================================================
   OPEN INVITATIONS (ADMIN)
====================================================== */
export const openInvitations = asyncHandler(async (req, res) => {
  const procurement = await Procurement.findById(req.params.procurementId);

  if (!procurement.bidOpened) {
    res.status(400);
    throw new Error("Procurement not opened yet");
  }

  await Invitation.updateMany(
    { procurement: procurement._id },
    { sealed: false, status: "opened" }
  );

  await logAudit({
    action: "INVITATIONS_OPENED",
    entity: "Procurement",
    entityId: procurement._id,
    performedBy: req.user._id,
    role: "admin",
    description: "All invitations opened",
    req,
  });

  res.json({ message: "Invitations opened" });
});

/* ======================================================
   UPDATE INVITATION STATUS
====================================================== */
export const updateInvitationStatus = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);
  if (!invitation) throw new Error("Invitation not found");

  invitation.status = req.body.status;
  await invitation.save();

  await logAudit({
    action: "INVITATION_STATUS_UPDATED",
    entity: "Invitation",
    entityId: invitation._id,
    performedBy: req.user._id,
    role: "admin",
    description: `Status updated to ${req.body.status}`,
    req,
  });

  res.json(invitation);
});

/* ======================================================
   GET ALL SUBMITTED QUOTATIONS
====================================================== */
export const getAllSubmittedQuotations = asyncHandler(async (req, res) => {
  const quotations = await Invitation.find({ status: "submitted" })
    .populate("business")
    .populate("procurement");

  res.json(quotations);
});

/* ======================================================
   WITHDRAW INVITATION
====================================================== */
export const withdrawInvitation = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findById(req.params.id);
  if (!invitation) throw new Error("Invitation not found");

  invitation.status = "withdrawn";
  await invitation.save();

  await logAudit({
    action: "INVITATION_WITHDRAWN",
    entity: "Invitation",
    entityId: invitation._id,
    performedBy: req.business._id,
    role: "business",
    description: "Invitation withdrawn",
    req,
  });

  res.json({ message: "Invitation withdrawn" });
});

/* ======================================================
   QUOTATION SUMMARY WITH WINNER
====================================================== */
export const getQuotationSummary = asyncHandler(async (req, res) => {
  const { procurementId } = req.params;

  /* ================= LOAD PROCUREMENT ================= */
  const procurementDoc = await ProcurementRequest.findById(procurementId);

  if (!procurementDoc) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  if (!procurementDoc.bidOpened) {
    res.status(403);
    throw new Error("Bids are not opened yet");
  }

  /* ================= LOAD INVITATIONS ================= */
  const invitations = await Invitation.find({
    procurement: procurementId,
  })
    .populate("business", "name")
    .lean();

  /* ================= FILTER ONLY SUBMITTED ================= */
  const validInvitations = invitations.filter(
    (inv) => inv.quotation && inv.quotation.items?.length > 0
  );

  if (validInvitations.length === 0) {
    return res.json({
      procurement: {
        title: procurementDoc.title,
        referenceNumber: procurementDoc.referenceNumber,
        requestingDepartment: procurementDoc.requestingDepartment,
      },
      businesses: [],
      items: [],
    });
  }

  /* ================= BUSINESSES ================= */
  const businesses = validInvitations.map((inv) => ({
    businessId: inv.business._id.toString(),
    name: inv.business.name,
  }));

  /* ================= BUILD ITEMS ================= */
  const items = procurementDoc.items.map((pItem) => {
    let bestPrice = Infinity;
    let winnerBusinessId = null;
    const quotes = {};

    validInvitations.forEach((inv) => {
      const qItem = inv.quotation.items.find(
        (q) => q.procurementItemId.toString() === pItem._id.toString()
      );

      if (qItem?.unitPrice != null) {
        quotes[inv.business._id.toString()] = {
          unitPrice: qItem.unitPrice,
        };

        if (qItem.unitPrice < bestPrice) {
          bestPrice = qItem.unitPrice;
          winnerBusinessId = inv.business._id.toString();
        }
      } else {
        quotes[inv.business._id.toString()] = null;
      }
    });

    return {
      itemId: pItem._id.toString(),
      itemName: pItem.itemName,
      unit: pItem.unit,
      quantity: pItem.quantity,
      quotes,
      winnerBusinessId,
    };
  });

  /* ================= RESPONSE ================= */
  res.json({
    procurement: {
      title: procurementDoc.title,
      referenceNumber: procurementDoc.referenceNumber,
      requestingDepartment: procurementDoc.requestingDepartment,
    },
    businesses,
    items,
  });
});


export const downloadEvaluationReport = async (req, res) => {
  try {
    const { procurementId } = req.params;

    const summary = await buildQuotationSummary(procurementId); // your existing summary logic

    if (!summary) {
      return res.status(404).json({ message: "Summary not found" });
    }

    generateEvaluationReport(res, summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};