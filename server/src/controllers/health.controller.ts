import mongoose from "mongoose";
import { Request, Response } from "express";

const mongooseStates: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export const getHealth = (_req: Request, res: Response): void => {
  const dbState = mongooseStates[mongoose.connection.readyState] ?? "unknown";

  res.status(200).json({
    success: true,
    message: "Event registration API is healthy.",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbState,
  });
};
