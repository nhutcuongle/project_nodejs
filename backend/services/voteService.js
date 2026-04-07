import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

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

  return { upvotes, downvotes, action };
};

/**
 * Bulk cleanup of votes for a target.
 */
export const cleanupVotes = async (targetId, targetType) => {
  await Vote.deleteMany({ targetId, targetType });
};
