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
// ENV + DB
// =======================
dotenv.config();
connectDB();

// =======================
// APP INIT
// =======================
const app = express();

// =======================
// BODY PARSERS
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =======================
// CORS
// =======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5734",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// =======================
// LOGGER
// =======================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =======================
// HEALTH CHECK
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
// ROUTES
// =======================

// USERS
app.use("/api/users", userRoutes);

// ADMIN AUTH
app.use("/api/admin", adminAuthRoutes);

// BUSINESS AUTH
app.use("/api/business", businessAuthRoutes);

// BUSINESS CRUD
app.use("/api/businesses", businessRoutes);

// PROCUREMENT
app.use("/api/procurements", procurementRoutes);

// INVITATIONS & BIDS
app.use("/api/invitations", invitationRoutes);
app.use("/api/bids", bidRoutes);

// ADMIN + AWARDS
app.use("/api/admin", adminCommitteeRoutes);
app.use("/api/awards", awardRoutes);

// COMMITTEE MINUTES
app.use("/api/committee-minutes", committeeMinutesRoutes);

// ADS
app.use("/api/advideos", adVideoRoutes);

// AUDIT LOGS
app.use("/api/audit-logs", auditLogRoutes);

// =======================
// GLOBAL ERROR LOGGER (🔥 IMPORTANT)
// =======================
app.use((err, req, res, next) => {
  console.error("==================================");
  console.error("🔥 GLOBAL ERROR CAUGHT");
  console.error("Message:", err.message);
  console.error("Name:", err.name);
  console.error("Stack:", err.stack);
  console.error("==================================");

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// =======================
// NOT FOUND HANDLER
// =======================
app.use(notFound);

// =======================
// ERROR HANDLER (backup)
// =======================
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