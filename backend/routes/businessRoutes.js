import express from "express";
import {
  createBusiness,
  listBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness,
  listCategories,
  listBusinessesByCategory,
} from "../controllers/businessController.js";

import upload from "../middleware/uploadMiddleware.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===============================
   CREATE BUSINESS (ADMIN)
   POST /api/businesses
=============================== */
router.post(
  "/",
  protect,
  admin,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  createBusiness
);

/* ===============================
   LIST ALL BUSINESSES
   Supports search
   GET /api/businesses?search=abc
=============================== */
router.get("/", listBusinesses);

/* ===============================
   LIST UNIQUE CATEGORIES
   GET /api/businesses/categories
=============================== */
router.get("/categories", listCategories);

/* ===============================
   LIST BUSINESSES BY CATEGORY
   GET /api/businesses/category/:category
=============================== */
router.get("/category/:category", listBusinessesByCategory);

/* ===============================
   GET SINGLE BUSINESS
   GET /api/businesses/:id
=============================== */
router.get("/:id", getBusiness);

/* ===============================
   UPDATE BUSINESS (ADMIN)
   PUT /api/businesses/:id
=============================== */
router.put(
  "/:id",
  protect,
  admin,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  updateBusiness
);

/* ===============================
   DELETE BUSINESS (ADMIN)
   DELETE /api/businesses/:id
=============================== */
router.delete("/:id", protect, admin, deleteBusiness);

export default router;