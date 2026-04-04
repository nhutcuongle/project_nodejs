import * as commentService from "../services/commentService.js";

export const createComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    const populated = await commentService.createCommentLogic(videoId, userId, text, io);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCommentsByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const formatted = await commentService.getCommentsByVideoLogic(videoId);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const io = req.app.get("io");

    const result = await commentService.toggleLikeCommentLogic(id, userId, io);
    res.json({
      message: result.isLiked ? "Đã tym." : "Đã bỏ tym.",
      ...result
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const io = req.app.get("io");

    await commentService.deleteCommentLogic(id, userId, io);
    res.json({ message: "Xóa comment thành công", commentId: id });
  } catch (err) {
    res.status(err.message.includes("quyền") ? 403 : 404).json({ message: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    const updated = await commentService.updateCommentLogic(id, userId, text, io);
    res.json(updated);
  } catch (err) {
    res.status(err.message.includes("quyền") ? 403 : 404).json({ message: err.message });
  }
};
