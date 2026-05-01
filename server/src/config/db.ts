import mongoose from "mongoose";

export const connectToDatabase = async (mongoUri: string): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.info("Mongoose MongoDB connected successfully.");
  } catch (error) {
    console.error("Mongoose MongoDB connection failed.", error);
    throw error;
  }
};
