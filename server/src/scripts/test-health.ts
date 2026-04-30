import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app.js";
import { connectToDatabase } from "../config/db.js";
import { env } from "../config/env.js";

const run = async (): Promise<void> => {
  await connectToDatabase(env.mongoUri);

  try {
    const healthResponse = await request(app).get("/api/health");

    if (!healthResponse.ok) {
      throw new Error(`Health check failed with status ${healthResponse.status}`);
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
      throw new Error(`Swagger UI check failed with status ${docsResponse.status}`);
    }

    console.info("Health check passed.");
    console.info(JSON.stringify(healthData, null, 2));
    console.info(`Swagger UI responded with status ${docsResponse.status}.`);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

void run();
