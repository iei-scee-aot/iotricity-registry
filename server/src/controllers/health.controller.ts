import mongoose from "mongoose";
import { Request, Response } from "express";

/**
 * Mapping of Mongoose connection states to human-readable strings.
 */
const mongooseStates: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

/**
 * Health check endpoint handler.
 * Provides information about the application's uptime, current time, and database connectivity.
 * 
 * @param _req - Express Request object (unused).
 * @param res - Express Response object.
 */
export const getHealth = (_req: Request, res: Response): void => {
  // Determine the current state of the Mongoose connection
  const dbState = mongooseStates[mongoose.connection.readyState] ?? "unknown";

  res.status(200).json({
    success: true,
    message: "Event registration API is healthy.",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbState,
  });
};
