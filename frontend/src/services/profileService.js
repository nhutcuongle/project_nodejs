import axios from "./axiosClient";

export const getProfile = (identifier) => {
  const url = identifier ? `/user/by-identifier/${identifier}` : "/user/me";
  return axios.get(url);
};

export const updateProfile = (data) => axios.put("/user/update-profile", data);

export const changePassword = (data) => axios.put("/user/change-password", data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("images", file);
  return axios.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
