import mongoose from "mongoose";

/**
 * Establishes a connection to MongoDB using Mongoose.
 * 
 * @param mongoUri - The MongoDB connection string.
 * @throws Error if the connection fails.
 */
export const connectToDatabase = async (mongoUri: string): Promise<void> => {
  try {
    // Attempt to connect to the database
    await mongoose.connect(mongoUri);
    console.info("Mongoose MongoDB connected successfully.");
  } catch (error) {
    console.error("Mongoose MongoDB connection failed.", error);
    throw error;
  }
};
