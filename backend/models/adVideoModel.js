import mongoose from "mongoose";

const adVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
    },
    platform: {
      type: String,
      enum: ["youtube", "tiktok"],
      required: [true, "Platform is required"],
      default: "youtube",
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming admin user
    },
  },
  { timestamps: true }
);

const AdVideo = mongoose.model("AdVideo", adVideoSchema);
export default AdVideo;
