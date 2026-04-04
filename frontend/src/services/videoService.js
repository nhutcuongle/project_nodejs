import axiosClient from "./axiosClient";

const videoService = {
  getFeed: async () => {
    const res = await axiosClient.get("/videos/feed");
    return res.data;
  },

  upload: async (formData, token) => {
    const res = await axiosClient.post("/videos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  deleteVideo: async (id, token) => {
    const res = await axiosClient.delete(`/videos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  likeVideo: async (id, token) => {
    const res = await axiosClient.post(
      `/videos/${id}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  toggleLike: async (id, token) => {
    return await videoService.likeVideo(id, token);
  },
};

export default videoService;
