import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.routes.js";
import { aiRouter } from "./routes/ai.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api/ai", aiRouter);

  return app;
}
