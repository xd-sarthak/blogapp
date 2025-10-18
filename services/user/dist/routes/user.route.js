"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controller/user.controller");
const router = express_1.default.Router();
console.log("hit router.ts");
router.get("/me", auth_middleware_1.isAuth, user_controller_1.myProfile);
router.get("/user/:id", user_controller_1.getUserProfile);
router.post("/login", user_controller_1.loginUser);
router.post("/user/update", auth_middleware_1.isAuth, user_controller_1.updateUser);
exports.default = router;
