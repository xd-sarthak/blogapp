import express from "express";
import { addComment, getAllComment, getBlogs,getSavedBlog,getSingleBlog, saveBlogs } from "../controllers/blog.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/blogs/all",getBlogs);
router.get("/blogs/:id",getSingleBlog);
router.post("/comment/:id",isAuth,addComment);
router.get("/comment/:id",getAllComment);
router.delete("/comment/:commentid",isAuth,addComment);
router.post("/save/:blogid",isAuth,saveBlogs);
router.get("/blog/saved/all",isAuth,getSavedBlog);

export default router;