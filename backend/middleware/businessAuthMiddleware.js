import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

export const protectBusiness = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 1️⃣ Load user
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User not found");
      }

      if (user.role !== "business") {
        res.status(403);
        throw new Error("Not authorized as business");
      }

      // 2️⃣ Attach normalized auth object
      req.user = {
        _id: user._id,
        role: user.role,
        businessId: decoded.businessId || user.businessId,
      };

      if (!req.user.businessId) {
        res.status(403);
        throw new Error("Business access not linked");
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});
