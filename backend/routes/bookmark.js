import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  addBookmark,
  removeBookmark,
  getMyBookmarks,
  getBookmarksByUserId,
} from "../controllers/bookmarkController.js";

const router = express.Router();

// Lấy danh sách bookmark của mình (?type=Question hoặc ?type=Video)
router.get("/", authenticate, getMyBookmarks);

// Lưu bookmark
router.post("/save", authenticate, addBookmark);

// Bỏ lưu bookmark
router.post("/unsave", authenticate, removeBookmark);

// Lấy bookmark theo user (?type=Question hoặc ?type=Video)
router.get("/user/:userId", authenticate, getBookmarksByUserId);

export default router;
