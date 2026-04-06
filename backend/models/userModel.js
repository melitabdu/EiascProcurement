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
      unique: true,
      sparse: true,
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

    role: {
      type: String,
      enum: ["admin", "business", "staff", "committee"],
      default: "business",
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },

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
   🔐 HASH PASSWORD BEFORE SAVE
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

/* =====================================
   🔑 COMPARE PASSWORD
===================================== */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);