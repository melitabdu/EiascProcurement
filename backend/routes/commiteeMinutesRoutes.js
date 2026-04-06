import express from "express";
import asyncHandler from "express-async-handler";

import {
  createCommitteeMinutes,
  getMinutesByProcurement,
  updateCommitteeMinutes,
  deleteCommitteeMinutes,
} from "../controllers/commiteeMinutesController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { generateMinutesPDF } from "../utils/generateMinutesPDF.js";
import ProcurementRequest from "../models/procurementModel.js";
import CommitteeMinutes from "../models/commiteeMinutesModel.js";

const router = express.Router();

/* =========================================
   CREATE MINUTES
========================================= */
router.post("/", protect, admin, createCommitteeMinutes);

/* =========================================
   GET MINUTES BY PROCUREMENT
========================================= */
router.get(
  "/procurement/:procurementId",
  protect,
  admin,
  getMinutesByProcurement
);

/* =========================================
   UPDATE MINUTES
========================================= */
router.put("/:id", protect, admin, updateCommitteeMinutes);

/* =========================================
   DELETE MINUTES
========================================= */
router.delete("/:id", protect, admin, deleteCommitteeMinutes);

/* =========================================
   GENERATE MINUTES PDF
========================================= */
router.get(
  "/:procurementId/pdf",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { procurementId } = req.params;

    const procurement = await ProcurementRequest.findById(procurementId)
      .populate("bidOpenedBy", "fullName");

    if (!procurement) {
      res.status(404);
      throw new Error("Procurement not found");
    }

    const minutes = await CommitteeMinutes.findOne({
      procurement: procurementId,
    });

    if (!minutes) {
      res.status(404);
      throw new Error("Minutes not found");
    }

    const summary = {
      procurement,
      items: procurement.items || [],
      businesses: procurement.invitedBusinesses || [],
    };

    generateMinutesPDF(res, summary, minutes);
  })
);

export default router;