import { Request, Response } from "express";
import { Project, Team } from "../models/index.js";
import { verifyTeamAndLeader } from "../helpers/controller.helpers.js";

/**
 * Creates a new project.
 * Verifies that the team is VERIFIED and hasn't already submitted for this round.
 *
 * @param req - Express Request object containing project data.
 * @param res - Express Response object.
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    const { teamSecret, round } = req.body;

    // 1. Check if the team exists and is VERIFIED
    const team = await Team.findOne({ teamSecret });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    if (team.registrationStatus !== "VERIFIED") {
      return res.status(403).json({
        message: "Forbidden: Only VERIFIED teams can submit projects.",
      });
    }

    // 2. Check if the team has already submitted a project for this round
    const existingProject = await Project.findOne({ teamSecret, round });
    if (existingProject) {
      return res.status(400).json({
        message: `A project for Round ${round} has already been submitted by this team.`,
      });
    }

    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieves all projects.
 *
 * @param _req - Express Request object.
 * @param res - Express Response object.
 */
export const getAllProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a single project by team secret and round.
 *
 * @param req - Express Request object containing team_secret and round in params.
 * @param res - Express Response object.
 */
export const getProjectByTeamSecretAndRound = async (
  req: Request,
  res: Response,
) => {
  try {
    const { team_secret, round } = req.params;
    const project = await Project.findOne({
      teamSecret: team_secret,
      round: Number(round),
    });

    if (!project) {
      return res.status(404).json({
        message: `Project for Round ${round} not found for this team.`,
      });
    }
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates a project's details.
 * Verifies that the team is VERIFIED and the requester is the team leader.
 *
 * @param req - Express Request object containing team_secret and round in params, and update data + teamLeaderEmail in body.
 * @param res - Express Response object.
 */
export const updateProjectByTeamSecretAndRound = async (
  req: Request,
  res: Response,
) => {
  try {
    const { team_secret, round } = req.params;
    const { teamLeaderEmail, ...updateData } = req.body;

    if (!teamLeaderEmail) {
      return res
        .status(400)
        .json({ message: "Team leader email is required for validation." });
    }

    // Verify team status and leadership
    const verification = await verifyTeamAndLeader(
      team_secret as string,
      teamLeaderEmail,
      res,
      {
        requiredStatus: "VERIFIED",
        statusErrorMessage: "Forbidden: Only VERIFIED teams can update projects.",
        forbiddenErrorMessage: "Forbidden: Only the team leader can update the project.",
      },
    );

    if (!verification) return;

    // 3. Find and update the project
    const updatedProject = await Project.findOneAndUpdate(
      { teamSecret: team_secret, round: Number(round) },
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedProject) {
      return res.status(404).json({
        message: `Project for Round ${round} not found for this team.`,
      });
    }

    res.json(updatedProject);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Deletes a project.
 * Verifies that the team is VERIFIED and the requester is the team leader.
 *
 * @param req - Express Request object containing team_secret and round in params, and teamLeaderEmail in body.
 * @param res - Express Response object.
 */
export const deleteProjectByTeamSecretAndRound = async (
  req: Request,
  res: Response,
) => {
  try {
    const { team_secret, round } = req.params;
    const { teamLeaderEmail } = req.body;

    if (!teamLeaderEmail) {
      return res
        .status(400)
        .json({ message: "Team leader email is required for validation." });
    }

    // Verify team status and leadership
    const verification = await verifyTeamAndLeader(
      team_secret as string,
      teamLeaderEmail,
      res,
      {
        requiredStatus: "VERIFIED",
        statusErrorMessage: "Forbidden: Only VERIFIED teams can delete projects.",
        forbiddenErrorMessage: "Forbidden: Only the team leader can delete the project.",
      },
    );

    if (!verification) return;

    const deletedProject = await Project.findOneAndDelete({
      teamSecret: team_secret,
      round: Number(round),
    });

    if (!deletedProject) {
      return res.status(404).json({
        message: `Project for Round ${round} not found for this team.`,
      });
    }

    res.json({ message: "Project deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
