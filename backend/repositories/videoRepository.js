import Video from "../models/Video.js";

/**
 * Creates a new video document.
 */
export const create = async (videoData) => {
  return await Video.create(videoData);
};

/**
 * Find trending videos based on high views, limited to a certain number.
 */
export const findTrending = async (limit = 40) => {
  return await Video.find({ videoUrl: { $exists: true, $ne: "" } })
    .sort({ views: -1 })
    .limit(limit)
    .populate("user", "username avatar identifier")
    .lean();
};

/**
 * Find random videos using aggregation.
 */
export const findRandom = async (size = 10) => {
  return await Video.aggregate([
    { $match: { videoUrl: { $exists: true, $ne: "" } } },
    { $sample: { size } },
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userObj" } },
    { $unwind: "$userObj" },
    {
      $project: {
        videoUrl: 1,
        description: 1,
        likes: 1,
        commentsCount: 1,
        views: 1,
        user: {
          _id: "$userObj._id",
          username: "$userObj.username",
          avatar: "$userObj.avatar",
          identifier: "$userObj.identifier",
        },
      },
    },
  ]);
};

/**
 * Find a video by ID with optional selection or population.
 */
export const findById = async (id, populateFields = "user") => {
  return await Video.findById(id).populate(populateFields);
};

/**
 * Saves a Mongoose document.
 */
export const save = async (videoDoc) => {
  return await videoDoc.save();
};

/**
 * Removes a video by ID.
 */
export const deleteById = async (id) => {
  return await Video.findByIdAndDelete(id);
};
