import asyncHandler from "express-async-handler";
import fs from "fs";
import Business from "../models/business.js";
import User from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";

/* ===============================
   CREATE BUSINESS
=============================== */
export const createBusiness = async (req, res) => {
  try {
    console.log("========== CREATE BUSINESS START ==========");

    const {
      name,
      categories,
      description, // ✅ Added
      email,
      password,
      contactPersonName,
      contactPersonPhone,
      phone,
      address,
      website,
    } = req.body;

    if (!name || !categories || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existing = await Business.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Business already exists",
      });
    }

    /* =========================
       UPLOAD LOGO
    ========================= */
    let logoUrl = "";

    const logoFile = req.files?.logo?.[0];

    if (logoFile) {
      const upload = await cloudinary.uploader.upload(logoFile.path, {
        folder: "businesses/logos",
      });

      logoUrl = upload.secure_url;
      fs.unlinkSync(logoFile.path);
    }

    /* =========================
       CREATE BUSINESS
    ========================= */
    const business = await Business.create({
      name,
      categories: Array.isArray(categories) ? categories : [categories],
      description, // ✅ Saved
      email,
      phone,
      address,
      website,
      logo: logoUrl,
      contactPerson: {
        name: contactPersonName,
        phone: contactPersonPhone,
      },
    });

    /* =========================
       CREATE LOGIN USER
    ========================= */
    await User.create({
      fullName: contactPersonName || `${name} Admin`,
      phone: contactPersonPhone,
      email,
      password,
      role: "business",
      businessId: business._id,
      status: "active",
    });

    console.log("SUCCESS:", business._id);

    return res.status(201).json({
      message: "Business created successfully",
      business,
    });
  } catch (error) {
    console.error("🔥 REAL ERROR:");
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ===============================
   LIST BUSINESSES
=============================== */
export const listBusinesses = asyncHandler(async (req, res) => {
  const { search } = req.query;

  let filter = {};

  if (search) {
    filter = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { categories: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }, // ✅ Search description too
        { "contactPerson.name": { $regex: search, $options: "i" } },
      ],
    };
  }

  const businesses = await Business.find(filter).sort({
    createdAt: -1,
  });

  res.json(businesses);
});

/* ===============================
   GET BUSINESS
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

  res.json({
    message: "Business updated",
    business,
  });
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

  await User.deleteOne({
    businessId: business._id,
    role: "business",
  });

  await business.deleteOne();

  res.json({
    message: "Business and linked login removed",
  });
});

/* ===============================
   LIST CATEGORIES
=============================== */
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Business.distinct("categories");
  res.json(categories);
});

/* ===============================
   BUSINESSES BY CATEGORY
=============================== */
export const listBusinessesByCategory = asyncHandler(async (req, res) => {
  const businesses = await Business.find({
    categories: req.params.category,
  }).sort({ createdAt: -1 });

  res.json(businesses);
});