import express from "express";
import { updateProfile } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { changePassword } from "../controllers/userController.js";
import { getCurrentUser,getPublicUserInfo ,getPublicUserInfoByIdentifier} from "../controllers/userController.js";



const router = express.Router();

router.put("/update-profile", authenticate, updateProfile);


router.put("/change-password", authenticate, changePassword);
router.get("/me", authenticate, getCurrentUser);
router.get("/by-identifier/:identifier", getPublicUserInfoByIdentifier);
router.get("/:userId/public", authenticate, getPublicUserInfo);


export default router;
