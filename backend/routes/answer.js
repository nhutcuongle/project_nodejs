import express from "express";
import { createAnswer, getAnswersByQuestion, updateAnswer, deleteAnswer } from "../controllers/answerController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createAnswer);
router.put("/:answerId", authenticate, updateAnswer);
router.delete("/:answerId", authenticate, deleteAnswer);

// ✅ Route GET: lấy tất cả câu trả lời đã được duyệt cho 1 câu hỏi
router.get("/question/:questionId", getAnswersByQuestion);

export default router;
