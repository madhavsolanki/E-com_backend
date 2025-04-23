import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isUserAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if(!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, Token is mmissing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if(!user){
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if(user.isBlocked){
      return res.status(401).json({
        success: false,
        message: "User is blocked"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({success:false, message: "Not Authorized, Invalid Token" });
  }
};

export default isUserAuthenticated;