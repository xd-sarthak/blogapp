import express from "express";
import { isAuth } from "../middlewares/auth.middleware";
import uploadFile from "../middlewares/multer";
import { createBlog, updateBlogs, deleteBlogs } from "../controllers/blog.controller";

const router = express.Router();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.put("/blog/:id", isAuth, uploadFile, updateBlogs);
router.delete("/blog/:id", isAuth, deleteBlogs);

export default router;