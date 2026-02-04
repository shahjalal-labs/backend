import express, { Application } from "express";
import cors from "cors";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import path from "path";
import { router } from "./app/routes";
import { bullBoardRouter } from "./jobs/bullBoard";
import basicAuth from "express-basic-auth";
import { entryMessage } from "./app/middlewares/entry";
import { notFound } from "./app/middlewares/notFound";
import helmet from "helmet";

const app: Application = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Route handler for root endpoint
app.get("/", entryMessage);
// Router setup
app.use("/api/v1", router);

app.use(
  "/bull",
  basicAuth({
    users: {
      admin: process.env.BULLBOARD_PASSWORD || "admin",
    },
    challenge: true,
  }),
  bullBoardRouter,
);

// app.use("/bull", bullBoardRouter); // No auth

// Global Error Handler
app.use(GlobalErrorHandler);

// not found handler
app.use(notFound);

export default app;
