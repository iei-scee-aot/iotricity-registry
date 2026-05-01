import { Response } from "express";
import { Team, TeamMember } from "../models/index.js";

/**
 * Validates team existence, status, and leadership.
 * 
 * @param teamSecret - The secret of the team to verify.
 * @param leaderEmail - The email of the leader to verify ownership.
 * @param res - Express Response object to handle errors.
 * @param options - Optional status check and custom error messages.
 * @returns An object containing the team and leader, or null if validation fails.
 */
export const verifyTeamAndLeader = async (
  teamSecret: string,
  leaderEmail: string,
  res: Response,
  options?: {
    requiredStatus?: string | string[];
    statusErrorMessage?: string;
    forbiddenErrorMessage?: string;
  },
) => {
  const team = await Team.findOne({ teamSecret });
  if (!team) {
    res.status(404).json({ message: "Team not found." });
    return null;
  }

  const { requiredStatus, statusErrorMessage, forbiddenErrorMessage } = options || {};
  
  if (requiredStatus) {
    const statuses = Array.isArray(requiredStatus) ? requiredStatus : [requiredStatus];
    if (!statuses.includes(team.registrationStatus)) {
      res.status(403).json({
        message: statusErrorMessage || `Forbidden: Team status must be ${statuses.join(" or ")}.`,
      });
      return null;
    }
  }

  const leader = await TeamMember.findOne({ googleEmail: leaderEmail });
  const isLeader = leader && team.teamLeader.toString() === leader._id.toString();
  
  if (!isLeader) {
    res.status(403).json({
      message: forbiddenErrorMessage || "Forbidden: Leadership verification failed.",
    });
    return null;
  }

  return { team, leader };
};

/**
 * Checks for unique field collisions among team members.
 * 
 * @param fields - Object containing unique fields to check (googleEmail, collegeEmail, rollNumber).
 * @param excludeId - Optional ID to exclude from the check (used for updates).
 * @returns A string error message if a collision is found, otherwise null.
 */
export const checkMemberCollisions = async (
  fields: { googleEmail?: string; collegeEmail?: string; rollNumber?: string },
  excludeId?: any,
) => {
  const { googleEmail, collegeEmail, rollNumber } = fields;
  const conditions = [
    googleEmail && { googleEmail },
    collegeEmail && { collegeEmail },
    rollNumber && { rollNumber },
  ].filter(Boolean) as any[];

  if (conditions.length === 0) return null;

  const query = { $or: conditions, ...(excludeId && { _id: { $ne: excludeId } }) };
  const existingMember = await TeamMember.findOne(query);

  if (!existingMember) return null;

  const suffix = excludeId ? " by another member" : "";
  if (googleEmail === existingMember.googleEmail) return `Google email is already in use${suffix}.`;
  if (collegeEmail === existingMember.collegeEmail) return `College email is already in use${suffix}.`;
  if (rollNumber === existingMember.rollNumber) return `Roll number is already in use${suffix}.`;

  return null;
};
