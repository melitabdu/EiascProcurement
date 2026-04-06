import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";

// =======================
// Route Imports
// =======================
import userRoutes from "./routes/userRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import businessAuthRoutes from "./routes/businessAuthRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import procurementRoutes from "./routes/procurementRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import adVideoRoutes from "./routes/adVideoRoutes.js";
import adminCommitteeRoutes from "./routes/adminCommitteeRoutes.js";
import awardRoutes from "./routes/awardRoutes.js";
import committeeMinutesRoutes from "./routes/commiteeMinutesRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";



// =======================
// Error Middleware
// =======================
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// =======================
// Load ENV & Connect DB
// =======================
dotenv.config();
connectDB();

// =======================
// Init App
// =======================
const app = express();

// =======================
// Body Parsers (IMPORTANT)
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =======================
// CORS (SAFE CONFIG)
// =======================
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Public frontend
      "http://localhost:5734", // Admin frontend
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// =======================
// Logger
// =======================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =======================
// Health Check
// =======================
app.get("/", (req, res) => {
  res.send("✅ EIASC Procurement API is running...");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server running fine 🚀",
  });
});

// =======================
// API ROUTES (ORDER MATTERS)
// =======================

// 👤 USERS (optional / public)
app.use("/api/users", userRoutes);

// 🔐 ADMIN AUTH
app.use("/api/admin", adminAuthRoutes);

// 🔐 BUSINESS AUTH (LOGIN / REGISTER)
app.use("/api/business", businessAuthRoutes);

// 🏢 BUSINESS CRUD
app.use("/api/businesses", businessRoutes);

// 📦 PROCUREMENT
app.use("/api/procurements", procurementRoutes);

// ✉️ INVITATIONS & BIDS
app.use("/api/invitations", invitationRoutes);
app.use("/api/bids", bidRoutes);

app.use("/api/admin", adminCommitteeRoutes);
app.use("/api/awards", awardRoutes);


app.use("/api/committee-minutes", committeeMinutesRoutes);


// 📺 ADS
app.use("/api/advideos", adVideoRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// =======================
// ERROR HANDLERS (MUST BE LAST)
// =======================
app.use(notFound);
app.use(errorHandler);

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});
