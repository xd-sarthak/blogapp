"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePic = exports.updateUser = exports.getUserProfile = exports.myProfile = exports.loginUser = void 0;
const TryCatch_1 = __importDefault(require("../utils/TryCatch"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dataUri_1 = __importDefault(require("../utils/dataUri"));
const cloudinary_1 = require("cloudinary");
exports.loginUser = (0, TryCatch_1.default)(async (req, res) => {
    console.log("hit controller");
    const { email, name, image } = req.body;
    // Validate required fields
    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }
    if (!name) {
        return res.status(400).json({
            message: "Name is required"
        });
    }
    if (!image) {
        return res.status(400).json({
            message: "Image is required"
        });
    }
    let user = await User_1.default.findOne({ email });
    if (!user) {
        user = await User_1.default.create({ name, email, image });
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
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        res.status(404).json({
            message: "No user with this id",
        });
        return;
    }
    res.json(user);
});
exports.updateUser = (0, TryCatch_1.default)(async (req, res) => {
    const { name, instagram, linkedin, bio, facebook } = req.body;
    const user = await User_1.default.findByIdAndUpdate(req.user?._id, {
        name,
        instagram,
        facebook,
        linkedin,
        bio,
    }, { new: true });
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
        res.status(400).json({
            message: "No file to upload",
        });
        return;
    }
    const fileBuffer = (0, dataUri_1.default)(file);
    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to generate buffer",
        });
        return;
    }
    const cloud = await cloudinary_1.v2.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });
    const user = await User_1.default.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url,
    }, { new: true });
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "5d",
    });
    res.json({
        message: "User Profile pic updated",
        token,
        user,
    });
});
