"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePic = exports.updateUser = exports.getUserProfile = exports.myProfile = exports.loginUser = void 0;
const TryCatch_1 = __importDefault(require("../utils/TryCatch"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const dataUri_1 = __importDefault(require("../utils/dataUri"));
const cloudinary_1 = require("cloudinary");
exports.loginUser = (0, TryCatch_1.default)(async (req, res) => {
    const { email, name, image } = req.body;
    // Validate required fields
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        return res.status(400).json({
            message: "Valid email is required"
        });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            message: "Valid name is required"
        });
    }
    if (!image || typeof image !== 'string' || image.trim().length === 0) {
        return res.status(400).json({
            message: "Valid image URL is required"
        });
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }
    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    const sanitizedImage = image.trim();
    let user = await User_1.default.findOne({ email: sanitizedEmail });
    if (!user) {
        user = await User_1.default.create({
            name: sanitizedName,
            email: sanitizedEmail,
            image: sanitizedImage
        });
    }
    else {
        // Update user info if they already exist (in case of profile changes)
        user = await User_1.default.findByIdAndUpdate(user._id, {
            name: sanitizedName,
            image: sanitizedImage
        }, { new: true });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "5d"
    });
    res.status(200).json({
        message: "Login Success",
        token,
        user
    });
});
exports.myProfile = (0, TryCatch_1.default)(async (req, res) => {
    const user = req.user;
    res.json(user);
});
exports.getUserProfile = (0, TryCatch_1.default)(async (req, res) => {
    // Validate ObjectId format
    if (!req.params.id || !mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: "Invalid user ID format"
        });
    }
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            message: "No user with this id",
        });
    }
    res.json(user);
});
exports.updateUser = (0, TryCatch_1.default)(async (req, res) => {
    const { name, instagram, linkedin, bio, facebook } = req.body;
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
    const user = await User_1.default.findByIdAndUpdate(req.user?._id, {
        ...(name && { name: name.trim() }),
        ...(instagram && { instagram: instagram.trim() }),
        ...(facebook && { facebook: facebook.trim() }),
        ...(linkedin && { linkedin: linkedin.trim() }),
        ...(bio && { bio: bio.trim() }),
    }, { new: true, runValidators: true });
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "5d",
    });
    res.json({
        message: "User Updated",
        token,
        user,
    });
});
exports.updateProfilePic = (0, TryCatch_1.default)(async (req, res) => {
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
    const fileBuffer = (0, dataUri_1.default)(file);
    if (!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({
            message: "Failed to generate buffer",
        });
    }
    // Retry logic for Cloudinary upload
    let cloud;
    const maxRetries = 3;
    try {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                cloud = await cloudinary_1.v2.uploader.upload(fileBuffer.content, {
                    folder: "blogs",
                    resource_type: "auto",
                    quality: "auto",
                    timeout: 120000, // 120 seconds timeout
                    chunk_size: 6000000, // 6MB chunks for large files
                });
                break; // Success, exit retry loop
            }
            catch (cloudinaryError) {
                console.error(`Cloudinary upload error (attempt ${attempt}/${maxRetries}):`, cloudinaryError);
                // If it's a timeout error and we have retries left, wait and retry
                if (cloudinaryError?.http_code === 499 && attempt < maxRetries) {
                    const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
                    console.log(`Retrying upload in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
                // If it's not a timeout or we're out of retries, throw
                throw cloudinaryError;
            }
        }
        if (!cloud) {
            return res.status(500).json({
                message: "Failed to upload image after multiple attempts. Please try again later.",
            });
        }
    }
    catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
            message: cloudinaryError?.http_code === 499
                ? "Upload timed out. Please try again with a smaller image or check your connection."
                : "Failed to upload image. Please try again.",
        });
    }
    const user = await User_1.default.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url,
    }, { new: true });
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "5d",
    });
    res.json({
        message: "User Profile pic updated",
        token,
        user,
    });
});
