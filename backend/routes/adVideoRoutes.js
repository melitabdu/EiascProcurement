import express from "express";
import {
  addAdVideo,
  getAdVideos,
  deleteAdVideo,
} from "../controllers/adVideoController.js";

const router = express.Router();

// Public: Get all ad videos
router.get("/", getAdVideos);

// Admin: Add new video
router.post("/", addAdVideo);

// Admin: Delete video
router.delete("/:id", deleteAdVideo);

export default router;
