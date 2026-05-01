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
import { swaggerSpec } from "./swagger.js";
import { connectToDatabase } from "./config/db.js";
import { connectToAuthDatabase } from "./config/auth-db.js";
import { initAuth } from "./lib/auth.js";

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
      projects: "/api/projects",
    });
  });

  // API Route registrations
  app.use("/api/health", healthRouter);
  app.use("/api/team-members", teamMemberRouter);
  app.use("/api/teams", teamsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/payments", paymentRouter);

  // Swagger UI registration for API documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return app;
};

// REMOVE BELOW CODE IF IT DOESN'T WORK

/**
 * Default export for Vercel deployment.
 * Handles lazy initialization of database connections and authentication
 * to ensure the app is ready before processing the first request.
 */
let handler: ReturnType<typeof createApp>;

export default async (req: any, res: any) => {
  if (!handler) {
    // Ensure all database connections are established
    await connectToDatabase(env.mongoUri);
    await connectToAuthDatabase(env.mongoUri);

    // Initialize auth and create the express app
    const auth = initAuth();
    handler = createApp(auth);
  }

  // Delegate the request to the express app handler
  return handler(req, res);
};
