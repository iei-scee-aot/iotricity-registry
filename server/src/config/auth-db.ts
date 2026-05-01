import { Db, MongoClient } from "mongodb";

/**
 * Singleton state for the Better Auth database connection.
 * Better Auth uses the native MongoDB driver directly rather than Mongoose.
 */
let authMongoClient: MongoClient | undefined;
let authDatabase: Db | undefined;
let authDatabasePromise: Promise<Db> | undefined;

/**
 * Connects to the MongoDB database specifically for Better Auth.
 * Uses a singleton pattern to ensure only one connection is established.
 * 
 * @param mongoUri - The MongoDB connection string.
 * @returns A Promise resolving to the MongoDB database instance.
 * @throws Error if the connection fails.
 */
export const connectToAuthDatabase = async (mongoUri: string): Promise<Db> => {
  // Return existing database instance if already connected
  if (authDatabase) {
    return authDatabase;
  }

  // If a connection attempt is already in progress, return its promise
  if (!authDatabasePromise) {
    authDatabasePromise = (async () => {
      const client = new MongoClient(mongoUri);

      try {
        await client.connect();
        authMongoClient = client;
        authDatabase = client.db();
        console.info("Better Auth MongoDB connected successfully.");
        return authDatabase;
      } catch (error) {
        // Reset the promise on failure so subsequent calls can retry
        authDatabasePromise = undefined;
        await client.close().catch(() => undefined);
        console.error("Better Auth MongoDB connection failed.", error);
        throw error;
      }
    })();
  }

  return authDatabasePromise;
};

/**
 * Retrieves the initialized Better Auth database instance.
 * 
 * @returns The MongoDB database instance.
 * @throws Error if the database hasn't been initialized yet.
 */
export const getAuthDatabase = (): Db => {
  if (!authDatabase) {
    throw new Error("Better Auth MongoDB has not been initialized.");
  }

  return authDatabase;
};

/**
 * Retrieves the initialized Better Auth MongoDB client.
 * 
 * @returns The MongoClient instance.
 * @throws Error if the client hasn't been initialized yet.
 */
export const getAuthMongoClient = (): MongoClient => {
  if (!authMongoClient) {
    throw new Error("Better Auth MongoDB client has not been initialized.");
  }

  return authMongoClient;
};

/**
 * Closes the Better Auth database connection and resets the singleton state.
 */
export const closeAuthDatabase = async (): Promise<void> => {
  if (!authMongoClient) {
    return;
  }

  await authMongoClient.close();
  authMongoClient = undefined;
  authDatabase = undefined;
  authDatabasePromise = undefined;
};
