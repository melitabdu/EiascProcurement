import asyncHandler from "express-async-handler";
import Mosque from "../models/mosqueModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

/**
 * @desc Create a new mosque (admin) and auto-create mosque user
 * @route POST /api/mosques
 * @access Private/Admin
 */
export const createMosque = asyncHandler(async (req, res) => {
  const { name, code, region, zone, woreda, phone } = req.body;

  if (!name || !code) {
    res.status(400);
    throw new Error("Name and code required");
  }

  const exists = await Mosque.findOne({ code });
  if (exists) {
    res.status(400);
    throw new Error("Mosque code already exists");
  }

  // Create mosque
  const mosque = await Mosque.create({
    name,
    code,
    region,
    zone,
    woreda,
    phone,
    status: "pending",
  });

  // Auto-create mosque user with default password (can be changed later)
  const defaultPassword = Math.random().toString(36).slice(-8); // random 8 chars
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(defaultPassword, salt);

  const mosqueUser = await User.create({
    fullName: name + " Admin",
    phone: phone || code, // if phone not provided, use code
    password: hashedPassword,
    role: "mosqueAdmin",
    mosqueCode: code,
  });

  // Optionally return default password (to send via SMS/email)
  res.status(201).json({
    mosque,
    mosqueUser: {
      _id: mosqueUser._id,
      fullName: mosqueUser.fullName,
      phone: mosqueUser.phone,
      mosqueCode: mosqueUser.mosqueCode,
      role: mosqueUser.role,
      defaultPassword, // admin can send this to the mosque
    },
  });
});

/**
 * @desc Get all mosques
 * @route GET /api/mosques
 * @access Private/Admin
 */
export const listMosques = asyncHandler(async (req, res) => {
  const mosques = await Mosque.find().populate("admin", "fullName phone");
  res.json(mosques);
});

/**
 * @desc Get single mosque by id or code
 * @route GET /api/mosques/:identifier
 * @access Private (or public for provider page)
 */
export const getMosque = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  let mosque = await Mosque.findOne({ code: identifier }).populate("admin", "fullName phone");
  if (!mosque) mosque = await Mosque.findById(identifier).populate("admin", "fullName phone");
  if (!mosque) {
    res.status(404);
    throw new Error("Mosque not found");
  }
  res.json(mosque);
});

/**
 * @desc Update mosque (admin)
 * @route PUT /api/mosques/:id
 * @access Private/Admin
 */
export const updateMosque = asyncHandler(async (req, res) => {
  const mosque = await Mosque.findById(req.params.id);
  if (!mosque) {
    res.status(404);
    throw new Error("Mosque not found");
  }

  mosque.name = req.body.name || mosque.name;
  mosque.region = req.body.region || mosque.region;
  mosque.zone = req.body.zone || mosque.zone;
  mosque.woreda = req.body.woreda || mosque.woreda;
  mosque.phone = req.body.phone || mosque.phone;
  if (req.body.status) mosque.status = req.body.status;

  // Update mosque admin if provided
  if (req.body.adminId) {
    mosque.admin = req.body.adminId;
    await User.findByIdAndUpdate(req.body.adminId, { mosqueCode: mosque.code, role: "mosqueAdmin" });
  }

  const updated = await mosque.save();
  res.json(updated);
});

/**
 * @desc Delete mosque (admin) and optionally delete linked mosque user
 * @route DELETE /api/mosques/:id
 * @access Private/Admin
 */
export const deleteMosque = asyncHandler(async (req, res) => {
  const mosque = await Mosque.findById(req.params.id);
  if (mosque) {
    // Delete linked mosque user
    await User.deleteMany({ mosqueCode: mosque.code, role: "mosqueAdmin" });

    await mosque.remove();
    res.json({ message: "Mosque and linked users removed" });
  } else {
    res.status(404);
    throw new Error("Mosque not found");
  }
});
