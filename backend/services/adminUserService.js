import User from "../models/User.js";

/**
 * Checks if the target user is an admin.
 */
export const isTargetAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user?.role === "admin";
};

/**
 * Fetches all users with pagination and identifier filtering.
 */
export const getAllUsersLogic = async (currentAdminId, query) => {
  const { page = 1, limit = 10, identifier = "" } = query;
  const filter = { _id: { $ne: currentAdminId } };

  if (identifier) {
    filter.identifier = { $regex: identifier, $options: "i" };
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean(),
    User.countDocuments(filter)
  ]);

  return { users, total };
};

/**
 * Toggles a user's disabled status.
 */
export const toggleDisableUserLogic = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.role === "admin") throw new Error("CANNOT_MODIFY_ADMIN");

  user.isDisabled = !user.isDisabled;
  await user.save();
  return user;
};



export const deleteUserLogic = async (userId) => {
  const isAdmin = await isTargetAdmin(userId);
  if (isAdmin) throw new Error("CANNOT_MODIFY_ADMIN");

  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
};
