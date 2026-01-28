import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Mosque from "../models/mosqueModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

/**
 * @desc Register user (donor or admin)
 * @route POST /api/users/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, phone, password, role, mosqueCode } = req.body;

  if (!fullName || !phone || !password) {
    res.status(400);
    throw new Error("Please provide name, phone, and password");
  }

  const userExists = await User.findOne({ phone });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with that phone");
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    phone,
    password: hashed,
    role: role || "donor",
    mosqueCode,
  });

  res.status(201).json({
    _id: user._id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    mosqueCode: user.mosqueCode,
    token: genToken(user._id),
  });
});

/**
 * @desc Admin: create mosque user
 * @route POST /api/users/mosque
 * @access Private/Admin
 */
export const registerMosqueUser = asyncHandler(async (req, res) => {
  const { fullName, phone, password, mosqueCode } = req.body;

  if (!fullName || !phone || !password || !mosqueCode) {
    res.status(400);
    throw new Error("All fields are required");
  }

  // Check mosque exists
  const mosque = await Mosque.findOne({ code: mosqueCode });
  if (!mosque) {
    res.status(404);
    throw new Error("Mosque code not found");
  }

  // Check if phone already used
  const userExists = await User.findOne({ phone });
  if (userExists) {
    res.status(400);
    throw new Error("Phone number already in use");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    phone,
    password: hashedPassword,
    role: "mosqueAdmin",
    mosqueCode,
  });

  res.status(201).json({
    message: "Mosque user created successfully",
    user: {
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      mosqueCode: user.mosqueCode,
      role: user.role,
    },
  });
});

/**
 * @desc Login user
 * @route POST /api/users/login
 * @access Public
 */
export const authUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      mosqueCode: user.mosqueCode,
      token: genToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid phone or password");
  }
});

/**
 * @desc Get logged-in user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) res.json(user);
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.fullName = req.body.fullName || user.fullName;
  user.phone = req.body.phone || user.phone;
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }
  if (req.body.mosqueCode) user.mosqueCode = req.body.mosqueCode;

  const updated = await user.save();
  res.json({
    _id: updated._id,
    fullName: updated.fullName,
    phone: updated.phone,
    role: updated.role,
    mosqueCode: updated.mosqueCode,
    token: genToken(updated._id),
  });
});

/**
 * @desc Admin: list users (optional role filter)
 * @route GET /api/users
 * @access Private/Admin
 */
export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).select("-password");
  res.json(users);
});

/**
 * @desc Admin: delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
