import express from "express";
import { submitBid, getBidsByProcurement, getMyBids } from "../controllers/bidController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Business submits a bid
 */
router.post("/", protect, submitBid);

/**
 * Admin view: all bids for a specific procurement
 */
router.get("/procurement/:id", protect, admin, getBidsByProcurement);

/**
 * Business view: my own bids
 */
router.get("/my", protect, getMyBids);

export default router;
