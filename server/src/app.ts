import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
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

/**
 * Initialize database connections and authentication.
 * Using top-level await (supported in Node.js 14.8+ and Vercel).
 */
await connectToDatabase(env.mongoUri);
await connectToAuthDatabase(env.mongoUri);
const auth = initAuth();

type BetterAuthHandler = Parameters<typeof toNodeHandler>[0];

/**
 * Creates and configures the Express application.
 *
 * @param authHandler - The Better Auth handler instance.
 * @returns The configured Express application instance.
 */
export const createApp = (authHandler: BetterAuthHandler) => {
  const app = express();

  /**
   * CORS configuration:
   * Enables cross-origin requests from the configured client origin.
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
  app.all("/api/auth/*splat", toNodeHandler(authHandler));

  // Body parsing middleware to handle JSON payloads
  app.use(express.json());

  /**
   * Root endpoint:
   * Provides basic information about the API and links to documentation.
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

  /**
   * Swagger UI registration for API documentation.
   * Redirect ensures that /api-docs always has a trailing slash,
   * which is required for Swagger UI to resolve its relative assets correctly.
   */
  app.use(
    "/api-docs",
    // (req: Request, res: Response, next: NextFunction) => {
    //   if (req.path === "" || req.path === "/") {
    //     res.redirect(301, "/api-docs/");
    //   } else {
    //     next();
    //   }
    // },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );

  return app;
};

// Create the app instance
const app = createApp(auth);

/**
 * Export the app instance as the default export.
 * Vercel's zero-config Express support detects this and handles routing automatically.
 */
export default app;
