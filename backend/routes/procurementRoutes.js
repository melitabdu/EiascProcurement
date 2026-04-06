import express from "express";
import asyncHandler from "express-async-handler";
import Procurement from "../models/procurementModel.js";
import {
  createProcurement,
  getProcurements,
  getOpenProcurements,
  getInvitedProcurements,
  updateDraftProcurement,
  updateProcurementStatus,
  archiveProcurement,
  deleteProcurement,
  approveBidOpen,
  finalizeBidOpen,
  committeeApproveOpen,
  extendDeadline
} from "../controllers/procurementController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =====================
   PUBLIC
===================== */
router.get("/open", getOpenProcurements);

/* =====================
   ADMIN
===================== */
router.post(
  "/",
  protect,
  upload.array("documents", 5),
  admin,
  createProcurement
);

router.get("/", protect, admin, getProcurements);

router.get("/:id", protect, admin, asyncHandler(async (req, res) => {
  const procurement = await Procurement.findById(req.params.id);
  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }
  res.json(procurement);
}));

router.put("/:id", protect, admin, updateDraftProcurement);
router.delete("/:id", protect, admin, deleteProcurement);

router.patch("/:id/status", protect, admin, updateProcurementStatus);
router.patch("/:id/archive", protect, admin, archiveProcurement);
router.patch("/extend-deadline/:id", protect, admin, extendDeadline);

/* =====================
   BID OPENING (ADMIN)
===================== */
router.post("/:id/approve-open", protect, admin, approveBidOpen);
router.patch("/:id/finalize-open", protect, admin, finalizeBidOpen);

/* =====================
   BUSINESS
===================== */
router.get("/invited", protect, getInvitedProcurements);
router.post("/:id/committee-approve", committeeApproveOpen);

export default router;