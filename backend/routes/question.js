import express from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  hideQuestion,
  unhideQuestion,
  getMyQuestions,
  getHiddenQuestions,
  searchQuestions,
  getQuestionsByUser,
  deleteQuestion
} from "../controllers/questionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createQuestion);

// ❗ Đặt các route cụ thể lên TRÊN
router.get("/search", authenticate, searchQuestions);
router.get("/my", authenticate, getMyQuestions);
router.get("/hidden", authenticate, getHiddenQuestions);

// ➜ Route mới để lấy câu hỏi theo user
router.get("/user/:userId", authenticate, getQuestionsByUser);

// ✅ Route có tham số đặt SAU cùng để tránh override 
router.delete("/:id", authenticate, deleteQuestion);
router.get("/:id", getQuestionById);

// router.get("/", getAllQuestions);
router.get("/", authenticate, getAllQuestions);
router.put("/:id/hide", authenticate, hideQuestion);
router.put("/:id/unhide", authenticate, unhideQuestion);

export default router;
