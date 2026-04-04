import * as userService from "../services/userService.js";

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changeUserPassword(req.user.id, currentPassword, newPassword);
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getUserWithFollowStats(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPublicUserInfo = async (req, res) => {
  try {
    const user = await userService.getPublicUserById(req.params.userId);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getPublicUserInfoByIdentifier = async (req, res) => {
  try {
    const user = await userService.getPublicUserByIdentifier(req.params.identifier);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
