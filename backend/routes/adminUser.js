// routes/admin/user.routes.js
import express from "express";
import {
  getAllUsers,
  toggleDisableUser,
  deleteUser,
  setAdminRole,
  toggleCanAnswer,
  toggleCanAsk,
} from "../controllers/adminUserController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lấy tất cả người dùng
router.get("/", authenticate, isAdmin, getAllUsers);

// Vô hiệu hóa hoặc kích hoạt người dùng
router.put("/:id/toggle-disable", authenticate, isAdmin, toggleDisableUser);

// Xóa người dùng
router.delete("/:id", authenticate, isAdmin, deleteUser);

router.patch("/:id/set-admin", authenticate, isAdmin, setAdminRole);
router.patch("/:id/toggle-ask", authenticate, isAdmin, toggleCanAsk);
router.patch("/:id/toggle-answer", authenticate, isAdmin, toggleCanAnswer);
export default router;
