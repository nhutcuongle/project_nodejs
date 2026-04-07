// backend/controllers/adminQuestionController.js

import * as questionService from "../services/questionService.js";

// Lấy tất cả câu hỏi cho admin
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await questionService.getAllQuestionsAdminLogic();

    res.json(questions);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách câu hỏi (admin):", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách câu hỏi" });
  }
};

// Cập nhật câu hỏi (nội dung hoặc ẩn/hiện)
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // { content, isHidden, images, ... }
    const updated = await questionService.updateQuestionAdminLogic(id, updates);
    res.json(updated);
  } catch (error) {
    if (error.message === "NOT_FOUND") return res.status(404).json({ error: "Không tìm thấy câu hỏi" });
    res.status(500).json({ error: "Lỗi khi cập nhật câu hỏi" });
  }
};

// Xóa câu hỏi (dùng service để xóa sạch data liên quan)
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await questionService.deleteQuestionAdminLogic(id);
    res.json({ message: "Đã xóa câu hỏi thành công cùng các dữ liệu liên quan" });
  } catch (error) {
    if (error.message === "NOT_FOUND") return res.status(404).json({ error: "Không tìm thấy câu hỏi" });
    res.status(500).json({ error: "Lỗi khi xóa câu hỏi" });
  }
};
