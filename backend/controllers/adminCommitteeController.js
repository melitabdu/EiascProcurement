// controllers/adminCommitteeController.js
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

export const registerCommitteeMember = asyncHandler(async (req, res) => {
  const { fullName, phone, email, password } = req.body;

  if (!fullName || !phone || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const exists = await User.findOne({ phone });
  if (exists) {
    res.status(400);
    throw new Error("Committee member already exists");
  }

  const member = await User.create({
    fullName,
    phone,
    email: email || undefined,
  password,
  role: "committee",
  status: "active",
  });

  res.status(201).json({
    message: "Committee member registered successfully",
    member: {
      id: member._id,
      fullName: member.fullName,
      phone: member.phone,
      email: member.email,
    },
  });
});
