import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.utils.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerController = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phoneNumber, password } =
      req.body;

    // 1. Check for existing user by email , username, or phgone Number
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists with provided email, username, or phone number",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user (password gets hashed by user model's pre-save hook)
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      password : hashedPassword,
    });

    await user.save();
    // 6. Send a success response
    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email using the OTP sent to your inbox.",
    });
  } catch (error) {
    console.error("Error in registerController:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export const sendEmailVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "email not found",
      });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving to DB
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    user.verificationCode = hashedOTP;
    await user.save();

    const subject = "Verify Your Email - E-Com Market";
    // Prepare HTML Email
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #4CAF50;">Verify Your Email</h2>
        <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
        <h3 style="background-color: #f0f0f0; padding: 10px; display: inline-block;">${otp}</h3>
        <p>This code is valid for a limited time. Do not share it with anyone.</p>
        <p>Best regards,<br/><strong>Your App Team</strong></p>
      </div>
    `;

    // Send Email
    await sendEmail(user.email, subject, htmlTemplate);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Send Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending email.",
    });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified." });
    }

    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one.",
      });
    }

    const isMatch = await bcrypt.compare(otp, user.verificationCode);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during email verification.",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is not verified. Please verify your email.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during login.",
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
       .status(400)
       .json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Genearte the 6 digit OTP
    const otp = Math.floor(100000 + Math.random() *  900000).toString();

    // Hash OTP  before saving the DB
    const hashedOTP = await crypto.createHash("sha256").update(otp).digest("hex");

    // save hashed OTP to user doc
    user.verificationCode = hashedOTP;
    await user.save();

    // 5. Send email
    const subject = "Reset Your Password - OTP Inside!";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Hey ${user.firstName},</h2>
        <p>You’ve requested to reset your password. Please use the OTP below to reset it:</p>
        <h1 style="color: #007bff;">${otp}</h1>
        <p>This OTP is valid for a limited time.</p>
        <br/>
        <p>If you didn’t request this, you can ignore this email.</p>
        <p>– Your App Team</p>
      </div>
    `;

    await sendEmail(user.email, subject, html);


    res.status(200).json({
      success: true,
      message: "OTP sent to your email for password reset.",
    });


  }catch(error){
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during forgot password.",
    });
  }
}

export const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword} = req.body; 

    if (!email ||!otp ||!password ||!confirmPassword) {
      return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match.",
      });
    }

    // 2. Check if the User exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check if the OTP is valid
    const hashedOTP = await crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOTP !== user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Update the user's password
    user.password = hashedPassword;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });

  } catch (error) {
    logger.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during reset password.",
    });
  }
}

export const logoutUserController = async ( req, res ) => {
  try {
    // Clear the token from cookies
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
} 

