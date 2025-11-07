import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import getBuffer from "../utils/dataUri";
import { sql } from "../utils/db";
import { invalidateCacheJob } from "../utils/rabbitMQ";
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

  // Retry logic for Cloudinary upload with timeout handling
  let cloud;
  const maxRetries = 3;
  
  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        cloud = await cloudinary.uploader.upload(fileBuffer.content, {
          folder: "blogs",
          resource_type: "auto",
          quality: "auto",
          timeout: 120000, // 120 seconds timeout
          chunk_size: 6000000, // 6MB chunks for large files
        });
        break; // Success, exit retry loop
      } catch (cloudinaryError: any) {
        console.error(`Cloudinary upload error (attempt ${attempt}/${maxRetries}):`, cloudinaryError);
        
        // If it's a timeout error and we have retries left, wait and retry
        if (cloudinaryError?.http_code === 499 && attempt < maxRetries) {
          const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
          console.log(`Retrying upload in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // If it's not a timeout or we're out of retries, throw
        throw cloudinaryError;
      }
    }

    if (!cloud) {
      return res.status(500).json({
        message: "Failed to upload image after multiple attempts. Please try again later.",
      });
    }
  } catch (cloudinaryError: any) {
    console.error("Cloudinary upload error:", cloudinaryError);
    return res.status(500).json({
      message: cloudinaryError?.http_code === 499 
        ? "Upload timed out. Please try again with a smaller image or check your connection."
        : "Failed to upload image. Please try again.",
    });
  }

  const result =
    await sql`INSERT INTO blogs (title, description, image, blogcontent,category, author) VALUES (${title}, ${description},${cloud.secure_url},${blogcontent},${category},${req.user?._id}) RETURNING *`;

    await invalidateCacheJob(["blogs:*"]);
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

    // Retry logic for Cloudinary upload with timeout handling
    let cloud;
    const maxRetries = 3;
    
    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          cloud = await cloudinary.uploader.upload(fileBuffer.content, {
            folder: "blogs",
            resource_type: "auto",
            quality: "auto",
            timeout: 120000, // 120 seconds timeout
            chunk_size: 6000000, // 6MB chunks for large files
          });
          break; // Success, exit retry loop
        } catch (cloudinaryError: any) {
          console.error(`Cloudinary upload error (attempt ${attempt}/${maxRetries}):`, cloudinaryError);
          
          // If it's a timeout error and we have retries left, wait and retry
          if (cloudinaryError?.http_code === 499 && attempt < maxRetries) {
            const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
            console.log(`Retrying upload in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // If it's not a timeout or we're out of retries, throw
          throw cloudinaryError;
        }
      }

      if (!cloud) {
        return res.status(500).json({
          message: "Failed to upload image after multiple attempts. Please try again later.",
        });
      }
      
      imageURL = cloud.secure_url;
    } catch (cloudinaryError: any) {
      console.error("Cloudinary upload error:", cloudinaryError);
      return res.status(500).json({
        message: cloudinaryError?.http_code === 499 
          ? "Upload timed out. Please try again with a smaller image or check your connection."
          : "Failed to upload image. Please try again.",
      });
    }
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

    await invalidateCacheJob(["blogs:*",`blog:${id}`]);

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

  await invalidateCacheJob(["blogs:*",`blog:${id}`]);

  res.json({
    message: "Blog Deleted",
  });
});
