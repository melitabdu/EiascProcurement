import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ✅ Roles for procurement system
    role: {
      type: String,
      enum: ["admin", "business", "staff"],
      default: "business",
    },

    // ✅ Linked business (only for business users)
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },

    // ✅ Account status
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================
   🔐 PASSWORD HASHING (CRITICAL)
===================================== */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("User", userSchema);
