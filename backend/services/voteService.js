import Vote from "../models/Vote.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import * as notificationService from "./notificationService.js";

/**
 * Gets vote counts for a target.
 */
export const getVoteCounts = async (targetId, targetType) => {
  const [upvotes, downvotes] = await Promise.all([
    Vote.countDocuments({ targetId, targetType, voteType: "up" }),
    Vote.countDocuments({ targetId, targetType, voteType: "down" }),
  ]);
  return { upvotes, downvotes };
};

/**
 * Gets vote statistics in bulk for multiple targets.
 */
export const getBulkVotesStats = async (targetIds, targetType, userId) => {
  const votes = await Vote.find({ targetId: { $in: targetIds }, targetType }).lean();
  
  const stats = {};
  targetIds.forEach((id) => {
    stats[id.toString()] = { upvotes: 0, downvotes: 0, userVote: null };
  });

  votes.forEach((v) => {
    const id = v.targetId.toString();
    if (!stats[id]) return;

    if (v.voteType === "up") stats[id].upvotes++;
    if (v.voteType === "down") stats[id].downvotes++;
    if (userId && v.user.toString() === userId.toString()) {
      stats[id].userVote = v.voteType;
    }
  });

  return stats;
};

/**
 * Gets the vote type of a specific user for a target.
 */
export const getUserVote = async (userId, targetId, targetType) => {
  if (!userId) return null;
  const vote = await Vote.findOne({ user: userId, targetId, targetType });
  return vote?.voteType || null;
};

/**
 * Handles the voting process.
 */
export const handleVote = async (userId, username, targetId, targetType, voteType, io) => {
  const existingVote = await Vote.findOne({ targetId, targetType, user: userId });
  let action = "create";

  if (existingVote) {
    if (existingVote.voteType === voteType) {
      await Vote.deleteOne({ _id: existingVote._id });
      action = "removed";
    } else {
      existingVote.voteType = voteType;
      await existingVote.save();
      action = "switched";
    }
  } else {
    await Vote.create({ targetId, targetType, user: userId, voteType });
  }

  const { upvotes, downvotes } = await getVoteCounts(targetId, targetType);

  // Send notification if action was not 'removed'
  if (action !== "removed") {
    let targetOwner = null;
    let message = "";
    let link = "";

    if (targetType === "question") {
      const question = await Question.findById(targetId).populate("author", "_id username title");
      if (question) {
        targetOwner = question.author?._id;
        message = `${username || "Một người dùng"} đã ${voteType === "up" ? "thích" : "ghét"} câu hỏi của bạn: "${question.title}"`;
        link = `/questions/${question._id}`;
      }
    } else if (targetType === "answer") {
      const answer = await Answer.findById(targetId).populate("author", "_id username question");
      if (answer) {
        targetOwner = answer.author?._id;
        message = `${username || "Một người dùng"} đã ${voteType === "up" ? "upvote" : "downvote"} câu trả lời của bạn.`;
        link = `/questions/${answer.question}`;
      }
    }

    if (targetOwner && targetOwner.toString() !== userId.toString()) {
      await notificationService.sendVoteNotification(targetOwner, message, link, io);
    }
  }

  return { upvotes, downvotes, action };
};

/**
 * Bulk cleanup of votes for a target.
 */
export const cleanupVotes = async (targetId, targetType) => {
  await Vote.deleteMany({ targetId, targetType });
};
