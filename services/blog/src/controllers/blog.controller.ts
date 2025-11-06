import TryCatch from "../utils/TryCatch.js";
import { sql } from "../utils/db.js";
import { Request, Response } from "express";
import axios from "axios";
import { redisClient } from "../server.js";

export const getBlogs = TryCatch(async (req: Request, res: Response) => {
  const { searchQuery = "", category = "" } = req.query;

  const cacheKey = `blogs:${searchQuery}:${category}`;
  const cached = await redisClient.get(cacheKey);

  if(cached){
    console.log("serving from redis cache");
    res.json(JSON.parse(cached));
    return;
  }

  let blogs;

  if (searchQuery && category) {
    blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
      "%" + searchQuery + "%"
    } OR description ILIKE ${
      "%" + searchQuery + "%"
    }) AND category = ${category} ORDER BY create_at DESC`;
  } else if (searchQuery) {
    blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
      "%" + searchQuery + "%"
    } OR description ILIKE ${"%" + searchQuery + "%"}) ORDER BY create_at DESC`;
  } else if (category) {
    blogs =
      await sql`SELECT * FROM blogs WHERE category = ${category} ORDER BY create_at DESC`;
  } else {
    blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
  }

  console.log("serving from Database");

  await redisClient.set(cacheKey,JSON.stringify(blogs),{EX:3600});
  

  res.json({
    blogs,
  });
});

export const getSingleBlog = TryCatch(async (req: Request, res: Response) => {
    const {id} = req.params;

    const blogid = id;
    const cacheKey = `blog:${blogid}`;

    const cached = await redisClient.get(cacheKey);

    if(cached){
      console.log("serving single blog from redis cache");
      res.json(JSON.parse(cached));
      return;
    }

    const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

    if (blog.length === 0) {
        res.status(404).json({
          message: "no blog with this id",
        });
        return;
    }

    const {data} = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/user/${blog[0].author}`);

    const responseData = {blog: blog[0],author: data}

    await redisClient.set(cacheKey,JSON.stringify(responseData),{EX:3600});
    res.json({
        blog: blog[0],
        author: data
    })
   
});
