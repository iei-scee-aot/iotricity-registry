import { Request, Response } from "express";
import { Team } from "../models/index.js";
import { generateUniqueTeamSecret } from "../helpers/createTeamSecret.js";

/**
 * Creates a new team.
 * 
 * @param req - Express Request object containing team data.
 * @param res - Express Response object.
 */
export const createTeam = async (req: Request, res: Response) => {
  try {
    // Generate a unique secret for the team as the first step
    const teamSecret = await generateUniqueTeamSecret();
    
    const teamData = {
      ...req.body,
      teamSecret,
    };

    const team = new Team(teamData);
    await team.save();
    res.status(201).json(team);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieves all teams.
 * 
 * @param _req - Express Request object.
 * @param res - Express Response object.
 */
export const getAllTeams = async (_req: Request, res: Response) => {
  try {
    const teams = await Team.find()
      .populate("teamLeader")
      .populate("teamMembers")
      .populate("project");
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a single team by its team secret.
 * 
 * @param req - Express Request object containing team_secret in params.
 * @param res - Express Response object.
 */
export const getTeamBySecret = async (req: Request, res: Response) => {
  try {
    const { team_secret } = req.params;
    const team = await Team.findOne({ teamSecret: team_secret })
      .populate("teamLeader")
      .populate("teamMembers")
      .populate("project");

    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates a team's details by its team secret.
 * 
 * @param req - Express Request object containing team_secret in params and update data in body.
 * @param res - Express Response object.
 */
export const updateTeamBySecret = async (req: Request, res: Response) => {
  try {
    const { team_secret } = req.params;

    // Find the team to be updated
    const teamToUpdate = await Team.findOne({ teamSecret: team_secret });
    if (!teamToUpdate) {
      return res.status(404).json({ message: "Team not found." });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamToUpdate._id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("teamLeader")
      .populate("teamMembers")
      .populate("project");

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
