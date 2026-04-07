import User from "../models/User.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import Vote from "../models/Vote.js";

/**
 * Gets overall system statistics.
 */
export const getSystemStats = async () => {
  const [totalUsers, totalQuestions, pendingQuestions, totalAnswers, totalVotes] =
    await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Question.countDocuments({ approved: false }),
      Answer.countDocuments(),
      Vote.countDocuments()
    ]);

  return { totalUsers, totalQuestions, pendingQuestions, totalAnswers, totalVotes };
};

/**
 * Gets counts grouped by time period (day, month, year, etc).
 */
export const getCountsByTime = async (modelName, type = "week") => {
  const models = { User, Question, Vote };
  const Model = models[modelName];
  if (!Model) throw new Error("Invalid model");
  
  const groupId = getTimeGroup(type);
  return await Model.aggregate([
    { $group: { _id: groupId, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
};

export const getUserRoleDistributionLogic = async () => {
  return await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
};

/**
 * Gets top users by question count.
 */
export const getTopAnswerers = async () => {
  return await Question.aggregate([
    { $group: { _id: "$author", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { _id: 0, username: "$user.username", identifier: "$user.identifier", count: 1 } }
  ]);
};

/**
 * Helper to get MongoDB date grouping operators.
 */
const getTimeGroup = (type) => {
  switch (type) {
    case "week": return { $week: "$createdAt" };
    case "month": return { $month: "$createdAt" };
    case "year": return { $year: "$createdAt" };
    default: return { $dayOfMonth: "$createdAt" };
  }
};
