// frontend/src/services/userService.js
import api from "../utils/api.js";

const userService = {
  // Lấy thông tin người dùng hiện tại
  async getCurrentUser() {
    try {
      const res = await api.get("/users/me");
      return res.data;
    } catch (err) {
      console.error("getCurrentUser error:", err);
      return null;
    }
  },

  // Cập nhật profile người dùng
  async updateUserProfile(userId, data) {
    try {
      const res = await api.put("/users/update-profile", data);
      return res.data;
    } catch (err) {
      console.error("updateUserProfile error:", err);
      throw err;
    }
  },

  // Đổi mật khẩu
  async changeUserPassword(userId, currentPassword, newPassword) {
    try {
      const res = await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    } catch (err) {
      console.error("changeUserPassword error:", err);
      throw err;
    }
  },

  // Lấy thông tin công khai của 1 người dùng theo userId
  async getPublicUserById(userId) {
    try {
      const res = await api.get(`/users/${userId}/public`);
      return res.data;
    } catch (err) {
      console.error("getPublicUserById error:", err);
      return null;
    }
  },

  // Lấy thông tin công khai của 1 người dùng theo identifier
  async getPublicUserByIdentifier(identifier) {
    try {
      const res = await api.get(`/users/by-identifier/${identifier}`);
      return res.data;
    } catch (err) {
      console.error("getPublicUserByIdentifier error:", err);
      return null;
    }
  },

  // Lấy thông tin user kèm thống kê follow (ví dụ cho profile)
  async getUserWithFollowStats(userId) {
    try {
      const user = await this.getCurrentUser(); // có thể mở rộng nếu backend trả stats
      return user;
    } catch (err) {
      console.error("getUserWithFollowStats error:", err);
      return null;
    }
  },
};

export default userService;
