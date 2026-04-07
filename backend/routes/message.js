import express from "express";
import {
  getMessages,
  markAsRead,
  sendMessage,
  recallMessage,
  deleteMessageLocal,
  editMessage,
} from "../controllers/messageController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, sendMessage);
router.get("/:conversationId", authenticate, getMessages);
router.post("/:conversationId/read", authenticate, markAsRead);
router.post("/:id/recall", authenticate, recallMessage);
router.post("/:id/delete", authenticate, deleteMessageLocal);
router.put("/:id", authenticate, editMessage);

export default router;
