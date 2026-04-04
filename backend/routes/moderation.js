// routes/moderation.js
import express from "express";
import {
  getPendingItems,
  approveItem,
  deleteItem
} from "../controllers/moderationController.js";

import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";
import ModerationLog from "../models/ModerationLog.js";

const router = express.Router();

// Lấy danh sách các nội dung chưa duyệt
router.get("/pending", authenticate, isAdmin, getPendingItems);

// Duyệt nội dung
router.put("/approve", authenticate, isAdmin, approveItem);

// Xoá nội dung vi phạm
router.delete("/delete", authenticate, isAdmin, deleteItem);

// 🆕 Lấy lịch sử kiểm duyệt
router.get("/logs", authenticate, isAdmin, async (req, res) => {
  try {
    const logs = await ModerationLog.find()
      .populate("moderator", "username fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy logs", error: err.message });
  }
});

export default router;
