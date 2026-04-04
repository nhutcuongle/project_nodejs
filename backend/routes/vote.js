import express from "express";
import { vote } from "../controllers/voteController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, vote);

export default router;
