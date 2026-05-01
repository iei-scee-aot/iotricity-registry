import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../app.js";
import {
  closeAuthDatabase,
  connectToAuthDatabase,
} from "../config/auth-db.js";
import { connectToDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { initAuth } from "../lib/auth.js";

const run = async (): Promise<void> => {
  await connectToDatabase(env.mongoUri);
  await connectToAuthDatabase(env.mongoUri);
  const app = createApp(initAuth());

  try {
    const healthResponse = await request(app).get("/api/health");

    if (!healthResponse.ok) {
      throw new Error(
        `Health check failed with status ${healthResponse.status}`,
      );
    }

    const healthData = healthResponse.body as {
      success?: boolean;
      message?: string;
      database?: string;
    };

    if (!healthData.success) {
      throw new Error("Health check did not return success=true.");
    }

    const docsResponse = await request(app).get("/api-docs/");

    if (!docsResponse.ok) {
      throw new Error(
        `Swagger UI check failed with status ${docsResponse.status}`,
      );
    }

    const authResponse = await request(app).get("/api/auth/ok");

    if (!authResponse.ok) {
      throw new Error(
        `Better Auth health check failed with status ${authResponse.status}`,
      );
    }

    console.info("Health check passed.");
    console.info(JSON.stringify(healthData, null, 2));
    console.info(`Swagger UI responded with status ${docsResponse.status}.`);
    console.info(`Better Auth responded with status ${authResponse.status}.`);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await closeAuthDatabase();
  }
};

void run();
