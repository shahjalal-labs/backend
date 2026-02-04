import IORedis from "ioredis";

const redisClient = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),
  maxRetriesPerRequest: null,
});

// Basic error handling
redisClient.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

export default redisClient;
