import * as videoRepository from "../repositories/videoRepository.js";
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

/**
 * Logic for updating a video's details (e.g. description).
 */
export const updateVideoLogic = async (videoId, userId, description) => {
  const video = await Video.findById(videoId);
  if (!video) throw new Error("NOT_FOUND");
  if (video.user.toString() !== userId.toString()) throw new Error("UNAUTHORIZED");

  if (description !== undefined) {
    video.description = description;
  }

  await video.save();
  return video;
};
