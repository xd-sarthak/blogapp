"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const TryCatch_1 = __importDefault(require("../utils/TryCatch"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
exports.loginUser = (0, TryCatch_1.default)(async (req, res) => {
    const { email, name, image } = req.body;
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
