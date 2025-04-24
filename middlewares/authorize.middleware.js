import User from "../models/user.model.js";


const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
      try {
        
        const user = await User.findById(req.user._id);

        if(!user){
          return res.status(404).json({
            success:false,
            message:"User not found"
          });
        }

        if(!allowedRoles.includes(user.role)){
          return res.status(403).json({
            success:false,
            message:"Access denied. Not authorized"
          });
        }

        next();

      } catch (error) {
        console.log("Authorization error: ", error);
        return res.status(500).json({
          success:false,
          message:"Authorization failed"
        });
      }
  }
};

export default authorizeRoles;