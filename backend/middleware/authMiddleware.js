import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User not found");
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export const admin = (req, res, next) => {
  if (
    req.user &&
    typeof req.user.role === "string" &&
    req.user.role.toLowerCase() === "admin"
  ) {
    // normalize admin user
    req.user = {
      _id: req.user._id,
      role: "admin",
    };
    next();
  } else {
    res.status(403);
    throw new Error("Requires admin role");
  }
};
