import express from "express";
import {
  createAward,
  getAwardByProcurement,
  getAllAwards,
  cancelAward,
} from "../controllers/awardController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, admin, createAward);
router.get("/", protect, admin, getAllAwards);
router.get("/:procurementId", protect, admin, getAwardByProcurement);
router.patch("/cancel/:id", protect, admin, cancelAward);

export default router;
