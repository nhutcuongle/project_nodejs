import Hashtag from "../models/Hashtag.js";
import Question from "../models/Question.js";

/**
 * Gets all hashtags with their question counts using efficient aggregation.
 */
export const getAllHashtagsWithCounts = async (search) => {
  const match = search ? { name: { $regex: search, $options: "i" } } : {};
  
  return await Hashtag.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "hashtags",
        as: "questions"
      }
    },
    {
      $project: {
        name: 1,
        createdAt: 1,
        questionCount: { $size: "$questions" }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
};

/**
 * Creates a new hashtag if it doesn't exist.
 */
export const createHashtagLogic = async (name) => {
  const lowerName = name.toLowerCase().trim();
  const exists = await Hashtag.findOne({ name: lowerName });
  if (exists) throw new Error("HASHTAG_EXISTS");

  return await Hashtag.create({ name: lowerName });
};

/**
 * Deletes a hashtag and cleans up question references.
 */
export const deleteHashtagLogic = async (id) => {
  await Promise.all([
    Hashtag.findByIdAndDelete(id),
    Question.updateMany({ hashtags: id }, { $pull: { hashtags: id } })
  ]);
  return { success: true };
};

/**
 * Bulk delete hashtags.
 */
export const bulkDeleteHashtagsLogic = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("INVALID_IDS");

  const result = await Promise.all([
    Hashtag.deleteMany({ _id: { $in: ids } }),
    Question.updateMany(
      { hashtags: { $in: ids } },
      { $pull: { hashtags: { $in: ids } } }
    )
  ]);

  return { deletedCount: result[0].deletedCount };
};
