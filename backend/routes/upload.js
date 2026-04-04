import express from "express";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";
import { uploadImage } from "../controllers/uploadController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage });

router.post("/", authenticate, upload.array("images", 5), uploadImage);

export default router;
