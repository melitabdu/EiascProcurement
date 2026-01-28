import asyncHandler from "express-async-handler";
import Invitation from "../models/invitationModel.js";
import ProcurementRequest from "../models/procurementModel.js";
import Business from "../models/business.js";

/* ======================================================
   INVITE BUSINESSES (ADMIN)
====================================================== */
export const inviteBusinesses = asyncHandler(async (req, res) => {
  const { procurementId, businessIds } = req.body;

  if (!procurementId || !Array.isArray(businessIds) || businessIds.length === 0) {
    res.status(400);
    throw new Error("Procurement ID and business IDs are required");
  }

  const procurement = await ProcurementRequest.findById(procurementId);
  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  const invited = [];

  for (const businessId of businessIds) {
    const business = await Business.findById(businessId);
    if (!business) continue;

    const exists = await Invitation.findOne({
      procurement: procurementId,
      business: businessId,
    });
    if (exists) continue;

    const invitation = await Invitation.create({
      procurement: procurementId,
      business: businessId,
      sealed: true,
      status: "invited",
    });

    invited.push(invitation);

    if (!procurement.invitedBusinesses.includes(businessId)) {
      procurement.invitedBusinesses.push(businessId);
    }
  }

  await procurement.save();

  res.status(201).json({
    message: `${invited.length} businesses invited successfully`,
    invitations: invited,
  });
});

/* ======================================================
   GET INVITATIONS BY PROCUREMENT (ADMIN)
====================================================== */
export const getInvitationsByProcurement = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({
    procurement: req.params.id,
  })
    .populate("business", "name email phone logo")
    .populate(
      "procurement",
      "title referenceNumber deadline category items"
    );

  res.json(invitations);
});

/* ======================================================
   GET INVITATIONS FOR BUSINESS DASHBOARD
====================================================== */
export const getInvitationsByBusiness = asyncHandler(async (req, res) => {
  if (req.user.role !== "business") {
    res.status(403);
    throw new Error("Access denied");
  }

  const invitations = await Invitation.find({
    business: req.user.businessId,
  })
    .populate({
      path: "procurement",
      select: "title description deadline referenceNumber items",
    })
    .lean();

  const business = await Business.findById(req.user.businessId);

  const result = invitations.map((inv) => ({
    ...inv,
    procurement: {
      ...inv.procurement,
      items: inv.procurement?.items || [],
    },
    business: {
      businessId: business._id,
      name: business.name,
      logo: business.logo || null,
      email: business.email,
    },
  }));

  res.json(result);
});

/* ======================================================
   SUBMIT SEALED QUOTATION (BUSINESS)
====================================================== */
export const submitQuotation = asyncHandler(async (req, res) => {
  const { items = [], priceValidityUntil, generalRemarks } = req.body;

  if (req.user.role !== "business") {
    res.status(403);
    throw new Error("Only businesses can submit quotations");
  }

  const invitation = await Invitation.findById(req.params.id).populate(
    "procurement"
  );

  if (!invitation) {
    res.status(404);
    throw new Error("Invitation not found");
  }

  if (invitation.business.toString() !== req.user.businessId.toString()) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  if (invitation.status !== "invited") {
    res.status(400);
    throw new Error("Quotation already submitted or closed");
  }

  if (new Date() > new Date(invitation.procurement.deadline)) {
    res.status(400);
    throw new Error("Submission deadline has passed");
  }

  if (!priceValidityUntil) {
    res.status(400);
    throw new Error("Price validity date is required");
  }

  const procurementItems = invitation.procurement.items || [];

  const quotationItems = procurementItems.map((pItem) => {
    const quoted = items.find(
      (i) => i.procurementItemId === pItem._id.toString()
    );

    // ❌ Not quoted
    if (!quoted || quoted.unitPrice == null) {
      return {
        procurementItemId: pItem._id,
        itemName: pItem.itemName,
        unit: pItem.unit,
        quoted: false,
        unitPrice: null,
        quantity: pItem.quantity,
        totalPrice: null,
        deliveryTimeDays: null,
        remarks: quoted?.remarks || "",
      };
    }

    if (quoted.deliveryTimeDays == null) {
      res.status(400);
      throw new Error(
        `Delivery time (days) is required for item: ${pItem.itemName}`
      );
    }

    return {
      procurementItemId: pItem._id,
      itemName: pItem.itemName,
      unit: pItem.unit,
      quoted: true,
      unitPrice: Number(quoted.unitPrice),
      quantity: pItem.quantity,
      totalPrice: Number(quoted.unitPrice) * pItem.quantity,
      deliveryTimeDays: Number(quoted.deliveryTimeDays),
      remarks: quoted.remarks || "",
    };
  });

  invitation.quotation = {
    items: quotationItems,
    priceValidityUntil: new Date(priceValidityUntil),
    remarks: generalRemarks || "",
    submittedAt: new Date(),
  };

  invitation.status = "submitted";
  await invitation.save();

  res.json({ message: "Quotation submitted successfully" });
});

/* ======================================================
   WITHDRAW INVITATION (BUSINESS)
====================================================== */
export const withdrawInvitation = asyncHandler(async (req, res) => {
  if (req.user.role !== "business") {
    res.status(403);
    throw new Error("Only businesses can withdraw invitations");
  }

  const invitation = await Invitation.findById(req.params.id);

  if (!invitation) {
    res.status(404);
    throw new Error("Invitation not found");
  }

  if (invitation.business.toString() !== req.user.businessId.toString()) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  if (invitation.status !== "invited") {
    res.status(400);
    throw new Error("Cannot withdraw after quotation submission");
  }

  await ProcurementRequest.findByIdAndUpdate(invitation.procurement, {
    $pull: { invitedBusinesses: invitation.business },
  });

  await invitation.deleteOne();

  res.json({ message: "Invitation withdrawn successfully" });
});

/* ======================================================
   GET ALL SUBMITTED QUOTATIONS (ADMIN) ✅ FINAL FIX
====================================================== */
export const getAllSubmittedQuotations = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({ status: "submitted" })
    .populate("business", "name email")
    .populate("procurement", "title referenceNumber deadline items")
    .lean();

  const result = invitations.map((inv) => {
    const procurementItems = inv.procurement?.items || [];

    const fixedItems =
      inv.quotation?.items?.map((qItem) => {
        const pItem = procurementItems.find(
          (p) => p._id.toString() === qItem.procurementItemId.toString()
        );

        return {
          ...qItem,
          itemName: qItem.itemName || pItem?.itemName || "—",
          unit: qItem.unit || pItem?.unit || "—",
        };
      }) || [];

    return {
      ...inv,
      quotation: {
        ...inv.quotation,
        items: fixedItems,
      },
    };
  });

  res.json(result);
});

/* ======================================================
   OPEN SEALED BIDS (ADMIN)
====================================================== */
export const openInvitations = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({
    procurement: req.params.procurementId,
    sealed: true,
  });

  for (const inv of invitations) {
    inv.sealed = false;
    inv.status = "opened";
    await inv.save();
  }

  res.json({
    message: "Sealed bids opened successfully",
    openedCount: invitations.length,
  });
});

/* ======================================================
   UPDATE INVITATION STATUS (ADMIN)
====================================================== */
export const updateInvitationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowedStatuses = ["shortlisted", "awarded", "rejected"];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status update");
  }

  const invitation = await Invitation.findById(req.params.id);
  if (!invitation) {
    res.status(404);
    throw new Error("Invitation not found");
  }

  invitation.status = status;
  await invitation.save();

  res.json({ message: `Invitation ${status}` });
});
// controllers/invitationController.js

export const getQuotationSummary = asyncHandler(async (req, res) => {
  const { procurementId } = req.params;

  const invitations = await Invitation.find({
    procurement: procurementId,
    status: "submitted",
  })
    .populate("business", "name")
    .populate(
      "procurement",
      "title referenceNumber requestingDepartment items"
    )
    .lean();

  if (!invitations.length) {
    return res.status(404).json({ message: "No quotations found" });
  }

  const procurement = invitations[0].procurement;

  // Prepare business list
  const businesses = invitations.map((inv) => ({
    businessId: inv.business._id.toString(),
    name: inv.business.name,
  }));

  // Build item-based matrix
  const items = procurement.items.map((pItem) => {
    let lowestPrice = Infinity;
    let winnerBusinessId = null;

    const quotes = {};

    for (const inv of invitations) {
      const qItem = inv.quotation.items.find(
        (q) => q.procurementItemId.toString() === pItem._id.toString()
      );

      if (qItem && qItem.quoted && qItem.totalPrice != null) {
        quotes[inv.business._id] = {
          totalPrice: qItem.totalPrice,
          unitPrice: qItem.unitPrice,
          deliveryTimeDays: qItem.deliveryTimeDays,
        };

        if (qItem.totalPrice < lowestPrice) {
          lowestPrice = qItem.totalPrice;
          winnerBusinessId = inv.business._id.toString();
        }
      } else {
        quotes[inv.business._id] = null; // not quoted
      }
    }

    return {
      itemId: pItem._id,
      itemName: pItem.itemName,
      unit: pItem.unit,
      quantity: pItem.quantity,
      quotes,
      winnerBusinessId,
    };
  });

  res.json({
    procurement: {
      _id: procurement._id,
      title: procurement.title,
      referenceNumber: procurement.referenceNumber,
      requestingDepartment: procurement.requestingDepartment,
    },
    businesses,
    items,
  });
});
