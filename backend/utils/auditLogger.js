import AuditLog from "../models/auditLogModel.js";

export const logAudit = async ({
  user,
  action,
  entityType,
  entityId = null,
  description = "",
  oldValue = null,
  newValue = null,
  req,
}) => {
  try {
    await AuditLog.create({
      userId: user?._id,
      userRole: user?.role || "unknown",
      action,
      entityType,
      entityId,
      description,
      oldValue,
      newValue,
      ipAddress: req?.ip,
      userAgent: req?.headers["user-agent"],
    });
  } catch (err) {
    console.error("Audit Log Error:", err.message);
  }
};