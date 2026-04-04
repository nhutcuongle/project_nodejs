import Video from "../models/Video.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createVideo = async (userId, description, filePath) => {
  return await Video.create({ user: userId, description, videoUrl: filePath });
};

export const getTrendingVideos = () =>
  Video.find({ videoUrl: { $exists: true, $ne: "" } })
    .sort({ views: -1 })
    .limit(40)
    .populate("user", "username avatar identifier")
    .lean();

export const getRandomVideos = () =>
  Video.aggregate([
    { $match: { videoUrl: { $exists: true, $ne: "" } } },
    { $sample: { size: 10 } },
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userObj" } },
    { $unwind: "$userObj" },
    {
      $project: {
        videoUrl: 1, description: 1, likes: 1, commentsCount: 1, views: 1,
        user: { 
          _id: "$userObj._id", username: "$userObj.username", 
          avatar: "$userObj.avatar", identifier: "$userObj.identifier" 
        },
      },
    },
  ]);

export const toggleLikeVideoLogic = async (videoId, userId, io) => {
  const video = await Video.findById(videoId).populate("user");
  if (!video) throw new Error("NOT_FOUND");

  const userIdStr = userId.toString();
  const hasLiked = video.likes.some((id) => id.toString() === userIdStr);
  const liker = await User.findById(userId);

  if (hasLiked) {
    video.likes.pull(userId);
  } else {
    video.likes.push(userId);
    // Notification
    if (video.user._id.toString() !== userIdStr) {
      const notif = await Notification.create({
        user: video.user._id,
        message: `${liker.identifier} đã thích video của bạn.`,
        link: `/video/${video._id}`,
      });
      if (io) {
        io.to(video.user._id.toString()).emit("video_liked", {
          message: notif.message,
          link: notif.link,
          createdAt: notif.createdAt,
          read: false,
        });
      }
    }
  }

  await video.save();

  if (io) {
    io.to(`video_${video._id.toString()}`).emit("updateLikesCount", { likesCount: video.likes.length });
  }

  return { liked: !hasLiked, likesCount: video.likes.length };
};

export const deleteVideoFromCloudinary = async (url) => {
  if (!url?.includes("cloudinary.com")) return;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  if (!match) return;
  try {
    const { cloudinary } = await import("../utils/cloudinary.js");
    await cloudinary.uploader.destroy(match[1], { resource_type: "video" });
  } catch (err) {
    console.warn("Không xóa được Cloudinary:", err.message);
  }
};
