import asyncHandler from "express-async-handler";
import Donation from "../models/donationModel.js";
import Mosque from "../models/mosqueModel.js";

/**
 * @desc Create a new donation
 * @route POST /api/donations
 * @access Private (donor or mosqueAdmin)
 */
export const createDonation = asyncHandler(async (req, res) => {
  const { mosqueCode, amount, donorName, method, transactionId, transferredBy } = req.body;

  if (!mosqueCode || !amount) {
    res.status(400);
    throw new Error("mosqueCode and amount are required");
  }

  const donation = await Donation.create({
    mosqueCode,
    amount,
    donorName: donorName || "Anonymous",
    method: method || "mock",
    transactionId: transactionId || Math.random().toString(36).slice(-8),
    transferredBy: transferredBy || null,
    confirmed: method === "mock" ? true : false, // assume mock donations confirmed immediately
  });

  // Update total collected in mosque if confirmed
  if (donation.confirmed) {
    await Mosque.findOneAndUpdate(
      { code: mosqueCode },
      { $inc: { totalCollected: amount } }
    );
  }

  res.status(201).json({
    message: "Donation recorded successfully",
    donation,
  });
});

/**
 * @desc List all donations (admin)
 * @route GET /api/donations
 * @access Private/Admin
 */
export const listDonations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.mosqueCode) filter.mosqueCode = req.query.mosqueCode;
  if (req.query.confirmed) filter.confirmed = req.query.confirmed === "true";

  const donations = await Donation.find(filter).sort({ createdAt: -1 });
  res.json(donations);
});

/**
 * @desc Get donations by user
 * @route GET /api/donations/user/:userId
 * @access Private
 */
export const donationsByUser = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ transferredBy: req.params.userId }).sort({ createdAt: -1 });
  res.json(donations);
});

/**
 * @desc Get single donation by ID
 * @route GET /api/donations/:id
 * @access Private/Admin
 */
export const getDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  res.json(donation);
});

/**
 * @desc Update donation (admin can confirm)
 * @route PUT /api/donations/:id
 * @access Private/Admin
 */
export const updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }

  donation.confirmed = req.body.confirmed !== undefined ? req.body.confirmed : donation.confirmed;
  donation.amount = req.body.amount || donation.amount;
  donation.donorName = req.body.donorName || donation.donorName;
  donation.method = req.body.method || donation.method;

  const updatedDonation = await donation.save();

  // Update mosque total if confirmed
  if (updatedDonation.confirmed) {
    await Mosque.findOneAndUpdate(
      { code: updatedDonation.mosqueCode },
      { $inc: { totalCollected: updatedDonation.amount } }
    );
  }

  res.json({
    message: "Donation updated successfully",
    donation: updatedDonation,
  });
});

/**
 * @desc Delete donation
 * @route DELETE /api/donations/:id
 * @access Private/Admin
 */
export const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }

  // Optionally decrease mosque total if confirmed
  if (donation.confirmed) {
    await Mosque.findOneAndUpdate(
      { code: donation.mosqueCode },
      { $inc: { totalCollected: -donation.amount } }
    );
  }

  await donation.remove();
  res.json({ message: "Donation deleted successfully" });
});

/**
 * @desc Telebirr webhook stub (to be implemented)
 * @route POST /api/donations/webhook/telebirr
 * @access Public
 */
export const telebirrWebhook = asyncHandler(async (req, res) => {
  console.log("Received Telebirr webhook:", req.body);
  res.status(200).json({ message: "Webhook received" });
});
