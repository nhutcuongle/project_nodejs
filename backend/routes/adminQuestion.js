import express from "express";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
} from "../controllers/adminQuestionController.js";

const router = express.Router();

router.get("/questions", authenticate, isAdmin, getAllQuestions);
router.patch("/questions/:id", authenticate, isAdmin, updateQuestion);
router.delete("/questions/:id", authenticate, isAdmin, deleteQuestion);

export default router;
