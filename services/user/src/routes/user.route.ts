import express from "express";
import { isAuth } from "../middleware/auth.middleware";
import { getUserProfile, loginUser, myProfile, updateUser } from "../controller/user.controller";

const router = express.Router();

console.log("hit router.ts");


router.get("/me",isAuth,myProfile);
router.get("/user/:id",getUserProfile);
router.post("/login",loginUser);
router.post("/user/update",isAuth,updateUser);


export default router;