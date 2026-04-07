import express from "express";
import {
  createQuestion,
  updateQuestion,
  getAllQuestions,
  getQuestionById,
  getMyQuestions,
  getQuestionsByUser,
  deleteQuestion
} from "../controllers/questionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createQuestion);
router.put("/:id", authenticate, updateQuestion);

// ❗ Đặt các route cụ thể lên TRÊN
router.get("/my", authenticate, getMyQuestions);

// ➜ Route mới để lấy câu hỏi theo user
router.get("/user/:userId", authenticate, getQuestionsByUser);

// ✅ Route có tham số đặt SAU cùng để tránh override 
router.delete("/:id", authenticate, deleteQuestion);
router.get("/:id", getQuestionById);

// router.get("/", getAllQuestions);
router.get("/", authenticate, getAllQuestions);

export default router;
