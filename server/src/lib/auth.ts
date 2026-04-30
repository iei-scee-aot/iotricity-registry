import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { env } from "../config/env.js";

const getDatabase = () => {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error("MongoDB connection has not been initialized for Better Auth.");
  }

  return database;
};

const createAuth = () =>
  betterAuth({
    baseURL: env.betterAuthUrl,
    secret: env.betterAuthSecret,
    trustedOrigins: [env.clientOrigin],
    database: mongodbAdapter(getDatabase(), {
      client: mongoose.connection.getClient(),
      transaction: false,
    }),
    socialProviders: {
      google: {
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
        prompt: "select_account",
      },
    },
  });

let authInstance: ReturnType<typeof createAuth> | undefined;

export const initAuth = () => {
  authInstance ??= createAuth();
  return authInstance;
};
