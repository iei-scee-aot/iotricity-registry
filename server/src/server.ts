import mongoose from "mongoose";
import { connectToDatabase } from "./config/db.js";
import { closeAuthDatabase, connectToAuthDatabase } from "./config/auth-db.js";
import { env } from "./config/env.js";
import { initAuth } from "./lib/auth.js";
import { createApp } from "./app.js";

/**
 * Flag to track if the server is in the process of shutting down.
 * Prevents multiple shutdown sequences from running concurrently.
 */
let isShuttingDown = false;

/**
 * Gracefully shuts down the server by closing database connections.
 * 
 * @param signal - The signal that triggered the shutdown (e.g., SIGINT, SIGTERM)
 */
const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.info(`Received ${signal}. Shutting down gracefully.`);

  // Close all database connections concurrently
  await Promise.allSettled([
    mongoose.connection.readyState !== 0 ? mongoose.disconnect() : Promise.resolve(),
    closeAuthDatabase(),
  ]);

  process.exit(0);
};

/**
 * Initializes and starts the Express server.
 * Connects to MongoDB, sets up authentication, and begins listening for requests.
 */
const startServer = async (): Promise<void> => {
  // Connect to the primary application database
  await connectToDatabase(env.mongoUri);
  
  // Connect to the specific database used by Better Auth
  await connectToAuthDatabase(env.mongoUri);
  
  // Initialize the authentication instance
  const auth = initAuth();
  
  // Create the Express application instance
  const app = createApp(auth);

  // Start listening on the configured port
  app.listen(env.port, () => {
    console.info(`Server is running on http://localhost:${env.port}`);
    console.info(
      `Swagger UI is available at http://localhost:${env.port}/api-docs/`,
    );
    console.info(
      `Better Auth is available at ${env.betterAuthUrl}/api/auth/ok`,
    );
  });
};

/**
 * Register signal handlers for graceful shutdown on SIGINT and SIGTERM.
 */
process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

// Bootstrap the server
void startServer();
