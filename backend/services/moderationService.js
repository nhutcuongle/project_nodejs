import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import ModerationLog from "../models/ModerationLog.js";

const models = {
  question: Question,
  answer: Answer,
};

/**
 * Gets all pending items for moderation.
 */
export const getPendingItemsLogic = async () => {
  const [questions, answers] = await Promise.all([
    Question.find({ approved: false }).populate("author").populate("hashtags", "name").lean(),
    Answer.find({ approved: false }).populate("author").lean()
  ]);
  return { questions, answers };
};

/**
 * Approves an item and logs the action.
 */
export const approveItemLogic = async (moderatorId, targetType, targetId) => {
  const Model = models[targetType];
  if (!Model) throw new Error("INVALID_TYPE");

  const item = await Model.findByIdAndUpdate(targetId, { approved: true }, { new: true });
  if (!item) throw new Error("ITEM_NOT_FOUND");

  await ModerationLog.create({
    moderator: moderatorId,
    targetType,
    targetId,
    action: "approve",
  });

  return item;
};

/**
 * Deletes an item and logs the action.
 */
export const deleteItemLogic = async (moderatorId, targetType, targetId, reason) => {
  const Model = models[targetType];
  if (!Model) throw new Error("INVALID_TYPE");

  const item = await Model.findByIdAndDelete(targetId);
  if (!item) throw new Error("ITEM_NOT_FOUND");

  await ModerationLog.create({
    moderator: moderatorId,
    targetType,
    targetId,
    action: "delete",
    reason,
  });

  return { success: true };
};
