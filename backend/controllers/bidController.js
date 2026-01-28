import asyncHandler from "express-async-handler";
import Bid from "../models/bidModel.js";
import Invitation from "../models/invitationModel.js";
import Procurement from "../models/procurementModel.js";

/**
 * @desc Submit a bid (for businesses)
 * @route POST /api/bids
 * @access Protected (business)
 */
export const submitBid = asyncHandler(async (req, res) => {
  const { procurementId, bidAmount, proposalText } = req.body;
  const businessId = req.user._id; // logged-in business

  const procurement = await Procurement.findById(procurementId);
  if (!procurement) {
    res.status(404);
    throw new Error("Procurement not found");
  }

  // Only invited businesses can bid for "invited" procurements
  if (procurement.type === "invited") {
    const invited = await Invitation.findOne({
      procurement: procurementId,
      business: businessId,
    });
    if (!invited) {
      res.status(403);
      throw new Error("You are not invited to this procurement");
    }
  }

  const bid = await Bid.create({
    procurement: procurementId,
    business: businessId,
    bidAmount,
    proposalText,
  });

  // Update invitation status if exists
  await Invitation.findOneAndUpdate(
    { procurement: procurementId, business: businessId },
    { status: "bid_submitted" }
  );

  res.status(201).json(bid);
});

/**
 * @desc Get all bids for a procurement (Admin view)
 * @route GET /api/bids/procurement/:id
 * @access Admin
 */
export const getBidsByProcurement = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ procurement: req.params.id }).populate(
    "business",
    "fullName email phone"
  );
  res.json(bids);
});

/**
 * @desc Get all bids submitted by the logged-in business
 * @route GET /api/bids/my
 * @access Protected (business)
 */
export const getMyBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ business: req.user._id }).populate(
    "procurement",
    "title deadline status"
  );
  res.json(bids);
});
