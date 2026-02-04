//
import { Queue } from "bullmq";
import redisClient from "../../shared/redis";

export const emailQueue = new Queue("emails", {
  connection: redisClient,
});
