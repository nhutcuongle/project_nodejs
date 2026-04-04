import api from "../utils/api";

const conversationService = {
  async getConversations(box = "main") {
    try {
      const res = await api.get(`/conversations?box=${box}`);
      return res.data || { conversations: [], friends: [] };
    } catch (err) {
      console.error("getConversations error:", err);
      return { conversations: [], friends: [] };
    }
  },

  async startConversation(recipientId, text = "") {
    try {
      const res = await api.post(`/conversations`, { recipientId, text });
      return res.data || null;
    } catch (err) {
      console.error("startConversation error:", err);
      return null;
    }
  },

  async acceptRequest(conversationId) {
    try {
      const res = await api.post(`/conversations/${conversationId}/accept`);
      return res.data || null;
    } catch (err) {
      console.error("acceptRequest error:", err);
      return null;
    }
  },

  async rejectRequest(conversationId) {
    try {
      const res = await api.post(`/conversations/${conversationId}/reject`);
      return res.data || null;
    } catch (err) {
      console.error("rejectRequest error:", err);
      return null;
    }
  },

  async deleteConversationLocal(conversationId) {
    try {
      const res = await api.delete(`/conversations/${conversationId}`);
      return res.data;
    } catch (err) {
      console.error("deleteConversationLocal error:", err);
      return null;
    }
  },
};

export default conversationService;
