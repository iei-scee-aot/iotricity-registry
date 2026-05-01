import { Router } from "express";
import {
  createTeam,
  getAllTeams,
  getTeamBySecret,
  updateTeamBySecret,
} from "../controllers/teams.controller.js";

export const teamsRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - teamName
 *         - teamSecret
 *         - project
 *         - teamLeader
 *       properties:
 *         teamName:
 *           type: string
 *         teamSecret:
 *           type: string
 *         registrationStatus:
 *           type: string
 *           enum: [UNREGISTERED, REGISTERED, PAID, VERIFIED]
 *           default: UNREGISTERED
 *         project:
 *           type: string
 *           description: ID of the project
 *         teamLeader:
 *           type: string
 *           description: ID of the team leader
 *         teamMembers:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of team members
 */

/**
 * @openapi
 * /api/teams:
 *   post:
 *     tags:
 *       - Teams
 *     summary: Create a new team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       201:
 *         description: Team created
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Team name already taken
 */
teamsRouter.post("/", createTeam);

/**
 * @openapi
 * /api/teams:
 *   get:
 *     tags:
 *       - Teams
 *     summary: Get all teams
 *     responses:
 *       200:
 *         description: List of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 */
teamsRouter.get("/", getAllTeams);

/**
 * @openapi
 * /api/teams/{team_secret}:
 *   get:
 *     tags:
 *       - Teams
 *     summary: Get a team by its secret
 *     parameters:
 *       - in: path
 *         name: team_secret
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team found
 *       404:
 *         description: Team not found
 */
teamsRouter.get("/:team_secret", getTeamBySecret);

/**
 * @openapi
 * /api/teams/{team_secret}:
 *   patch:
 *     tags:
 *       - Teams
 *     summary: Update a team by its secret
 *     parameters:
 *       - in: path
 *         name: team_secret
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       200:
 *         description: Team updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Team not found
 *       409:
 *         description: Team name collision
 */
teamsRouter.patch("/:team_secret", updateTeamBySecret);
