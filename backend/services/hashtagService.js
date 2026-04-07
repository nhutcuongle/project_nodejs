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

export const getQuestionsByHashtagLogic = async (hashtagId) => {
  return await Question.find({ hashtags: hashtagId })
    .select("_id title author createdAt")
    .populate("author", "fullName avatar identifier")
    .sort({ createdAt: -1 });
};

export const getAllHashtagsLogic = async () => {
  return await Hashtag.find().sort({ usedCount: -1 });
};

export const searchHashtagsLogic = async (q) => {
  return await Hashtag.find({
    name: { $regex: q, $options: "i" }
  }).limit(10);
};

export const updateHashtagLogic = async (id, data) => {
  if (data.name) {
    const existing = await Hashtag.findOne({ name: data.name.toLowerCase().trim() });
    if (existing && existing._id.toString() !== id) throw new Error("HASHTAG_EXISTS");
  }
  return await Hashtag.findByIdAndUpdate(id, data, { new: true });
};
