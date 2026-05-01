import { Router } from "express";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberByEmail,
  updateTeamMemberByEmail,
} from "../controllers/team-members.controller.js";

export const teamMemberRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     TeamMember:
 *       type: object
 *       required:
 *         - name
 *         - googleEmail
 *         - googleProfilePicture
 *         - collegeEmail
 *         - rollNumber
 *         - semester
 *         - department
 *         - phoneNumber
 *       properties:
 *         name:
 *           type: string
 *         googleEmail:
 *           type: string
 *           format: email
 *         googleProfilePicture:
 *           type: string
 *         collegeEmail:
 *           type: string
 *           format: email
 *         rollNumber:
 *           type: string
 *         semester:
 *           type: integer
 *         department:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         teamBuildingProgram:
 *           type: boolean
 *           default: false
 *         readCodeOfConduct:
 *           type: boolean
 *           default: false
 *         joinedDiscord:
 *           type: boolean
 *           default: false
 */

/**
 * @openapi
 * /api/team-members:
 *   post:
 *     tags:
 *       - Team Members
 *     summary: Create a new team member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamMember'
 *     responses:
 *       201:
 *         description: Team member created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
 *       400:
 *         description: Invalid input
 */
teamMemberRouter.post("/", createTeamMember);

/**
 * @openapi
 * /api/team-members:
 *   get:
 *     tags:
 *       - Team Members
 *     summary: Get all team members
 *     responses:
 *       200:
 *         description: List of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamMember'
 *       500:
 *         description: Server error
 */
teamMemberRouter.get("/", getAllTeamMembers);

/**
 * @openapi
 * /api/team-members/{email}:
 *   get:
 *     tags:
 *       - Team Members
 *     summary: Get a team member by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Google or college email of the team member
 *     responses:
 *       200:
 *         description: Team member found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 */
teamMemberRouter.get("/:email", getTeamMemberByEmail);

/**
 * @openapi
 * /api/team-members/{email}:
 *   patch:
 *     tags:
 *       - Team Members
 *     summary: Update a team member by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Google or college email of the team member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamMember'
 *     responses:
 *       200:
 *         description: Team member updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Team member not found
 */
teamMemberRouter.patch("/:email", updateTeamMemberByEmail);
