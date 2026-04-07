import Follow from "../models/Follow.js";
import User from "../models/User.js";

/**
 * Follow a user and send notification.
 */
export const followUser = async (followerId, followingId, io) => {
  if (followerId.toString() === followingId.toString()) {
    throw new Error("Không thể tự theo dõi mình");
  }

  const existed = await Follow.findOne({ follower: followerId, following: followingId });
  if (existed) throw new Error("Bạn đã theo dõi người này rồi");

  await Follow.create({ follower: followerId, following: followingId });

  const [follower, isFollowedBy] = await Promise.all([
    User.findById(followerId).select("_id username identifier"),
    Follow.findOne({ follower: followingId, following: followerId })
  ]);

  const type = isFollowedBy ? "friend" : "follow";
  const msg = isFollowedBy
    ? `${follower.username} đã theo dõi bạn, từ nay các bạn là bạn bè`
    : `${follower.username} đã theo dõi bạn`;

  if (io) {
    io.to(followingId.toString()).emit("follow_notification", {
      sender: {
        _id: follower._id,
        username: follower.username,
        identifier: follower.identifier,
      },
      type,
    });
  }

  return true;
};

/**
 * Unfollow a user.
 */
export const unfollowUser = async (followerId, followingId, io) => {
  const deleted = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
  if (!deleted) throw new Error("Bạn chưa theo dõi người này");

  const follower = await User.findById(followerId).select("_id username identifier");

  if (io) {
    io.to(followingId.toString()).emit("follow_notification", {
      sender: {
        _id: follower._id,
        username: follower.username,
        identifier: follower.identifier,
      },
      type: "unfollow",
    });
  }

  return true;
};

/**
 * Get detailed follow status between two users.
 */
export const getFullFollowStatus = async (userId, otherId) => {
  const [isFollowing, isFollowedByTarget] = await Promise.all([
    Follow.findOne({ follower: userId, following: otherId }),
    Follow.findOne({ follower: otherId, following: userId })
  ]);

  let status = "none";
  if (isFollowing && isFollowedByTarget) status = "friend";
  else if (isFollowing) status = "following";
  else if (isFollowedByTarget) status = "followed_by";

  return {
    status,
    isFollowing: !!isFollowing,
    isFollowedByTarget: !!isFollowedByTarget
  };
};

/**
 * Get follower/following list.
 */
export const getFollowList = async (userId, type) => {
  const query = type === "followers" ? { following: userId } : { follower: userId };
  const populateField = type === "followers" ? "follower" : "following";

  const data = await Follow.find(query)
    .populate(populateField, "_id username identifier avatar")
    .lean();

  return data
    .map((f) => f[populateField])
    .filter((u) => u && u._id);
};

/**
 * Get mutual friends list.
 */
export const getMutualFriends = async (userId) => {
  const [following, followers] = await Promise.all([
    Follow.find({ follower: userId }).select("following"),
    Follow.find({ following: userId }).select("follower")
  ]);

  const followingIds = following.map((f) => f.following.toString());
  const followerIds = followers.map((f) => f.follower.toString());
  const mutualIds = followingIds.filter((id) => followerIds.includes(id));

  return User.find({ _id: { $in: mutualIds } }).select("_id username identifier avatar");
};
