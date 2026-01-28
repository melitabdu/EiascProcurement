import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc Register admin (can register multiple admins now)
 * @route POST /api/admin/register
 * @access Public
 */
export const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  // ✅ Validate required fields
  if (!fullName || !email || !phone || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // ✅ Check if email or phone already exists
  const existingAdmin = await User.findOne({
    $or: [{ phone }, { email }],
    role: "admin",
  });

  if (existingAdmin) {
    res.status(400);
    throw new Error("Admin with this phone or email already exists");
  }

  // ✅ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Create admin user
  const admin = await User.create({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role: "admin",
  });

  res.status(201).json({
    message: "Admin registered successfully",
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
    },
    token: generateToken(admin._id),
  });
});

/**
 * @desc Admin login
 * @route POST /api/admin/login
 * @access Public
 */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  // ✅ Find admin by phone
  const admin = await User.findOne({ phone, role: "admin" });
  if (!admin) {
    res.status(401);
    throw new Error("Admin not found");
  }

  // ✅ Compare password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid password");
  }

  // ✅ Return admin data with token
  res.json({
    _id: admin._id,
    fullName: admin.fullName,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    token: generateToken(admin._id),
  });
});
