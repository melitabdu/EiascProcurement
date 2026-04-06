import asyncHandler from "express-async-handler";
import AuditLog from "../models/auditLogModel.js";

/* =============================================
   GET ALL AUDIT LOGS
============================================= */

export const getAuditLogs = asyncHandler(async (req, res) => {

  const logs = await AuditLog.find()
    .populate("userId", "fullName email role")
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(logs);
});


/* =============================================
   GET ENTITY TIMELINE
============================================= */

export const getEntityTimeline = asyncHandler(async (req, res) => {

  const { entityId } = req.params;

  const logs = await AuditLog.find({ entityId })
    .populate("userId", "fullName role")
    .sort({ createdAt: 1 });

  res.json(logs);
});