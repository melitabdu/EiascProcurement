import express from "express";
import { businessLogin } from "../controllers/businessAuthController.js";

const router = express.Router();

router.post("/login", businessLogin);

export default router;
