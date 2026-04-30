import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../app.js";
import { connectToDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { initAuth } from "../lib/auth.js";

const run = async (): Promise<void> => {
  await connectToDatabase(env.mongoUri);
  const app = createApp(initAuth());

  try {
    const authResponse = await request(app)
      .get("/api/auth/ok")
      .set("Origin", env.clientOrigin);

    if (!authResponse.ok) {
      throw new Error(
        `Better Auth health check failed with status ${authResponse.status}`,
      );
    }

    if (
      authResponse.headers["access-control-allow-origin"] !== env.clientOrigin
    ) {
      throw new Error(
        "Better Auth did not return the expected CORS origin header.",
      );
    }

    if (authResponse.headers["access-control-allow-credentials"] !== "true") {
      throw new Error("Better Auth did not allow credentialed requests.");
    }

    const healthResponse = await request(app).get("/api/health");

    if (!healthResponse.ok) {
      throw new Error(
        `Health check failed with status ${healthResponse.status}`,
      );
    }

    const docsResponse = await request(app).get("/api-docs/");

    if (!docsResponse.ok) {
      throw new Error(
        `Swagger UI check failed with status ${docsResponse.status}`,
      );
    }

    console.info("Auth smoke test passed.");
    console.info(
      `CORS origin header: ${authResponse.headers["access-control-allow-origin"]}`,
    );
    console.info(
      `Credentials header: ${authResponse.headers["access-control-allow-credentials"]}`,
    );
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

void run();
