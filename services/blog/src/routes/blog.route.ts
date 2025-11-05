import express from "express";
import { getBlogs,getSingleBlog } from "../controllers/blog.controller.js";

const router = express.Router();

router.get("/blogs/all",getBlogs);
router.get("/blogs/:id",getSingleBlog);

export default router;