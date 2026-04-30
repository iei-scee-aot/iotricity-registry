import mongoose from "mongoose";

export const connectToDatabase = async (mongoUri: string): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.info("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed.", error);
    throw error;
  }
};
