import * as voteService from "../services/voteService.js";

export const vote = async (req, res) => {
  const { targetId, targetType, voteType } = req.body;
  const userId = req.user._id;
  const username = req.user.username;

  if (!["question", "answer"].includes(targetType) || !["up", "down"].includes(voteType)) {
    return res.status(400).json({ message: "Tham số không hợp lệ." });
  }

  try {
    const io = req.app.get("io");
    const result = await voteService.handleVote(userId, username, targetId, targetType, voteType, io);

    res.status(200).json({
      message: "Xử lý vote thành công",
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};
