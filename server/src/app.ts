import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";
import { swaggerSpec } from "./swagger.js";

type BetterAuthHandler = Parameters<typeof toNodeHandler>[0];

export const createApp = (auth: BetterAuthHandler) => {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );

  app.all("/api/auth/*splat", toNodeHandler(auth));
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      message: "Welcome to the Event Registration API.",
      docs: "/api-docs/",
      health: "/api/health",
      auth: "/api/auth/ok",
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return app;
};
