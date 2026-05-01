import { Router } from "express";
import {
  createProject,
  getAllProjects,
  getProjectByTeamSecretAndRound,
  updateProjectByTeamSecretAndRound,
  deleteProjectByTeamSecretAndRound,
} from "../controllers/projects.controller.js";

export const projectsRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - projectName
 *         - projectThemes
 *         - projectTracks
 *         - teamSecret
 *         - round
 *         - githubUrl
 *         - presentationUrl
 *         - demoVideoUrl
 *       properties:
 *         projectName:
 *           type: string
 *         projectThemes:
 *           type: array
 *           items:
 *             type: string
 *         projectTracks:
 *           type: array
 *           items:
 *             type: string
 *         teamSecret:
 *           type: string
 *         round:
 *           type: number
 *         githubUrl:
 *           type: string
 *           format: uri
 *         presentationUrl:
 *           type: string
 *           format: uri
 *         demoVideoUrl:
 *           type: string
 *           format: uri
 */

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Duplicate project for this round or invalid input
 *       403:
 *         description: Forbidden - Team is not VERIFIED
 *       404:
 *         description: Team not found
 */
projectsRouter.post("/", createProject);

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get all projects
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
projectsRouter.get("/", getAllProjects);

/**
 * @openapi
 * /api/projects/{team_secret}/{round}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get a project by team secret and round
 *     parameters:
 *       - in: path
 *         name: team_secret
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: round
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
projectsRouter.get("/:team_secret/:round", getProjectByTeamSecretAndRound);

/**
 * @openapi
 * /api/projects/{team_secret}/{round}:
 *   patch:
 *     tags:
 *       - Projects
 *     summary: Update a project by team secret and round
 *     parameters:
 *       - in: path
 *         name: team_secret
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: round
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *               projectThemes:
 *                 type: array
 *                 items:
 *                   type: string
 *               projectTracks:
 *                 type: array
 *                 items:
 *                   type: string
 *               githubUrl:
 *                 type: string
 *                 format: uri
 *               presentationUrl:
 *                 type: string
 *                 format: uri
 *               demoVideoUrl:
 *                 type: string
 *                 format: uri
 *               teamLeaderEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the team leader for ownership verification
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Team not VERIFIED or not the leader
 *       404:
 *         description: Project or team not found
 */
projectsRouter.patch("/:team_secret/:round", updateProjectByTeamSecretAndRound);

/**
 * @openapi
 * /api/projects/{team_secret}/{round}:
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete a project by team secret and round
 *     parameters:
 *       - in: path
 *         name: team_secret
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: round
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamLeaderEmail
 *             properties:
 *               teamLeaderEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       403:
 *         description: Forbidden - Team not VERIFIED or not the leader
 *       404:
 *         description: Project not found
 */
projectsRouter.delete(
  "/:team_secret/:round",
  deleteProjectByTeamSecretAndRound,
);
