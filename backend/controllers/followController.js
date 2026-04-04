import * as followService from "../services/followService.js";
import * as userService from "../services/userService.js";

// Theo dõi người dùng
export const followUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followingId = req.params.userId;
    const io = req.app.get("io");

    await followService.followUser(followerId, followingId, io);
    res.status(201).json({ message: "Đã theo dõi người dùng" });
  } catch (err) {
    res.status(err.message.includes("theo dõi") ? 400 : 500).json({ message: err.message });
  }
};

// Hủy theo dõi người dùng
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followingId = req.params.userId;
    const io = req.app.get("io");

    await followService.unfollowUser(followerId, followingId, io);
    res.json({ message: "Đã hủy theo dõi" });
  } catch (err) {
    res.status(err.message.includes("theo dõi") ? 404 : 500).json({ message: err.message });
  }
};

// Kiểm tra trạng thái follow
export const getFollowStatus = async (req, res) => {
  try {
    const result = await followService.getFullFollowStatus(req.user._id, req.params.userId);
    res.json(result); // Tra vè { status, isFollowing, isFollowedByTarget }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bạn bè (mutual friends)
export const getFriendsList = async (req, res) => {
  try {
    const friends = await followService.getMutualFriends(req.params.userId);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách người đang theo dõi user
export const getFollowers = async (req, res) => {
  try {
    const followers = await followService.getFollowList(req.params.userId, "followers");
    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách user mà mình đang theo dõi
export const getFollowing = async (req, res) => {
  try {
    const following = await followService.getFollowList(req.params.userId, "following");
    res.json(following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Profile Routes (Bridging to userService) ---

export const getPublicProfile = async (req, res) => {
  try {
    const profile = await userService.getUserProfileWithStats(req.params.userId);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getOwnPublicProfile = async (req, res) => {
  try {
    const profile = await userService.getUserProfileWithStats(req.user._id, true);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getPublicProfileByIdentifier = async (req, res) => {
  try {
    const profile = await userService.getUserProfileWithStats(req.params.identifier);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
