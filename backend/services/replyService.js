import Reply from "../models/Reply.js";
import Comment from "../models/Comment.js";

/**
 * Creates a reply to a comment.
 */
export const createReplyLogic = async (commentId, userId, text, replyTo, io) => {
  const reply = await Reply.create({ comment: commentId, user: userId, text, replyTo: replyTo || null });
  const comment = await Comment.findByIdAndUpdate(commentId, { $inc: { replyCount: 1 } }, { new: true });

  await reply.populate("user", "username avatar identifier");
  if (reply.replyTo) await reply.populate("replyTo", "username identifier");

  if (io) {
    // Gửi cho tất cả mọi người trong video (room)
    io.to(`video_${comment.video.toString()}`).emit("new_reply", reply);

    // Update counts
    const comments = await Comment.find({ video: comment.video });
    const totalReplies = comments.reduce((acc, c) => acc + (c.replyCount || 0), 0);
    io.to(`video_${comment.video.toString()}`).emit("updateCommentsCount", {
      totalComments: comments.length + totalReplies,
    });
  }
  return reply;
};

/**
 * Toggles like on a reply.
 */
export const toggleLikeReplyLogic = async (replyId, userId, io) => {
  const reply = await Reply.findById(replyId).populate("comment");
  if (!reply) throw new Error("NOT_FOUND");

  const hasLiked = reply.likes.includes(userId);
  if (hasLiked) reply.likes.pull(userId);
  else reply.likes.push(userId);

  await reply.save();

  if (io) {
    io.to(`video_${reply.comment.video.toString()}`).emit("reply_liked", { 
      replyId: reply._id, 
      userId, 
      isLiked: !hasLiked, 
      likesCount: reply.likes.length 
    });
  }
  return { isLiked: !hasLiked, likesCount: reply.likes.length };
};

/**
 * Deletes a reply and updates comment count.
 */
export const deleteReplyLogic = async (replyId, userId, io) => {
  const reply = await Reply.findById(replyId).populate("comment");
  if (!reply) throw new Error("NOT_FOUND");
  if (reply.user.toString() !== userId) throw new Error("UNAUTHORIZED");

  const videoId = reply.comment.video;
  const commentId = reply.comment._id;

  await reply.deleteOne();
  await Comment.findByIdAndUpdate(commentId, { $inc: { replyCount: -1 } });

  if (io) {
    io.to(`video_${videoId.toString()}`).emit("reply_deleted", { replyId, commentId });
    
    const comments = await Comment.find({ video: videoId });
    const totalReplies = comments.reduce((acc, c) => acc + (c.replyCount || 0), 0);
    io.to(`video_${videoId.toString()}`).emit("updateCommentsCount", {
      totalComments: comments.length + totalReplies,
    });
  }
  return { success: true };
};
