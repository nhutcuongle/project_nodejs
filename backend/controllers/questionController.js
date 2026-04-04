import Question from "../models/Question.js";
import * as questionService from "../services/questionService.js";

export const createQuestion = async (req, res) => {
  try {
    if (req.user.permissions?.canAsk === false) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị cấm." });
    }

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

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Không tìm thấy." });
    if (question.author.toString() !== req.user.id) return res.status(403).json({ message: "Không có quyền." });

    await questionService.cleanupQuestionData(question._id);
    res.json({ message: "Đã xóa câu hỏi." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa.", error: err.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalQuestions = await Question.countDocuments({ approved: true, isHidden: false });
    const questions = await Question.find({ approved: true, isHidden: false })
      .populate("author", "username avatar identifier")
      .populate("hashtags", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const questionsWithStats = await questionService.enrichQuestionsData(questions, userId);

    res.json({
      questions: questionsWithStats,
      pagination: { totalQuestions, totalPages: Math.ceil(totalQuestions / limit), currentPage: page }
    });
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

export const hideQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question || question.author.toString() !== req.user.id) return res.status(403).json({ message: "Lỗi quyền." });
    question.isHidden = true;
    await question.save();
    res.json({ message: "Đã ẩn." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi ẩn." });
  }
};

export const unhideQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question || question.author.toString() !== req.user.id) return res.status(403).json({ message: "Lỗi quyền." });
    question.isHidden = false;
    await question.save();
    res.json({ message: "Đã hiện." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hiện." });
  }
};

export const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user.id, approved: true, isHidden: false })
      .populate("author", "username avatar identifier")
      .populate("hashtags", "name")
      .sort({ createdAt: -1 });

    const enriched = await questionService.enrichQuestionsData(questions, req.user.id);
    res.json(enriched);
  } catch (err) {
     res.status(500).json({ message: "Lỗi server" });
  }
};

export const getHiddenQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user.id, isHidden: true })
      .populate("author", "username avatar identifier")
      .populate("hashtags", "name")
      .sort({ createdAt: -1 });

    const enriched = await questionService.enrichQuestionsData(questions, req.user.id);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const searchQuestions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const questions = await questionService.searchQuestionsInDb(req.query, userId);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tìm kiếm", error: err.message });
  }
};

export const getQuestionsByUser = async (req, res) => {
  try {
    const questions = await Question.find({ author: req.params.userId, approved: true, isHidden: false })
      .populate("author", "username avatar identifier")
      .populate("hashtags", "name")
      .sort({ createdAt: -1 });

    const enriched = await questionService.enrichQuestionsData(questions, req.user?.id);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
