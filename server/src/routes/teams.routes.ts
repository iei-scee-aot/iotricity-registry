import { Router } from "express";
import {
  createTeam,
  getAllTeams,
  getTeamBySecret,
  updateTeamName,
  updateTeamRegistrationStatus,
  addTeamTeamMembers,
  deleteTeamTeamMembers,
  deleteTeam,
  getTeamByMemberEmail,
} from "../controllers/teams.controller.js";

export const teamsRouter = Router();

/**
 * @openapi
 * /api/teams/member/{email}:
 *   get:
 *     tags:
 *       - Teams
 *     summary: Get a team by a member's email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamPopulated'
 *       404:
 *         description: Team not found for this member
 */
teamsRouter.get("/member/:email", getTeamByMemberEmail);

/**
 * @openapi
 * components:
 *   schemas:
 *     TeamCreateRequest:
 *       type: object
 *       required:
 *         - teamName
 *         - teamLeaderEmail
 *       properties:
 *         teamName:
 *           type: string
 *         teamLeaderEmail:
 *           type: string
 *           format: email
 *           description: Google Email of the team leader
 *     TeamPopulated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         teamName:
 *           type: string
 *         teamSecret:
 *           type: string
 *         registrationStatus:
 *           type: string
 *           enum: [UNREGISTERED, REGISTERED, PAID, VERIFIED]
 *         teamLeader:
 *           $ref: '#/components/schemas/TeamMember'
 *         teamMembers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TeamMember'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *             $ref: '#/components/schemas/TeamCreateRequest'
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamPopulated'
 *       400:
 *         description: Invalid input
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
 *         description: List of teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamPopulated'
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
 *         description: Team found and returned with full details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamPopulated'
 *       404:
 *         description: Team not found
 */
teamsRouter.get("/:team_secret", getTeamBySecret);

/**
 * @openapi
 * /api/teams/{team_secret}/name:
 *   patch:
 *     tags:
 *       - Teams
 *     summary: Update team name
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
 *             type: object
 *             required:
 *               - newTeamName
 *               - teamLeaderEmail
 *             properties:
 *               newTeamName:
 *                 type: string
 *               teamLeaderEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Team name updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamPopulated'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden (Only leader can update)
 *       404:
 *         description: Team not found
 */
teamsRouter.patch("/:team_secret/name", updateTeamName);

/**
 * @openapi
 * /api/teams/{team_secret}/status:
 *   patch:
 *     tags:
 *       - Teams
 *     summary: Update team registration status
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
 *             type: object
 *             required:
 *               - registrationStatus
 *             properties:
 *               registrationStatus:
 *                 type: string
 *                 enum: [UNREGISTERED, REGISTERED, PAID, VERIFIED]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamPopulated'
 *       404:
 *         description: Team not found
 */
teamsRouter.patch("/:team_secret/status", updateTeamRegistrationStatus);

/**
 * @openapi
 * /api/teams/{team_secret}:
 *   delete:
 *     tags:
 *       - Teams
 *     summary: Delete a team (only if UNREGISTERED)
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
 *             type: object
 *             required:
 *               - teamLeaderEmail
 *             properties:
 *               teamLeaderEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the team leader
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       400:
 *         description: Team is not UNREGISTERED
 *       403:
 *         description: Forbidden (Only leader can delete)
 *       404:
 *         description: Team or leader not found
 */
teamsRouter.delete("/:team_secret", deleteTeam);

/**
 * @openapi
 * /api/teams/{team_secret}/members:
 *   post:
 *     tags:
 *       - Teams
 *     summary: Add a team member
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
 *             type: object
 *             required:
 *               - memberEmail
 *             properties:
 *               memberEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the member to add
 *     responses:
 *       200:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamPopulated'
 *       400:
 *         description: Team full, user already in a team, or team is not UNREGISTERED
 *       404:
 *         description: Team or member not found
 */
teamsRouter.post("/:team_secret/members", addTeamTeamMembers);

/**
 * @openapi
 * /api/teams/{team_secret}/members/{member_email}:
 *   delete:
 *     tags:
 *       - Teams
 *     summary: Remove a team member
 *     parameters:
 *       - in: path
 *         name: team_secret
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: member_email
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Email of the member to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamPopulated'
 *       400:
 *         description: Member not in team or team is not UNREGISTERED
 *       404:
 *         description: Team or member not found
 */
teamsRouter.delete(
  "/:team_secret/members/:member_email",
  deleteTeamTeamMembers,
);
