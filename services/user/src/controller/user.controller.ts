import TryCatch from "../utils/TryCatch";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import getBuffer from "../utils/dataUri";
import { v2 as cloudinary } from "cloudinary";


export const loginUser = TryCatch(async (req,res) =>{
    const {email,name,image} = req.body;

    // Validate required fields
    if(!email || typeof email !== 'string' || email.trim().length === 0){
        return res.status(400).json({
            message: "Valid email is required"
        });
    }

    if(!name || typeof name !== 'string' || name.trim().length === 0){
        return res.status(400).json({
            message: "Valid name is required"
        });
    }

    if(!image || typeof image !== 'string' || image.trim().length === 0){
        return res.status(400).json({
            message: "Valid image URL is required"
        });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email.trim())){
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    const sanitizedImage = image.trim();

    let user = await User.findOne({email: sanitizedEmail});

    if(!user){
        user = await User.create({
            name: sanitizedName,
            email: sanitizedEmail,
            image: sanitizedImage
        });
    } else {
        // Update user info if they already exist (in case of profile changes)
        user = await User.findByIdAndUpdate(
            user._id,
            {
                name: sanitizedName,
                image: sanitizedImage
            },
            { new: true }
        );
    }

    const token = jwt.sign({user},process.env.JWT_SECRET as string,{
        expiresIn:"5d"
    });

    res.status(200).json({
        message: "Login Success",
        token,
        user
    });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest,res) =>{
    const user = req.user;
    res.json(user);
});

export const getUserProfile = TryCatch(async (req,res) => {
    // Validate ObjectId format
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: "Invalid user ID format"
        });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
          message: "No user with this id",
        });
      }
    
      res.json(user);
});

export const updateUser = TryCatch(async (req:AuthenticatedRequest,res) => {
    const {name,instagram,linkedin,bio,facebook} = req.body;

    // Validate that at least one field is provided
    if (!name && !instagram && !linkedin && !bio && !facebook) {
        return res.status(400).json({
            message: "At least one field must be provided for update"
        });
    }

    // Validate name if provided
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({
            message: "Name must be a non-empty string"
        });
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            ...(name && { name: name.trim() }),
            ...(instagram && { instagram: instagram.trim() }),
            ...(facebook && { facebook: facebook.trim() }),
            ...(linkedin && { linkedin: linkedin.trim() }),
            ...(bio && { bio: bio.trim() }),
          },
          { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
        expiresIn: "5d",
      });
    
      res.json({
        message: "User Updated",
        token,
        user,
      });
});

export const updateProfilePic = TryCatch(
    async (req: AuthenticatedRequest, res) => {
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({
          message: "No file to upload",
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed",
        });
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return res.status(400).json({
          message: "File size too large. Maximum size is 5MB",
        });
      }
  
      const fileBuffer = getBuffer(file);
  
      if (!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({
          message: "Failed to generate buffer",
        });
      }

      try {
        const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
          folder: "blogs",
          resource_type: "auto",
          quality: "auto",
        });
    
        const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
            image: cloud.secure_url,
          },
          { new: true }
        );

        if (!user) {
          return res.status(404).json({
            message: "User not found"
          });
        }
    
        const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
          expiresIn: "5d",
        });
    
        res.json({
          message: "User Profile pic updated",
          token,
          user,
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          message: "Failed to upload image. Please try again.",
        });
      }
    }
  );