import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { emailQueue } from "./queues/emailQueue";
import { notificationQueue } from "./queues/notificationQueue";

// Express adapter
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/bull");

// Create Bull Board
createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(notificationQueue)],
  serverAdapter: serverAdapter,
});

// Export router for your Express app
export const bullBoardRouter = serverAdapter.getRouter();
