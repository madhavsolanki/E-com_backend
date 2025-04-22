import express from "express";
import {
  loginController,
  registerController,
  sendEmailVerificationEmail,
  verifyCode,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/send-email", sendEmailVerificationEmail);
router.post("/verify-account", verifyCode);
router.post("/login", loginController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;
