import connectDB from "./utils/db";
import dotenv from "dotenv";
import express from "express";
import {app} from "./index";
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


connectDB()
.then( () => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`server is running at port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGODB connection failed" , err);
});




