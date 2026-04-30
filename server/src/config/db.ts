import mongoose from "mongoose";

export const connectToDatabase = async (mongoUri: string): Promise<void> => {
  if (!mongoUri) {
    console.warn("MONGO_URI is not set. Starting API without a MongoDB connection.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.info("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed.", error);
  }
};
