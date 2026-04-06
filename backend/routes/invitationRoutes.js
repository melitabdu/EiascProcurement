import express from "express";
import {
  inviteBusinesses,
  getInvitationsByProcurement,
  getInvitationsByBusiness,
  submitQuotation,
  openInvitations,
  updateInvitationStatus,
  getAllSubmittedQuotations,
  withdrawInvitation,
  getQuotationSummary,
  downloadEvaluationReport,
} from "../controllers/invitationController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { protectBusiness } from "../middleware/businessAuthMiddleware.js";

const router = express.Router();

/* =========================
   ADMIN ROUTES
========================= */

// Invite businesses
router.post("/", protect, admin, inviteBusinesses);

// View invitations for a procurement
router.get(
  "/procurement/:id",
  protect,
  admin,
  getInvitationsByProcurement
);

// View all submitted quotations ✅
router.get(
  "/submitted",
  protect,
  admin,
  getAllSubmittedQuotations
);

// Open sealed bids
router.patch(
  "/open/:procurementId",
  protect,
  admin,
  openInvitations
);

// Update invitation status
router.patch(
  "/:id/status",
  protect,
  admin,
  updateInvitationStatus
);

/* =========================
   BUSINESS ROUTES
========================= */

// Business dashboard invitations (TOKEN BASED)
router.get(
  "/business",
  protectBusiness,
  getInvitationsByBusiness
);

// Submit quotation
router.post(
  "/:id/quotation",
  protectBusiness,
  submitQuotation
);
router.get(
  "/summary/:procurementId",
  protect,
  admin,
  getQuotationSummary
);

// Withdraw invitation
router.delete(
  "/:id/withdraw",
  protectBusiness,
  withdrawInvitation
);
router.get(
  "/report/:procurementId",
  protect,
  admin,
  downloadEvaluationReport
);

export default router;
