import TryCatch from "../utils/TryCatch";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import getBuffer from "../utils/dataUri";
import { v2 as cloudinary } from "cloudinary";


export const loginUser = TryCatch(async (req,res) =>{
    console.log("hit controller");
    
    const {email,name,image} = req.body;

    // Validate required fields
    if(!email){
        return res.status(400).json({
            message: "Email is required"
        });
    }

    if(!name){
        return res.status(400).json({
            message: "Name is required"
        });
    }

    if(!image){
        return res.status(400).json({
            message: "Image is required"
        });
    }

    let user = await User.findOne({email});

    if(!user){
        user = await User.create({name,email,image});
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

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404).json({
          message: "No user with this id",
        });
        return;
      }
    
      res.json(user);
});

export const updateUser = TryCatch(async (req:AuthenticatedRequest,res) => {

    const {name,instagram,linkedin,bio,facebook} = req.body;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            name,
            instagram,
            facebook,
            linkedin,
            bio,
          },
          { new: true }
    );

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
        res.status(400).json({
          message: "No file to upload",
        });
        return;
      }
  
      const fileBuffer = getBuffer(file);
  
      if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
          message: "Failed to generate buffer",
        });
        return;
      }
      const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs",
      });
  
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          image: cloud.secure_url,
        },
        { new: true }
      );
  
      const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
        expiresIn: "5d",
      });
  
      res.json({
        message: "User Profile pic updated",
        token,
        user,
      });
    }
  );