import express from "express";
import {
  getFilteredWords,
  addFilteredWord,
  deleteFilteredWord
} from "../controllers/filteredWordController.js";
import { authenticate, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, isAdmin, getFilteredWords);
router.post("/", authenticate, isAdmin, addFilteredWord);
router.delete("/:id", authenticate, isAdmin, deleteFilteredWord);

export default router;
