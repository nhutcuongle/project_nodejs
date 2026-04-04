import * as conversationService from "../services/conversationService.js";

export const startConversation = async (req, res) => {
  try {
    const result = await conversationService.createOrSendMessage({
      senderId: req.user.id,
      recipientId: req.body.recipientId,
      text: req.body.text,
      io: req.app.get("io")
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khởi tạo hội thoại." });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await conversationService.getUserConversations({
      userId: req.user.id,
      box: req.query.box || "main"
    });
    res.json({ conversations, friends: [] });
  } catch (err) {
    res.status(500).json({ message: "Lỗi danh sách hội thoại." });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const convo = await conversationService.acceptConversationRequest({
      conversationId: req.params.id,
      userId: req.user.id,
      io: req.app.get("io")
    });
    if (!convo) return res.status(403).json({ message: "Từ chối." });
    res.json({ message: "Đã chấp nhận.", conversation: convo });
  } catch (err) {
    res.status(500).json({ message: "Lỗi chấp nhận." });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const convo = await conversationService.rejectConversationRequest({
      conversationId: req.params.id,
      userId: req.user.id,
      io: req.app.get("io")
    });
    if (!convo) return res.status(403).json({ message: "Từ chối." });
    res.json({ message: "Đã từ chối." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi từ chối." });
  }
};

export const deleteConversationLocal = async (req, res) => {
  try {
    await conversationService.deleteConversation({ conversationId: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

