import express from "express";
import {
  sendGlobalNotification,
  getUserNotifications,
  markAllAsRead, // thêm dòng này
} from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Lấy thông báo cá nhân
router.get("/", authenticate, getUserNotifications);

// ✅ Gửi thông báo toàn cục
router.post("/global", authenticate, sendGlobalNotification);

// ✅ Đánh dấu tất cả là đã đọc
router.put("/mark-all-read", authenticate, markAllAsRead); // thêm dòng này

export default router;
