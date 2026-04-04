import express from "express";
import {
  followUser,
  unfollowUser,
  getFollowStatus,
  getFriendsList,
  getFollowers,
  getFollowing,
  getPublicProfile,
  getOwnPublicProfile,
  getPublicProfileByIdentifier,
} from "../controllers/followController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/identifier/:identifier/public", getPublicProfileByIdentifier);
router.post("/:userId", authenticate, followUser);
router.delete("/:userId", authenticate, unfollowUser);
router.get("/status/:userId", authenticate, getFollowStatus);
router.get("/me/public", authenticate, getOwnPublicProfile);
// 👇 Thêm các route mới
router.get("/friends/:userId", authenticate, getFriendsList);
router.get("/followers/:userId", authenticate, getFollowers);
router.get("/following/:userId", authenticate, getFollowing);
router.get("/:userId/public", getPublicProfile);

export default router;
