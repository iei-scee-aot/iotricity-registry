import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getAuthDatabase, getAuthMongoClient } from "../config/auth-db.js";
import { env } from "../config/env.js";

/**
 * Creates and configures the Better Auth instance.
 * 
 * @returns An object containing the configured Better Auth handlers and logic.
 */
const createAuth = () =>
  betterAuth({
    baseURL: env.betterAuthUrl,
    secret: env.betterAuthSecret,
    trustedOrigins: [env.clientOrigin],
    // Configure MongoDB as the storage backend for authentication data
    database: mongodbAdapter(getAuthDatabase(), {
      client: getAuthMongoClient(),
      transaction: false, // Transactions are not supported in standard MongoDB clusters without replica sets
    }),
    socialProviders: {
      // Configure Google OAuth provider
      google: {
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
        prompt: "select_account",
      },
    },
  });

/**
 * Singleton instance of Better Auth.
 */
let authInstance: ReturnType<typeof createAuth> | undefined;

/**
 * Initializes and returns the Better Auth singleton instance.
 * 
 * @returns The initialized Better Auth instance.
 */
export const initAuth = () => {
  authInstance ??= createAuth();
  return authInstance;
};
