import express from "express";
import {
  getStats,
  getQuestionsByTime,
  getUsersByTime,
  getUserRoleDistribution,
  getVotesByTime,
  getTopUsersByQuestions
} from "../controllers/statisticsController.js";

import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, isAdmin, getStats);
router.get("/questions-by-time", authenticate, isAdmin, getQuestionsByTime);
router.get("/users-by-time", authenticate, isAdmin, getUsersByTime);
router.get("/user-role-distribution", authenticate, isAdmin, getUserRoleDistribution);
router.get("/votes-by-time", authenticate, isAdmin, getVotesByTime);
router.get("/top-users-by-questions", authenticate, isAdmin, getTopUsersByQuestions);

export default router;
