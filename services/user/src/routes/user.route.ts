import express from "express";
import { isAuth } from "../middleware/auth.middleware";
import { getUserProfile, loginUser, myProfile, updateProfilePic, updateUser } from "../controller/user.controller";
import uploadFile from "../middleware/multer";

const router = express.Router();

console.log("hit router.ts");


router.get("/me",isAuth,myProfile);
router.get("/user/:id",getUserProfile);
router.post("/login",loginUser);
router.post("/user/update",isAuth,updateUser);
router.post("/user/update/pic", isAuth, uploadFile, updateProfilePic);

export default router;