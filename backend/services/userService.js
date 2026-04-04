import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Video from "../models/Video.js";
import bcrypt from "bcrypt";

/**
 * Update user profile information.
 */
export const updateUserProfile = async (userId, data) => {
  const { username, address, phoneNumber, avatar, identifier, bio } = data;

  const user = await User.findById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");

  if (identifier && identifier !== user.identifier) {
    const existedIdentifier = await User.findOne({ identifier });
    if (existedIdentifier) throw new Error("Mã định danh đã tồn tại");
    user.identifier = identifier;
  }

  if (username && username !== user.username) {
    const existedUsername = await User.findOne({ username });
    if (existedUsername) throw new Error("Tên người dùng đã tồn tại");
    user.username = username;
  }

  if (address) user.address = address;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (avatar) user.avatar = avatar;
  if (bio !== undefined) user.bio = bio;

  await user.save();
  return await User.findById(userId).select("-password");
};

/**
 * Change user password.
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Mật khẩu hiện tại không đúng");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return true;
};

/**
 * Fetches user profile with followers and following counts.
 */
export const getUserProfileWithStats = async (userIdOrIdentifier, isOwnProfile = false) => {
  const query = userIdOrIdentifier.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: userIdOrIdentifier }
    : { identifier: userIdOrIdentifier };

  const selectFields = isOwnProfile 
    ? "_id username email avatar identifier phoneNumber address bio createdAt" 
    : "_id username avatar bio createdAt identifier";

  const user = await User.findOne(query).select(selectFields).lean();
  if (!user) throw new Error("Không tìm thấy người dùng");

  const [followersCount, followingCount, videoLikesResult] = await Promise.all([
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
    Video.aggregate([
      { $match: { user: user._id } },
      { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
      { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } }
    ])
  ]);

  const likesCount = videoLikesResult[0]?.totalLikes || 0;

  return { ...user, followersCount, followingCount, likesCount };
};

/**
 * Helper to fetch a generic user by ID.
 */
export const getPublicUserById = async (userId) => {
    return getUserProfileWithStats(userId, false);
};

/**
 * Helper to fetch a generic user by identifier.
 */
export const getPublicUserByIdentifier = async (identifier) => {
    return getUserProfileWithStats(identifier, false);
};
