import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getAuthDatabase, getAuthMongoClient } from "../config/auth-db.js";
import { env } from "../config/env.js";

const createAuth = () =>
  betterAuth({
    baseURL: env.betterAuthUrl,
    secret: env.betterAuthSecret,
    trustedOrigins: [env.clientOrigin],
    database: mongodbAdapter(getAuthDatabase(), {
      client: getAuthMongoClient(),
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
