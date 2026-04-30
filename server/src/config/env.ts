import dotenv from "dotenv";

dotenv.config();

const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const port = Number(process.env.PORT ?? 4000);

export const env = {
  port,
  mongoUri: getRequiredEnv("MONGO_URI"),
  betterAuthUrl: getRequiredEnv("BETTER_AUTH_URL"),
  betterAuthSecret: getRequiredEnv("BETTER_AUTH_SECRET"),
  clientOrigin: getRequiredEnv("CLIENT_ORIGIN"),
  googleClientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
};
