import express from "express";
import {
  getAuditLogs,
  getEntityTimeline,
} from "../controllers/auditLogController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =============================================
   ADMIN AUDIT LOG VIEW
============================================= */

router.get("/", protect, admin, getAuditLogs);

/* =============================================
   PROCUREMENT TIMELINE
============================================= */

router.get("/timeline/:entityId", protect, admin, getEntityTimeline);

export default router;