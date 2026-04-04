import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createReply, getRepliesByComment,toggleLikeReply,deleteReply } from "../controllers/replyController.js";

const router = express.Router();

router.post("/:commentId", authenticate, createReply);
router.get("/:commentId", getRepliesByComment);
router.post("/:id/like", authenticate, toggleLikeReply);
router.delete("/:id", authenticate, deleteReply);
export default router;
