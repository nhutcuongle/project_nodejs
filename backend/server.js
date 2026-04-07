import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import { authenticate, isAdmin } from "./middlewares/authMiddleware.js";
import questionRoutes from "./routes/question.js";
import answerRoutes from "./routes/answer.js";
import voteRoutes from "./routes/vote.js";
import uploadRoutes from "./routes/upload.js";
import moderationRoutes from "./routes/moderation.js";
import filteredWordRoutes from "./routes/filteredWords.js";
import adminQuestionRoutes from "./routes/adminQuestion.js";
import adminUserRoutes from "./routes/adminUser.js";
import userRoutes from "./routes/user.js";
import followRoutes from "./routes/follow.js";
import videoRoutes from "./routes/video.js";
import conversationRoutes from "./routes/conversation.js";
import messageRoutes from "./routes/message.js";



// 🆕 import comment & reply routes
import commentRoutes from "./routes/comment.js";
import replyRoutes from "./routes/reply.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Gắn socket vào app để controller có thể emit event
app.set("io", io);

// ==============================
// ROUTES
// ==============================
app.use("/api/auth", authRoutes);
app.use("/api/protected", authenticate, (req, res) => {
  res.json({ message: `Xin chào ${req.user.role}`, id: req.user.id });
});
app.use("/api/admin-only", authenticate, isAdmin, (req, res) => {
  res.json({ message: "Bạn là admin!" });
});

app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/filtered-words", filteredWordRoutes);
app.use("/api/admin", adminQuestionRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/user", userRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
// 🆕 routes bình luận & phản hồi
app.use("/api/comments", commentRoutes);
app.use("/api/replies", replyRoutes);

// Static video files
app.use("/uploads/videos", express.static("uploads/videos"));

// ==============================
// SOCKET.IO
// ==============================
io.on("connection", (socket) => {
 

  // --- ROOM USER ---
  socket.on("join", (userId) => {
    socket.join(userId);
   
  });

  // --- ROOM VIDEO ---
  socket.on("join_video", (videoId) => {
    socket.join(`video_${videoId}`);
    
  });

  socket.on("leave_video", (videoId) => {
    socket.leave(`video_${videoId}`);
  
  });

  // --- ROOM QUESTION ---
  socket.on("join_question", (questionId) => {
    socket.join(questionId);
  
  });

  socket.on("leave_question", (questionId) => {
    socket.leave(questionId);

  });

  // 🆕 --- COMMENT & REPLY REALTIME ---
  // (Đã chuyển vào service để tránh duplicate emit)

  socket.on("disconnect", () => {
   
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () =>
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
