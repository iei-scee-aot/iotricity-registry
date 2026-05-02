import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";
import { teamMemberRouter } from "./routes/team-members.routes.js";
import { teamsRouter } from "./routes/teams.routes.js";
import { projectsRouter } from "./routes/projects.routes.js";
import { paymentRouter } from "./routes/payments.routes.js";
import { adminAuthRouter } from "./routes/admin-auth.routes.js";
import { swaggerSpec } from "./swagger.js";
import { connectToDatabase } from "./config/db.js";
import { connectToAuthDatabase } from "./config/auth-db.js";
import { initAuth } from "./lib/auth.js";

// Initialize database connections and authentication.
await connectToDatabase(env.mongoUri);
await connectToAuthDatabase(env.mongoUri);
const auth = initAuth();

type BetterAuthHandler = Parameters<typeof toNodeHandler>[0];

/**
 * Registers all API routes and documentation endpoints.
 *
 * @param app - The Express application instance.
 * @param authHandler - The Better Auth handler.
 */
const registerRoutes = (
  app: express.Application,
  authHandler: BetterAuthHandler,
) => {
  app.all("/api/auth/*splat", toNodeHandler(authHandler));

  app.get("/", (_req, res) => {
    res.json({
      message: "Welcome to the Event Registration API.",
      docs: "/api-docs/",
      health: "/api/health",
      auth: "/api/auth/ok",
      teamMembers: "/api/team-members",
      teams: "/api/teams",
      projects: "/api/projects",
    });
  });

  // API Route registrations
  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/health", healthRouter);
  app.use("/api/team-members", teamMemberRouter);
  app.use("/api/teams", teamsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/payments", paymentRouter);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

/**
 * Creates and configures the Express application.
 *
 * @param authHandler - The Better Auth handler instance.
 * @returns The configured Express application instance.
 */
export const createApp = (authHandler: BetterAuthHandler) => {
  const app = express();

  app.use(
    cors({
      origin: [env.clientOrigin, env.adminOrigin],
      credentials: true,
    }),
  );

  app.use(express.json());

  // Register all routes
  registerRoutes(app, authHandler);

  return app;
};

// Create the app instance
const app = createApp(auth);

// Export the app instance as the default export.
export default app;
