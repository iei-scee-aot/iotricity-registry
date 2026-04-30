import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 4000);

export const env = {
  port,
  mongoUri: process.env.MONGO_URI ?? "",
};
