import { app } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  await connectToDatabase(env.mongoUri);

  app.listen(env.port, () => {
    console.info(`Server is running on http://localhost:${env.port}`);
    console.info(`Swagger UI is available at http://localhost:${env.port}/api-docs/`);
  });
};

void startServer();
