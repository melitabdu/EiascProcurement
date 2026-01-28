import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Business from "../models/business.js";

/* ================= TOKEN GENERATOR ================= */
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

/* ================= BUSINESS LOGIN ================= */
/**
 * @desc    Login for business users
 * @route   POST /api/business/login
 * @access  Public
 */
export const businessLogin = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res.status(400);
    throw new Error("Phone and password are required");
  }

  // 1️⃣ Find business user
  const user = await User.findOne({ phone, role: "business" }).select(
    "+password"
  );

  if (!user) {
    res.status(401);
    throw new Error("Business account not found");
  }

  // 2️⃣ Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // 3️⃣ Load linked business
  if (!user.businessId) {
    res.status(500);
    throw new Error("Business account not linked to a business profile");
  }

  const business = await Business.findById(user.businessId);
  if (!business) {
    res.status(404);
    throw new Error("Business record not found");
  }

  // 4️⃣ Update login timestamp
  user.lastLogin = new Date();
  await user.save();

  // 5️⃣ Generate token (CRITICAL)
  const token = generateToken({
    id: user._id,
    role: "business",
    businessId: business._id,
  });

  // 6️⃣ Response
  res.json({
    token,
    business: {
      businessId: business._id,
      name: business.name,
      email: business.email,
      logo: business.logo || null,
    },
  });
});
