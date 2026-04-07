import * as replyService from "../services/replyService.js";
import { formatTime } from "../utils/formatTime.js";

export const createReply = async (req, res) => {
  try {
    const io = req.app.get("io");
    const reply = await replyService.createReplyLogic(
      req.params.commentId,
      req.user.id,
      req.body.text,
      req.body.replyTo,
      io
    );
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRepliesByComment = async (req, res) => {
  try {
    const replies = await replyService.getRepliesByCommentLogic(req.params.commentId);

    const formatted = replies.map(r => ({
      ...r.toObject(),
      timeAgo: formatTime(r.createdAt)
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleLikeReply = async (req, res) => {
  try {
    const io = req.app.get("io");
    const result = await replyService.toggleLikeReplyLogic(req.params.id, req.user.id, io);
    res.json({ message: "Xử lý like.", ...result });
  } catch (err) {
    res.status(500).json({ message: "Lỗi like." });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const io = req.app.get("io");
    await replyService.deleteReplyLogic(req.params.id, req.user.id, io);
    res.json({ message: "Đã xóa reply." });
  } catch (err) {
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ message: "Không có quyền." });
    res.status(500).json({ message: "Lỗi xóa." });
  }
};
