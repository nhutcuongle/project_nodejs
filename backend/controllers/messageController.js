import * as messageService from "../services/messageService.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await messageService.getMessagesLogic(req.params.conversationId, req.user.id);
    const conversation = await Conversation.findById(req.params.conversationId); // For status
    res.json({ messages, status: conversation?.status });
  } catch (err) {
    res.status(err.message === "NOT_FOUND" ? 404 : 500).json({ message: "Lỗi tải tin nhắn." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const io = req.app.get("io");
    const result = await messageService.sendMessageLogic({
      senderId: req.user.id,
      conversationId: req.body.conversationId,
      recipientId: req.body.recipientId,
      text: req.body.text,
      io
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi gửi tin nhắn." });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, status: { $ne: "read" } },
      { $set: { status: "read" } }
    );
    await Conversation.updateOne(
      { _id: conversationId, "unreadCounts.user": userId },
      { $set: { "unreadCounts.$.count": 0 } }
    );
    res.json({ message: "Đã đọc." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật." });
  }
};

export const recallMessage = async (req, res) => {
  try {
    await messageService.recallMessageLogic(req.params.id, req.user.id, req.app.get("io"));
    res.json({ success: true });
  } catch (err) {
    res.status(err.message === "UNAUTHORIZED" ? 403 : 500).json({ message: "Lỗi thu hồi." });
  }
};

export const editMessage = async (req, res) => {
  try {
    const result = await messageService.editMessageLogic(req.params.id, req.user.id, req.body.text, req.app.get("io"));
    res.json({ success: true, message: result });
  } catch (err) {
    res.status(500).json({ message: "Lỗi chỉnh sửa." });
  }
};

export const deleteMessageLocal = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Không tìm thấy." });
    if (!message.deletedFor.includes(req.user.id)) {
      message.deletedFor.push(req.user.id);
      await message.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa." });
  }
};

export const togglePinMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Không tìm thấy." });
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation.participants.some(p => p.toString() === req.user.id))
      return res.status(403).json({ message: "Từ chối." });

    message.isPinned = !message.isPinned;
    await message.save();
    req.app.get("io").to(message.conversation.toString()).emit("message_pinned", { 
      messageId: message._id, isPinned: message.isPinned 
    });
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ message: "Lỗi ghim." });
  }
};
