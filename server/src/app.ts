import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";
import { teamMemberRouter } from "./routes/team-members.routes.js";
import { teamsRouter } from "./routes/teams.routes.js";
import { swaggerSpec } from "./swagger.js";

type BetterAuthHandler = Parameters<typeof toNodeHandler>[0];

/**
 * Creates and configures the Express application.
 *
 * @param auth - The Better Auth handler instance to be integrated into the app.
 * @returns The configured Express application instance.
 */
export const createApp = (auth: BetterAuthHandler) => {
  const app = express();

  /**
   * CORS configuration:
   * Enables cross-origin requests from the configured client origin
   * and allows credentials (cookies, headers) to be included.
   */
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );

  /**
   * Better Auth route handling:
   * Maps all requests under /api/auth/* to the Better Auth node handler.
   */
  app.all("/api/auth/*splat", toNodeHandler(auth));

  // Body parsing middleware to handle JSON payloads
  app.use(express.json());

  /**
   * Root endpoint:
   * Provides basic information about the API and links to documentation and other endpoints.
   */
  app.get("/", (_req, res) => {
    res.json({
      message: "Welcome to the Event Registration API.",
      docs: "/api-docs/",
      health: "/api/health",
      auth: "/api/auth/ok",
      teamMembers: "/api/team-members",
      teams: "/api/teams",
    });
  });

  // API Route registrations
  app.use("/api/health", healthRouter);
  app.use("/api/team-members", teamMemberRouter);
  app.use("/api/teams", teamsRouter);

  // Swagger UI registration for API documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return app;
};
