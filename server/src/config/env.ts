import dotenv from "dotenv";

// Load environment variables from .env file into process.env
dotenv.config();

/**
 * Retrieves a required environment variable and trims whitespace.
 *
 * @param name - The name of the environment variable to retrieve.
 * @returns The value of the environment variable.
 * @throws Error if the variable is missing or empty.
 */
const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

// Default port to 4000 if not specified in environment
const port = Number(process.env.PORT ?? 4000);

/**
 * Validated environment configuration object.
 * Centralizes access to environment variables throughout the application.
 */
export const env = {
  port,
  mongoUri: getRequiredEnv("MONGO_URI"),
  betterAuthUrl: getRequiredEnv("BETTER_AUTH_URL"),
  betterAuthSecret: getRequiredEnv("BETTER_AUTH_SECRET"),
  clientOrigin: getRequiredEnv("CLIENT_ORIGIN"),
  googleClientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
  razorpayKeyId: getRequiredEnv("RAZORPAY_KEY_ID"),
  razorpayKeySecret: getRequiredEnv("RAZORPAY_KEY_SECRET"),
};
