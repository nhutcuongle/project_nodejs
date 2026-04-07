import * as messageService from "../services/messageService.js";


export const getMessages = async (req, res) => {
  try {
    const data = await messageService.getMessagesLogic(req.params.conversationId, req.user.id);
    res.json(data);
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
    const result = await messageService.markAsReadLogic(req.params.conversationId, req.user.id);
    res.json(result);
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
    const result = await messageService.deleteMessageLocalLogic(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa." });
  }
};

