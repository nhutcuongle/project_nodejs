import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authMiddleware.js";

import { uploadVideo, getVideoFeed, likeVideo,deleteVideo  } from "../controllers/videoController.js";
import { videoStorage } from "../utils/cloudinary.js";


const upload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const router = express.Router();

router.post("/upload", authenticate, upload.single("video"), uploadVideo);
router.get("/feed", authenticate, getVideoFeed);
router.post("/:id/like", authenticate, likeVideo);
router.delete("/:id", authenticate, deleteVideo); 
export default router;
