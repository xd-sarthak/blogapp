import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import getBuffer from "../utils/dataUri";
import { sql } from "../utils/db";
import TryCatch from "../utils/TryCatch";
import { v2 as cloudinary } from "cloudinary";

export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  if (!file) {
    res.status(400).json({
      message: "No file to upload",
    });
    return;
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    res.status(400).json({
      message: "Failed to generate buffer",
    });
    return;
  }

  const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  const result =
    await sql`INSERT INTO blogs (title, description, image, blogcontent,category, author) VALUES (${title}, ${description},${cloud.secure_url},${blogcontent},${category},${req.user?._id}) RETURNING *`;

  res.json({
    message: "Blog Created",
    blog: result[0],
  });
});

export const updateBlogs = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    res.status(404).json({
      message: "No blog with this id found",
    });
    return;
  }

  if (blog[0].author !== req.user?._id) {
    res.status(401).json({
      message: "You are not authorized to update this blog",
    });
    return;
  }

  let imageURL = blog[0].image;

  if (file) {
    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to generate buffer",
      });
      return;
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs",
      });
  
      imageURL = cloud.secure_url;
  }

  const updatedBlog = await sql`UPDATE blogs SET
    title = ${title || blog[0].title},
    description = ${description || blog[0].description},
    image= ${imageURL},
    blogcontent = ${blogcontent || blog[0].blogcontent},
    category = ${category || blog[0].category}

    WHERE id = ${id}
    RETURNING *
    `;

    res.json({
        message: "Blog Updated",
        blog: updatedBlog[0],
    });
});

export const deleteBlogs = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    res.status(404).json({
      message: "No blog with this id found",
    });
    return;
  }

  if (blog[0].author !== req.user?._id) {
    res.status(401).json({
      message: "You are not the author of this blog",
    });
    return;
  }

  await sql`DELETE FROM savedblogs WHERE blogid = ${req.params.id}`;
  await sql`DELETE FROM comments WHERE blogid = ${req.params.id}`;
  await sql`DELETE FROM blogs WHERE id = ${req.params.id}`;

  res.json({
    message: "Blog Deleted",
  });
});
