import express from "express";
import {
  createProcurement,
  getProcurements,
  getOpenProcurements,
  getInvitedProcurements,
  updateDraftProcurement,
  updateProcurementStatus,
  archiveProcurement,
  deleteProcurement,
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
router.delete(
  "/procurements/:id",
  protect,
  admin,
  deleteProcurement
);
router.put(
  "/:id",
  protect,
  admin,
  updateDraftProcurement
);



router.patch("/:id/status", protect, admin, updateProcurementStatus);

router.patch("/:id/archive", protect, admin, archiveProcurement);

/* =====================
   BUSINESS
===================== */
router.get("/invited", protect, getInvitedProcurements);

export default router;
