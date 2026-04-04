// src/services/replyService.js
import api from "../utils/api";

const replyService = {
  async getReplies(commentId) {
    const res = await api.get(`/replies/${commentId}`);
    return res.data;
  },
  async addReply(commentId, text, token, replyTo) {
    const res = await api.post(
      `/replies/${commentId}`,
      { text, replyTo }, // replyTo là id của người được reply
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
  async toggleLike(replyId, token) {
    const res = await api.post(
      `/replies/${replyId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
  async deleteReply(replyId, token) {
    const res = await api.delete(`/replies/${replyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export default replyService;
