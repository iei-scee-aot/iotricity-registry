import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { initAuth } from "./lib/auth.js";
import { createApp } from "./app.js";

const startServer = async (): Promise<void> => {
  await connectToDatabase(env.mongoUri);
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

void startServer();
