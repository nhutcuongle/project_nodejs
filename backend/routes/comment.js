import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { createComment, getCommentsByVideo, toggleLikeComment, deleteComment, updateComment } from "../controllers/commentController.js";

const router = express.Router();

router.post("/video/:videoId", authenticate, createComment);
router.get("/video/:videoId", getCommentsByVideo);
router.post("/:id/like", authenticate, toggleLikeComment);
router.put("/:id", authenticate, updateComment); // ✅ thêm route sửa
router.delete("/:id", authenticate, deleteComment);
export default router;
