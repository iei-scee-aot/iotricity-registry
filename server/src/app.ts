import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { healthRouter } from "./routes/health.routes.js";
import { swaggerSpec } from "./swagger.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the Event Registration API.",
    docs: "/api-docs/",
    health: "/api/health",
  });
});

app.use("/api/health", healthRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
