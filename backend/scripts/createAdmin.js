// scripts/createAdmin.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect using .env
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected to MongoDB");

    const existingAdmin = await Admin.findOne({
      phone: "0984438542",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      await mongoose.connection.close();
      process.exit(0);
    }

    const admin = new Admin({
      name: "Main Admin",
      phone: "0984438542",
      password: "Admin@123zxcvbnm", // hashed by pre-save middleware
    });

    await admin.save();

    console.log("✅ Admin created successfully");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();