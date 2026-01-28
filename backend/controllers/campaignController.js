import asyncHandler from "express-async-handler";
import Campaign from "../models/campaignModel.js";

/**
 * @desc Create campaign (admin)
 * @route POST /api/campaigns
 * @access Private/Admin
 */
export const createCampaign = asyncHandler(async (req, res) => {
  const { title, description, goalAmount, startDate, endDate } = req.body;
  if (!title) {
    res.status(400);
    throw new Error("Title required");
  }
  const campaign = await Campaign.create({
    title,
    description,
    goalAmount: goalAmount || 0,
    startDate,
    endDate,
    active: true,
  });
  res.status(201).json(campaign);
});

/**
 * @desc Get all campaigns
 * @route GET /api/campaigns
 * @access Public
 */
export const listCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  res.json(campaigns);
});

/**
 * @desc Get campaign
 * @route GET /api/campaigns/:id
 * @access Public
 */
export const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    res.status(404);
    throw new Error("Campaign not found");
  }
  res.json(campaign);
});

/**
 * @desc Update campaign
 * @route PUT /api/campaigns/:id
 * @access Private/Admin
 */
export const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    res.status(404);
    throw new Error("Campaign not found");
  }
  campaign.title = req.body.title || campaign.title;
  campaign.description = req.body.description || campaign.description;
  campaign.goalAmount = req.body.goalAmount !== undefined ? req.body.goalAmount : campaign.goalAmount;
  campaign.startDate = req.body.startDate || campaign.startDate;
  campaign.endDate = req.body.endDate || campaign.endDate;
  if (req.body.active !== undefined) campaign.active = req.body.active;
  await campaign.save();
  res.json(campaign);
});

/**
 * @desc Delete campaign
 * @route DELETE /api/campaigns/:id
 * @access Private/Admin
 */
export const deleteCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    res.status(404);
    throw new Error("Campaign not found");
  }
  await campaign.remove();
  res.json({ message: "Campaign removed" });
});
