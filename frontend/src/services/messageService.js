import api from "../utils/api";

const messageService = {
  async getMessages(conversationId) {
    try {
      const res = await api.get(`/messages/${conversationId}`);
      return res.data || [];
    } catch (err) {
      console.error("getMessages error:", err);
      return [];
    }
  },

  async sendMessage(conversationId, recipientId, text) {
    try {
      const res = await api.post(`/messages`, {
        conversationId,
        recipientId,
        text,
      });
      return res.data || null;
    } catch (err) {
      console.error("sendMessage error:", err);
      return null;
    }
  },
  async editMessage(messageId, text) {
    try {
      const res = await api.put(`/messages/${messageId}`, { text });
      return res.data || null;
    } catch (err) {
      console.error("editMessage error:", err);
      return null;
    }
  },

  async markAsRead(conversationId) {
    try {
      await api.post(`/messages/${conversationId}/read`);
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  },
  async recallMessage(messageId) {
    try {
      await api.post(`/messages/${messageId}/recall`);
    } catch (err) {
      console.error("recallMessage error:", err);
    }
  },

  async deleteMessageLocal(messageId) {
    try {
      await api.post(`/messages/${messageId}/delete`);
    } catch (err) {
      console.error("deleteMessageLocal error:", err);
    }
  },
  async togglePin(messageId) {
    try {
      const res = await api.put(`/messages/${messageId}/pin`);
      return res.data; // ⭐ BẮT BUỘC
    } catch (err) {
      console.error("togglePin error:", err);
      return null;
    }
  },
};

export default messageService;
