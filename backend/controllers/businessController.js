import asyncHandler from "express-async-handler";
import fs from "fs";
import Business from "../models/business.js";
import User from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";

/* ===============================
   CREATE BUSINESS (ADMIN)
=============================== */
export const createBusiness = asyncHandler(async (req, res) => {
  const {
    name,
    categories,
    description,
    address,
    phone,
    email,
    website,
    password,
    latitude,
    longitude,
  } = req.body;

  if (!name || !categories || !email || !password || !phone) {
    res.status(400);
    throw new Error(
      "Name, categories, email, phone, and password are required"
    );
  }

  // Prevent duplicate business
  const businessExists = await Business.findOne({ email });
  if (businessExists) {
    res.status(400);
    throw new Error("Business with this email already exists");
  }

  // Prevent duplicate login
  const userExists = await User.findOne({ phone });
  if (userExists) {
    res.status(400);
    throw new Error("Phone number already used by another account");
  }

  /* ===============================
     LOGO UPLOAD
  =============================== */
  let logoUrl = "";
  if (req.files?.logo?.length) {
    const logoFile = req.files.logo[0];
    try {
      const uploadResult = await cloudinary.uploader.upload(logoFile.path, {
        folder: "businesses/logos",
      });
      logoUrl = uploadResult.secure_url;
    } finally {
      fs.existsSync(logoFile.path) && fs.unlinkSync(logoFile.path);
    }
  }

  /* ===============================
     DOCUMENT UPLOADS
  =============================== */
  const documentUrls = [];
  if (req.files?.documents?.length) {
    for (const file of req.files.documents) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "businesses/documents",
          resource_type: "raw",
        });
        documentUrls.push(uploadResult.secure_url);
      } finally {
        fs.existsSync(file.path) && fs.unlinkSync(file.path);
      }
    }
  }

  /* ===============================
     CREATE BUSINESS
  =============================== */
  const business = await Business.create({
    name,
    categories: Array.isArray(categories) ? categories : [categories],
    description,
    address,
    phone,
    email,
    website,
    logo: logoUrl,
    documents: documentUrls,
    location:
      latitude && longitude ? { lat: latitude, lng: longitude } : undefined,
    verified: true,
  });

  /* ===============================
     CREATE BUSINESS LOGIN USER
     ⚠️ DO NOT HASH PASSWORD HERE
  =============================== */
  await User.create({
    fullName: `${name} Admin`,
    phone,
    email,
    password, // ← plain password (hashed by model)
    role: "business",
    businessId: business._id,
    status: "active",
  });

  res.status(201).json({
    message: "✅ Business registered successfully",
    business,
  });
});

/* ===============================
   LIST BUSINESSES
=============================== */
export const listBusinesses = asyncHandler(async (req, res) => {
  const businesses = await Business.find().sort({ createdAt: -1 });
  res.json(businesses);
});

/* ===============================
   GET SINGLE BUSINESS
=============================== */
export const getBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) {
    res.status(404);
    throw new Error("Business not found");
  }
  res.json(business);
});

/* ===============================
   UPDATE BUSINESS
=============================== */
export const updateBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) {
    res.status(404);
    throw new Error("Business not found");
  }

  Object.assign(business, req.body);
  await business.save();

  res.json({ message: "Business updated", business });
});

/* ===============================
   DELETE BUSINESS
=============================== */
export const deleteBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) {
    res.status(404);
    throw new Error("Business not found");
  }

  await User.deleteOne({ businessId: business._id, role: "business" });
  await business.deleteOne();

  res.json({ message: "Business and linked login removed" });
});

/* ===============================
   LIST UNIQUE CATEGORIES
=============================== */
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Business.distinct("categories");
  res.json(categories);
});

/* ===============================
   LIST BUSINESSES BY CATEGORY
=============================== */
export const listBusinessesByCategory = asyncHandler(async (req, res) => {
  const businesses = await Business.find({
    categories: req.params.category,
  }).sort({ createdAt: -1 });

  res.json(businesses);
});
