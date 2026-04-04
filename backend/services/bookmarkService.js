import Bookmark from "../models/Bookmark.js";

/**
 * Adds a bookmark for a target (Question or Video).
 */
export const addBookmarkLogic = async (userId, targetId, targetType = "Question") => {
  const exists = await Bookmark.findOne({ user: userId, targetId, targetType });
  if (exists) throw new Error("ALREADY_BOOKMARKED");

  return await Bookmark.create({
    user: userId,
    targetId,
    targetType,
  });
};

/**
 * Removes a bookmark.
 */
export const removeBookmarkLogic = async (userId, targetId, targetType = "Question") => {
  return await Bookmark.findOneAndDelete({ user: userId, targetId, targetType });
};

/**
 * Fetches bookmarks for a user, enriched with target data.
 */
export const getUserBookmarksEnriched = async (userId, type, currentUserId) => {
  const filter = { user: userId };
  if (type) filter.targetType = type;

  const bookmarks = await Bookmark.find(filter)
    .populate({
      path: "targetId",
      populate: [
        { path: "author", select: "username avatar identifier" },
        { path: "hashtags", select: "name" },
      ],
    })
    .sort({ createdAt: -1 })
    .lean();

  return bookmarks
    .map((b) => b.targetId)
    .filter(Boolean)
    .map((item) => ({
      ...item,
      savedByUser: currentUserId ? currentUserId.toString() === userId.toString() : false,
    }));
};
