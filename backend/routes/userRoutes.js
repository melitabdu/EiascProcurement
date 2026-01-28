import express from "express";
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  listUsers,
  deleteUser,
  registerMosqueUser, // <-- new import
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", authUser);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Admin routes
router.get("/", protect, admin, listUsers);
router.delete("/:id", protect, admin, deleteUser);
router.post("/mosque", protect, admin, registerMosqueUser); // <-- new route

export default router;
