import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log("Authorization Header:", req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded:", decoded);

      const user = await User.findById(decoded.id).select("-password");
      console.log("User:", user);

      if (!user) {
        console.log("❌ User not found");
        res.status(401);
        throw new Error("User not found");
      }

      console.log("User Role:", user.role);

      req.user = user;
      next();
    } catch (err) {
      console.error("JWT Error:", err);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    console.log("❌ No Authorization header");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});
export const admin = (req, res, next) => {
  console.log("Admin middleware user:", req.user);

  if (
    req.user &&
    typeof req.user.role === "string" &&
    req.user.role.toLowerCase() === "admin"
  ) {
    console.log("✅ Admin authorized");
    next();
  } else {
    console.log("❌ Role is:", req.user?.role);

    res.status(403);
    throw new Error("Requires admin role");
  }
};
