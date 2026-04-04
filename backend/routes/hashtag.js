import express from "express";
import {
  getAllHashtags,
  searchHashtags,
  createHashtag,
  updateHashtag,
  deleteHashtag
} from "../controllers/hashtagController.js";

const router = express.Router();

router.get("/", getAllHashtags);
router.get("/search", searchHashtags);
router.post("/", createHashtag);
router.put("/:id", updateHashtag);
router.delete("/:id", deleteHashtag);

export default router;
