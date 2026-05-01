import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import request from "supertest";
import { createApp } from "../app.js";
import {
  closeAuthDatabase,
  connectToAuthDatabase,
  getAuthDatabase,
} from "../config/auth-db.js";
import { connectToDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { initAuth } from "../lib/auth.js";

type AuthAccountDocument = {
  accountId: string;
  providerId: string;
  userId: string;
};

type AuthUserDocument = {
  email: string;
};

const run = async (): Promise<void> => {
  await connectToDatabase(env.mongoUri);
  await connectToAuthDatabase(env.mongoUri);
  const app = createApp(initAuth());

  try {
    const authDatabase = getAuthDatabase();
    const pingResult = await authDatabase.command({ ping: 1 });

    if (pingResult.ok !== 1) {
      throw new Error("Better Auth MongoDB ping failed.");
    }

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

    const auth = initAuth();
    const authContext = await auth.$context;
    const existingAccount = await authDatabase
      .collection<AuthAccountDocument>("account")
      .findOne({});

    if (existingAccount) {
      const existingUser = await authDatabase
        .collection<AuthUserDocument>("user")
        .findOne({
          _id: new ObjectId(existingAccount.userId),
        });

      if (!existingUser?.email) {
        throw new Error("Unable to load the Better Auth user for diagnostics.");
      }

      const resolvedOAuthUser = await authContext.internalAdapter.findOAuthUser(
        existingUser.email,
        existingAccount.accountId,
        existingAccount.providerId,
      );

      if (!resolvedOAuthUser?.linkedAccount?.id) {
        throw new Error("Better Auth failed to resolve an existing OAuth account.");
      }

      console.info(
        `Resolved OAuth account ${existingAccount.providerId}:${existingAccount.accountId} for ${existingUser.email}.`,
      );
    } else {
      console.info("No existing OAuth account found. Skipping adapter diagnostic.");
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

    await closeAuthDatabase();
  }
};

void run();
