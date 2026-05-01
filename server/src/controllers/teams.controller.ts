import { Request, Response } from "express";
import { Team, TeamMember } from "../models/index.js";
import { generateUniqueTeamSecret } from "../helpers/createTeamSecret.js";

/**
 * Creates a new team.
 *
 * @param req - Express Request object containing teamName and teamLeaderEmail.
 * @param res - Express Response object.
 */
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { teamName, teamLeaderEmail } = req.body;

    if (!teamLeaderEmail) {
      return res
        .status(400)
        .json({ message: "Team leader email is required." });
    }

    // Find the team leader by email
    const leader = await TeamMember.findOne({ googleEmail: teamLeaderEmail });
    if (!leader) {
      return res.status(404).json({ message: "Team leader not found." });
    }

    // Check if the leader is already in a team (as leader or member)
    const existingTeam = await Team.findOne({
      $or: [{ teamLeader: leader._id }, { teamMembers: leader._id }],
    });

    if (existingTeam) {
      return res.status(400).json({
        message: "User is already a leader or member of another team.",
      });
    }

    // Generate a unique secret for the team as the first step
    const teamSecret = await generateUniqueTeamSecret();

    const teamData = {
      teamName,
      teamLeader: leader._id,
      teamSecret,
    };

    const team = new Team(teamData);
    await team.save();

    // Return the team with populated leader. teamMembers is empty at creation.
    const populatedTeam = await Team.findById(team._id).populate("teamLeader");

    res.status(201).json(populatedTeam);
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
      .populate("teamMembers");
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
      .populate("teamMembers");

    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates a team's name by its team secret.
 * Validates leadership based on the provided leader email.
 *
 * @param req - Express Request object containing team_secret in params, newTeamName and teamLeaderEmail in body.
 * @param res - Express Response object.
 */
export const updateTeamName = async (req: Request, res: Response) => {
  try {
    const { team_secret } = req.params;
    const { newTeamName, teamLeaderEmail } = req.body;

    if (!teamLeaderEmail) {
      return res
        .status(400)
        .json({ message: "Team leader email is required for validation." });
    }

    const team = await Team.findOne({ teamSecret: team_secret });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const leader = await TeamMember.findOne({ googleEmail: teamLeaderEmail });
    if (!leader || team.teamLeader.toString() !== leader._id.toString()) {
      return res.status(403).json({
        message: "Forbidden: Only the team leader can update the team name.",
      });
    }

    if (team.teamName === newTeamName) {
      return res.status(400).json({
        message: "New team name must be different from the current one.",
      });
    }

    team.teamName = newTeamName;
    await team.save();

    res.json(team);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Updates a team's registration status.
 *
 * @param req - Express Request object containing team_secret in params and registrationStatus in body.
 * @param res - Express Response object.
 */
export const updateTeamRegistrationStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { team_secret } = req.params;
    const { registrationStatus } = req.body;

    const validStatuses = ["UNREGISTERED", "REGISTERED", "PAID", "VERIFIED"];
    if (!validStatuses.includes(registrationStatus)) {
      return res.status(400).json({
        message: `Invalid registration status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedTeam = await Team.findOneAndUpdate(
      { teamSecret: team_secret },
      { registrationStatus },
      { new: true, runValidators: true },
    )
      .populate("teamLeader")
      .populate("teamMembers");

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found." });
    }

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Adds a new member to the team.
 * Checks team size limits and ensures the user is not already part of any team.
 *
 * @param req - Express Request object containing team_secret in params and memberEmail in body.
 * @param res - Express Response object.
 */
export const addTeamTeamMembers = async (req: Request, res: Response) => {
  try {
    const { team_secret } = req.params;
    const { memberEmail } = req.body;

    const team = await Team.findOne({ teamSecret: team_secret });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Check if the team is in UNREGISTERED status
    if (team.registrationStatus !== "UNREGISTERED") {
      return res.status(400).json({
        message:
          "Members can only be added when the team is not yet REGISTERED.",
      });
    }

    // Check if team already has max members (limit of 4 additional members)
    if (team.teamMembers.length >= 4) {
      return res.status(400).json({
        message:
          "Team has reached the maximum size of 5 (additional members 4).",
      });
    }

    // Find the member to add by email
    const memberToAdd = await TeamMember.findOne({ googleEmail: memberEmail });
    if (!memberToAdd) {
      return res
        .status(404)
        .json({ message: "Team member with this email not found." });
    }

    const memberId = memberToAdd._id;

    // Check if the member is already a leader or member of ANY team
    const existingTeam = await Team.findOne({
      $or: [{ teamLeader: memberId }, { teamMembers: memberId }],
    });

    if (existingTeam) {
      return res
        .status(400)
        .json({ message: "User is already a leader or member of a team." });
    }

    team.teamMembers.push(memberId);
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("teamLeader")
      .populate("teamMembers");

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Removes a member from the team.
 * Verifies that the member exists in the team and respects minimum size constraints.
 * Only allowed if the team is UNREGISTERED.
 *
 * @param req - Express Request object containing team_secret and member_email in params.
 * @param res - Express Response object.
 */
export const deleteTeamTeamMembers = async (req: Request, res: Response) => {
  try {
    const { team_secret, member_email } = req.params;

    const team = await Team.findOne({ teamSecret: team_secret });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Check if the team is in UNREGISTERED status
    if (team.registrationStatus !== "UNREGISTERED") {
      return res
        .status(400)
        .json({
          message: "Members can only be removed when the team is UNREGISTERED.",
        });
    }

    // Find the member to remove by email
    const memberToDelete = await TeamMember.findOne({
      googleEmail: member_email,
    });
    if (!memberToDelete) {
      return res
        .status(404)
        .json({ message: "Team member with this email not found." });
    }

    const memberIndex = team.teamMembers.findIndex(
      (id) => id.toString() === memberToDelete._id.toString(),
    );
    if (memberIndex === -1) {
      return res
        .status(400)
        .json({ message: "Member not found in this team." });
    }

    team.teamMembers.splice(memberIndex, 1);
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("teamLeader")
      .populate("teamMembers");

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
