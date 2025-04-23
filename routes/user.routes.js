import express from "express";
import { getMyProfileController, updatePasswordController, updateProfileController, updateProfilePictureController } from "../controllers/user.controller.js";
import isUserAuthenticated from "../middlewares/auth.middleware.js";
import { profileImageUpload } from "../config/multer.config.js";

const router = express.Router();

router.put("/update-profile", isUserAuthenticated, updateProfileController);

router.post('/update-profile-picture', isUserAuthenticated, profileImageUpload.single('profilePic'), updateProfilePictureController);

router.get("/me", isUserAuthenticated, getMyProfileController);

router.put("/change-password", isUserAuthenticated, updatePasswordController);





export default router;