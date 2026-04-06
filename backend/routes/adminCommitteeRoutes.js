// routes/adminCommitteeRoutes.js
import express from "express";
import { registerCommitteeMember } from "../controllers/adminCommitteeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/committee", protect, admin, registerCommitteeMember);

export default router;
