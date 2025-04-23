import express from "express";
import {
  loginController,
  registerController,
  sendEmailVerificationEmail,
  verifyCode,
  forgotPasswordController,
  resetPasswordController,
  logoutUserController,
} from "../controllers/auth.controller.js";
import isUserAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/send-email", sendEmailVerificationEmail);
router.post("/verify-account", verifyCode);
router.post("/login", loginController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/logout", isUserAuthenticated, logoutUserController);




export default router;
