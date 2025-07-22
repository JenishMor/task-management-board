import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/User.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;

    await user.save();
    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user already has a profile picture, delete it from Cloudinary
    if (user.profilePicture) {
      const publicId = user.profilePicture.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "task-manager/profile-pictures",
      width: 200,
      crop: "fill",
    });

    user.profilePicture = result.secure_url;
    await user.save();

    res.json({
      message: "Profile picture updated successfully",
      profilePicture: result.secure_url,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
