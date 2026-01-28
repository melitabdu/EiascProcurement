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
// Optional auth (recommended)
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===============================
   CREATE BUSINESS (ADMIN)
   POST /api/businesses
=============================== */
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  createBusiness
);

/* ===============================
   LIST ALL BUSINESSES
   GET /api/businesses
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
   UPDATE BUSINESS (OPTIONAL FILE UPDATE)
   PUT /api/businesses/:id
=============================== */
router.put(
  "/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  updateBusiness
);

/* ===============================
   DELETE BUSINESS
   DELETE /api/businesses/:id
=============================== */
router.delete("/:id", deleteBusiness);

export default router;
