import { Request, Response } from "express";
import { TeamMember } from "../models/index.js";
import { checkMemberCollisions } from "../helpers/controller.helpers.js";

/**
 * Creates a new team member after validating for duplicate emails and roll number.
 * 
 * @param req - Express Request object containing team member data in the body.
 * @param res - Express Response object.
 */
export const createTeamMember = async (req: Request, res: Response) => {
  try {
    const { googleEmail, collegeEmail, rollNumber } = req.body;

    // Check if a member with any of the unique identifiers already exists
    const collisionError = await checkMemberCollisions({
      googleEmail,
      collegeEmail,
      rollNumber,
    });

    if (collisionError) {
      return res.status(409).json({ message: collisionError });
    }

    const teamMember = new TeamMember(req.body);
    await teamMember.save();
    res.status(201).json(teamMember);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieves all team members from the database.
 * 
 * @param _req - Express Request object (unused).
 * @param res - Express Response object.
 */
export const getAllTeamMembers = async (_req: Request, res: Response) => {
  try {
    const teamMembers = await TeamMember.find();
    res.json(teamMembers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a single team member by their Google or college email.
 * 
 * @param req - Express Request object containing the email in params.
 * @param res - Express Response object.
 */
export const getTeamMemberByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const teamMember = await TeamMember.findOne({
      $or: [{ googleEmail: email }, { collegeEmail: email }],
    });
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }
    res.json(teamMember);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates a team member's details by their email, ensuring no collisions with other members' unique fields.
 * 
 * @param req - Express Request object containing the email in params and updated data in body.
 * @param res - Express Response object.
 */
export const updateTeamMemberByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { googleEmail, collegeEmail, rollNumber } = req.body;

    // 1. Find the member to be updated
    const teamMemberToUpdate = await TeamMember.findOne({
      $or: [{ googleEmail: email }, { collegeEmail: email }],
    });

    if (!teamMemberToUpdate) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // 2. Check for collisions with OTHER members if unique fields are changing
    const collisionError = await checkMemberCollisions(
      { googleEmail, collegeEmail, rollNumber },
      teamMemberToUpdate._id,
    );

    if (collisionError) {
      return res.status(409).json({ message: collisionError });
    }

    // 3. Perform the update with validation enabled
    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      teamMemberToUpdate._id,
      req.body,
      { new: true, runValidators: true },
    );

    res.json(updatedTeamMember);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
