import * as videoRepository from "../repositories/videoRepository.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createVideo = async (userId, description, filePath) => {
  return await videoRepository.create({ user: userId, description, videoUrl: filePath });
};

export const getTrendingVideos = (limit = 40) => {
  return videoRepository.findTrending(limit);
};

export const getRandomVideos = (size = 10) => {
  return videoRepository.findRandom(size);
};

export const toggleLikeVideoLogic = async (videoId, userId, io) => {
  // Use repository to find the video
  const video = await videoRepository.findById(videoId, "user");
  if (!video) throw new Error("NOT_FOUND");

  const userIdStr = userId.toString();
  const hasLiked = video.likes.some((id) => id.toString() === userIdStr);
  const liker = await User.findById(userId); // Still using User model directly for now

  if (hasLiked) {
    video.likes.pull(userId);
  } else {
    video.likes.push(userId);
    // Notification logic stays in Service Layer (Business Logic)
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

  // Use repository to save the document
  await videoRepository.save(video);

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
