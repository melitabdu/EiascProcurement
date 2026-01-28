import asyncHandler from "express-async-handler";
import Transfer from "../models/transferModel.js";
import Donation from "../models/donationModel.js";
import Mosque from "../models/mosqueModel.js";

/**
 * @desc Create transfer record (mosque reports transfer to EIASC or mock payment)
 * @route POST /api/transfers
 * @access Private (mosqueAdmin)
 */
export const createTransfer = asyncHandler(async (req, res) => {
  const { mosqueCode, amount, transactionId, transferredBy, donorName, method } = req.body;

  if (!mosqueCode || !amount) {
    res.status(400);
    throw new Error("mosqueCode and amount required");
  }

  const transfer = await Transfer.create({
    mosqueCode,
    amount,
    transactionId: transactionId || Math.random().toString(36).slice(-8), // mock transaction ID
    transferredBy,
    donorName: donorName || null,
    method: method || "mock",
    status: "success", // assume mock payment successful
  });

  await Mosque.findOneAndUpdate(
    { code: mosqueCode },
    { $inc: { totalCollected: amount } }
  );

  res.status(201).json({
    message: "Transfer created successfully",
    transfer,
  });
});

/**
 * @desc Create mock contribution (community/donor)
 * @route POST /api/transfers/mock
 * @access Private (donor)
 */
export const createMockContribution = asyncHandler(async (req, res) => {
  const { mosqueCode, amount, donorName } = req.body;

  if (!mosqueCode || !amount) {
    res.status(400);
    throw new Error("mosqueCode and amount required");
  }

  const transfer = await Transfer.create({
    mosqueCode,
    amount,
    donorName,
    method: "mock",
    status: "success",
    transactionId: Math.random().toString(36).slice(-8),
  });

  await Mosque.findOneAndUpdate(
    { code: mosqueCode },
    { $inc: { totalCollected: amount } }
  );

  res.status(201).json({
    message: "Mock contribution recorded",
    transfer,
  });
});

/**
 * @desc Verify transfer (admin confirms receipt)
 * @route PUT /api/transfers/:id/verify
 * @access Private/Admin
 */
export const verifyTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) {
    res.status(404);
    throw new Error("Transfer not found");
  }

  if (transfer.status === "success") {
    return res.json({ message: "Already verified" });
  }

  transfer.status = "success";
  await transfer.save();

  // Link donation if transactionId matches
  if (transfer.transactionId) {
    const donation = await Donation.findOne({ transactionId: transfer.transactionId });
    if (donation && !donation.confirmed) {
      donation.confirmed = true;
      await donation.save();
      await Mosque.findOneAndUpdate(
        { code: donation.mosqueCode },
        { $inc: { totalCollected: donation.amount } }
      );
    }
  }

  res.json({ message: "Transfer verified", transfer });
});

/**
 * @desc List transfers (admin)
 * @route GET /api/transfers
 * @access Private/Admin
 */
export const listTransfers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.mosqueCode) filter.mosqueCode = req.query.mosqueCode;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate || req.query.endDate) {
    filter.transferDate = {};
    if (req.query.startDate) filter.transferDate.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.transferDate.$lte = new Date(req.query.endDate);
  }

  const transfers = await Transfer.find(filter).populate("transferredBy", "fullName phone");
  res.json(transfers);
});

/**
 * @desc Get transfers summary (totals per mosque or overall)
 * @route GET /api/transfers/summary
 * @access Private/Admin
 */
export const transfersSummary = asyncHandler(async (req, res) => {
  const { mosqueCode, startDate, endDate } = req.query;

  const match = {};
  if (mosqueCode) match.mosqueCode = mosqueCode;
  if (startDate || endDate) {
    match.transferDate = {};
    if (startDate) match.transferDate.$gte = new Date(startDate);
    if (endDate) match.transferDate.$lte = new Date(endDate);
  }

  const summary = await Transfer.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$mosqueCode",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  res.json({ summary });
});

/**
 * @desc Get single transfer by ID
 * @route GET /api/transfers/:id
 * @access Private/Admin
 */
export const getTransferById = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id).populate("transferredBy", "fullName phone");
  if (!transfer) {
    res.status(404);
    throw new Error("Transfer not found");
  }
  res.json(transfer);
});
