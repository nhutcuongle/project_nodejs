import axiosClient from "./axiosClient";

// Theo dõi người dùng
export const followUser = (targetUserId) => {
  return axiosClient.post(`/follow/${targetUserId}`);
};

// Bỏ theo dõi người dùng
export const unfollowUser = (targetUserId) => {
  return axiosClient.delete(`/follow/${targetUserId}`);
};

// Lấy trạng thái theo dõi
export const getFollowStatus = (targetUserId) => {
  return axiosClient.get(`/follow/status/${targetUserId}`);
};

// Lấy danh sách bạn bè (có follow qua lại)
export const getFriends = (userId) => {
  return axiosClient.get(`/follow/friends/${userId}`);
};

// Lấy danh sách người theo dõi mình
export const getFollowers = (userId) => {
  return axiosClient.get(`/follow/followers/${userId}`);
};

// Lấy danh sách mình đang theo dõi
export const getFollowing = (userId) => {
  return axiosClient.get(`/follow/following/${userId}`);
};
// Lấy thông tin public profile bằng mã định danh
export const getPublicProfileByIdentifier = (identifier) => {
  return axiosClient.get(`/follow/identifier/${identifier}/public`);
};
