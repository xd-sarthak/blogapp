import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient, RedisClientOptions } from "redis";
import blogRoutes from "./routes/blog.route.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

// ✅ Proper Redis client setup (TypeScript safe)
export const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 10000, // 10 seconds
    tls: process.env.REDIS_URL?.startsWith("rediss://") ? true : undefined, // enable TLS if Upstash/Redis Cloud
  } as RedisClientOptions["socket"], // 👈 ensures proper type matching
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err?.message || err);
});

redisClient
  .connect()
  .then(() => console.log("✅ Redis connected"))
  .catch((err) => console.error("❌ Redis connection failed:", err.message));

app.use("/api/v1", blogRoutes);

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
