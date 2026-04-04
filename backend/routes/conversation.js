import express from "express";
import {
  startConversation,
  getConversations,
  acceptRequest,
  rejectRequest,
  deleteConversationLocal,
} from "../controllers/conversationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, startConversation);
router.get("/", authenticate, getConversations);
router.post("/:id/accept", authenticate, acceptRequest);
router.post("/:id/reject", authenticate, rejectRequest);
router.delete("/:id", authenticate, deleteConversationLocal);
export default router;
