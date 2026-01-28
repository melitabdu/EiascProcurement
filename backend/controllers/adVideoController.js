import AdVideo from "../models/adVideoModel.js";

// ✅ Add new video
export const addAdVideo = async (req, res) => {
  try {
    const { title, platform, videoUrl } = req.body;

    if (!title || !platform || !videoUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newVideo = await AdVideo.create({
      title,
      platform,
      videoUrl,
      createdBy: req.user?._id || null, // optional
    });

    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Error adding video:", error);
    res.status(500).json({ message: "Failed to add video" });
  }
};

// ✅ Get all videos
export const getAdVideos = async (req, res) => {
  try {
    const videos = await AdVideo.find().sort({ createdAt: -1 });
    res.json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

// ✅ Delete video
export const deleteAdVideo = async (req, res) => {
  try {
    const video = await AdVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    await video.deleteOne();
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Failed to delete video" });
  }
};
