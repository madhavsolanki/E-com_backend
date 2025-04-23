import cloudinary from "../config/cloudinary.config.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// User can Only Update the firstName, lastName, username, phoneNumber only
export const updateProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the textual fields
    const updatableFields = [
      "firstName",
      "lastName",
      "username",
      "phoneNumber",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.log("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const updateProfilePictureController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Delete old profile picture if it's not the default
    if (
      user.profilePublicId &&
      !user.profilePublicId.includes("tllvnenyn76gk6zuuy8a")
    ) {
      await cloudinary.uploader.destroy(user.profilePublicId);
    }

    // Upload new image to cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "E-com Market/user_profile_images",
            public_id: `user_${user._id}_${Date.now()}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const uploadResult = await streamUpload(req.file.buffer);

    // Save new profile picture URL and publicId
    user.profilePicUrl = uploadResult.secure_url;
    user.profilePublicId = uploadResult.public_id;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicUrl: user.profilePicUrl,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile picture" });
  }
};

export const getMyProfileController = async (req, res) => {
  try {
    // req.user is populated by the isUserAuthenticated middleware
    const user = await User.findById(req.user._id)
      .select("-password") // Exclude sensitive fields
      .populate({
        path: "addressBook",
        model: "Address",
        options: { strictPopulate: false } // Makes it more fault-tolerant
      })
      .populate("defaultAddress");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get My Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

export const updatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword} = req.body;

    // 1. Validate Inputs
    if(!oldPassword || !newPassword || !confirmNewPassword){
      return res.status(400).json({
        success:false,
        message:"All fields are required",
      })
    }

    // 2. Check if the new password and confirm new password match
    if(newPassword !== confirmNewPassword){
      return res.status(400).json({
        success:false,
        message:"New password and confirm new password do not match",
      });
    }

    // 3. Check if the old password is correct
    const user = await User.findById(req.user._id);

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if(!isPasswordValid){
      return res.status(401).json({
        success:false,
        message:"Invalid old password",
      });
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success:true,
      message:"Password updated successfully",
    });

  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({
      success:false,
      message:"Failed to update password",
    });
  }
};

