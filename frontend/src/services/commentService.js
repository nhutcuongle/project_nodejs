import api from "../utils/api";

const commentService = {
  async getComments(videoId) {
    const res = await api.get(`/comments/video/${videoId}`);
    return res.data;
  },
  async addComment(videoId, text, token) {
    const res = await api.post(
      `/comments/video/${videoId}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
  async toggleLike(commentId, token) {
    const res = await api.post(
      `/comments/${commentId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
  async deleteComment(commentId, token) {
    const res = await api.delete(`/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  async editComment(commentId, text, token) {
    const res = await api.put(
      `/comments/${commentId}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
};

export default commentService;
