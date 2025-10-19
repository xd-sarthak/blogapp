import express from "express";
import multer from "multer";
import { isAuth } from "../middleware/auth.middleware";
import { getUserProfile, loginUser, myProfile, updateProfilePic, updateUser } from "../controller/user.controller";
import uploadFile from "../middleware/multer";

const router = express.Router();

router.get("/me",isAuth,myProfile);
router.get("/user/:id",getUserProfile);
router.post("/login",loginUser);
router.post("/user/update",isAuth,updateUser);
router.post("/user/update/pic", isAuth, uploadFile, (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
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
}, updateProfilePic);

export default router;