import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";

export const healthRouter = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API health
 *     description: Returns the API runtime status and MongoDB connection state.
 *     responses:
 *       200:
 *         description: API health details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Event registration API is healthy.
 *                 uptime:
 *                   type: number
 *                   example: 12.34
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: connected
 */
healthRouter.get("/", getHealth);
