import express from "express";
import {
  getAllHashtags,
  updateHashtag,
  deleteHashtag,
  searchHashtags,
  getQuestionsByHashtag,
  bulkDeleteHashtags,
} from "../controllers/adminHashtagController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js"; // ✅ sử dụng tên mới

const router = express.Router();

// 📄 Lấy tất cả hashtag
router.get("/", authenticate, isAdmin, getAllHashtags);

// 🔍 Tìm kiếm hashtag
router.get("/search", authenticate, isAdmin, searchHashtags);

// 📝 Cập nhật hashtag
router.put("/:id", authenticate, isAdmin, updateHashtag);



router.get("/:id/questions", authenticate, isAdmin, getQuestionsByHashtag);
// 🗑️ Xoá hàng loạt hashtag (ĐẶT TRƯỚC)
router.delete("/bulk-delete", authenticate, isAdmin, bulkDeleteHashtags);

// 🗑️ Xoá 1 hashtag
router.delete("/:id", authenticate, isAdmin, deleteHashtag);


export default router;
