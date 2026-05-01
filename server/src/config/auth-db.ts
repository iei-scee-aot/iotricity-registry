import { Db, MongoClient } from "mongodb";

let authMongoClient: MongoClient | undefined;
let authDatabase: Db | undefined;
let authDatabasePromise: Promise<Db> | undefined;

export const connectToAuthDatabase = async (mongoUri: string): Promise<Db> => {
  if (authDatabase) {
    return authDatabase;
  }

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
        authDatabasePromise = undefined;
        await client.close().catch(() => undefined);
        console.error("Better Auth MongoDB connection failed.", error);
        throw error;
      }
    })();
  }

  return authDatabasePromise;
};

export const getAuthDatabase = (): Db => {
  if (!authDatabase) {
    throw new Error("Better Auth MongoDB has not been initialized.");
  }

  return authDatabase;
};

export const getAuthMongoClient = (): MongoClient => {
  if (!authMongoClient) {
    throw new Error("Better Auth MongoDB client has not been initialized.");
  }

  return authMongoClient;
};

export const closeAuthDatabase = async (): Promise<void> => {
  if (!authMongoClient) {
    return;
  }

  await authMongoClient.close();
  authMongoClient = undefined;
  authDatabase = undefined;
  authDatabasePromise = undefined;
};
