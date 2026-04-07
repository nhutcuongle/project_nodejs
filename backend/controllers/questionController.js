import * as questionService from "../services/questionService.js";

export const createQuestion = async (req, res) => {
  try {

    const { status, question, message } = await questionService.createQuestionLogic(
      req.body,
      req.user,
      req.app.get("io")
    );

    res.status(status).json({ message, question });
  } catch (err) {
    if (err.message === "CONTENT_BLOCKED") {
      return res.status(403).json({ message: "Nội dung vi phạm chính sách." });
    }
    res.status(500).json({ message: "Lỗi hệ thống.", error: err.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {

    const { status, question, message } = await questionService.updateQuestionLogic(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(status).json({ message, question });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ message: "Không có quyền." });
    if (err.message === "CONTENT_BLOCKED") return res.status(403).json({ message: "Nội dung vi phạm chính sách." });
    res.status(500).json({ message: "Lỗi hệ thống.", error: err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    await questionService.deleteQuestionLogic(req.params.id, req.user.id);
    res.json({ message: "Đã xóa câu hỏi." });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ message: "Không có quyền." });
    res.status(500).json({ message: "Lỗi xóa.", error: err.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { page, limit } = req.query;
    const result = await questionService.getAllQuestionsLogic(parseInt(page) || 1, parseInt(limit) || 10, userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu", error: err.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const questionData = await questionService.getQuestionFullData(req.params.id, userId);
    if (!questionData) return res.status(404).json({ message: "Không tìm thấy." });
    res.json(questionData);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


export const getMyQuestions = async (req, res) => {
  try {
    const enriched = await questionService.getQuestionsByFilterLogic({ author: req.user.id, approved: true }, req.user.id);
    res.json(enriched);
  } catch (err) {
     res.status(500).json({ message: "Lỗi server" });
  }
};



export const getQuestionsByUser = async (req, res) => {
  try {
    const enriched = await questionService.getQuestionsByFilterLogic({ author: req.params.userId, approved: true }, req.user?.id);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
