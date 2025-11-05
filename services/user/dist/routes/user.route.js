"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controller/user.controller");
const multer_2 = __importDefault(require("../middleware/multer"));
const router = express_1.default.Router();
router.get("/me", auth_middleware_1.isAuth, user_controller_1.myProfile);
router.get("/user/:id", user_controller_1.getUserProfile);
router.post("/login", user_controller_1.loginUser);
router.post("/user/update", auth_middleware_1.isAuth, user_controller_1.updateUser);
router.post("/user/update/pic", auth_middleware_1.isAuth, multer_2.default, (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: "File size too large. Maximum size is 5MB"
            });
        }
    }
    if (err) {
        return res.status(400).json({
            message: err.message
        });
    }
    next();
}, user_controller_1.updateProfilePic);
exports.default = router;
