import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import { formatTime } from "../utils/formatTime.js";

/**
 * Creates a comment and updates total counts via socket.
 */
export const createCommentLogic = async (videoId, userId, text, io) => {
  const comment = await Comment.create({ video: videoId, user: userId, text });
  const populated = await comment.populate("user", "username avatar");

  if (io) {
    io.to(`video_${videoId}`).emit("new_comment", populated);
    
    // Total count update
    const comments = await Comment.find({ video: videoId }).select("replyCount");
    const totalReplies = comments.reduce((acc, c) => acc + (c.replyCount || 0), 0);
    io.to(`video_${videoId}`).emit("updateCommentsCount", {
        totalComments: comments.length + totalReplies,
    });
  }

  return populated;
};

/**
 * Gets formatted comments for a video.
 */
export const getCommentsByVideoLogic = async (videoId) => {
  const comments = await Comment.find({ video: videoId })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 })
    .lean();

  return comments.map((c) => ({
    ...c,
    timeAgo: formatTime(c.createdAt),
  }));
};

/**
 * Toggles a like on a comment.
 */
export const toggleLikeCommentLogic = async (commentId, userId, io) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Không tìm thấy bình luận.");

  const hasLiked = comment.likes.includes(userId);
  if (hasLiked) {
    comment.likes.pull(userId);
  } else {
    comment.likes.push(userId);
  }

  await comment.save();

  if (io) {
    io.to(`video_${comment.video.toString()}`).emit("comment_liked", {
      commentId: comment._id,
      userId,
      isLiked: !hasLiked,
      likesCount: comment.likes.length,
    });
  }

  return { isLiked: !hasLiked, likesCount: comment.likes.length };
};

/**
 * Deletes a comment and its replies.
 */
export const deleteCommentLogic = async (commentId, userId, io) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Không tìm thấy comment.");

  if (comment.user.toString() !== userId.toString()) {
    throw new Error("Không có quyền xóa bình luận này.");
  }

  await Reply.deleteMany({ comment: comment._id });
  await Comment.findByIdAndDelete(comment._id);

  if (io) {
    io.to(`video_${comment.video.toString()}`).emit("comment_deleted", { commentId: comment._id });
  }

  return true;
};

/**
 * Updates a comment text and sets isEdited flag.
 */
export const updateCommentLogic = async (commentId, userId, newText, io) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Không tìm thấy comment.");

  if (comment.user.toString() !== userId.toString()) {
    throw new Error("Không có quyền sửa bình luận này.");
  }

  comment.text = newText;
  comment.isEdited = true;
  await comment.save();
  const populated = await comment.populate("user", "username avatar");

  if (io) {
    io.to(`video_${comment.video.toString()}`).emit("comment_updated", populated);
  }

  return populated;
};
