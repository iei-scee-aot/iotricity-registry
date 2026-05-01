import mongoose from "mongoose";
import { connectToDatabase } from "./config/db.js";
import { closeAuthDatabase, connectToAuthDatabase } from "./config/auth-db.js";
import { env } from "./config/env.js";
import { initAuth } from "./lib/auth.js";
import { createApp } from "./app.js";

let isShuttingDown = false;

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.info(`Received ${signal}. Shutting down gracefully.`);

  await Promise.allSettled([
    mongoose.connection.readyState !== 0 ? mongoose.disconnect() : Promise.resolve(),
    closeAuthDatabase(),
  ]);

  process.exit(0);
};

const startServer = async (): Promise<void> => {
  await connectToDatabase(env.mongoUri);
  await connectToAuthDatabase(env.mongoUri);
  const auth = initAuth();
  const app = createApp(auth);

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

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();
