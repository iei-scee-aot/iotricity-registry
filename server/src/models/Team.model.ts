import mongoose, { Document, Schema } from "mongoose";
import { ITeamMember } from "./TeamMember.model.js";

/**
 * Valid registration statuses for a team.
 */
export type RegistrationStatus =
  | "UNREGISTERED"
  | "REGISTERED"
  | "PAID"
  | "VERIFIED";

/**
 * Interface representing a Team document in MongoDB.
 */
export interface ITeam extends Document {
  teamName: string;
  teamSecret: string;
  registrationStatus: RegistrationStatus;
  teamLeader: ITeamMember["_id"] | ITeamMember;
  teamMembers: (ITeamMember["_id"] | ITeamMember)[];
  razorpayOrderId?: string;
}

/**
 * Mongoose schema for the Team model.
 * Manages team composition, projects, and registration status.
 */
const teamSchema = new Schema<ITeam>(
  {
    teamName: { type: String, required: true },
    // Secret key for team-specific actions (e.g., joining)
    teamSecret: { type: String, required: true, unique: true },
    registrationStatus: {
      type: String,
      enum: ["UNREGISTERED", "REGISTERED", "PAID", "VERIFIED"],
      default: "UNREGISTERED",
    },
    // Reference to the member who created the team
    teamLeader: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
      required: true,
    },
    // List of additional members in the team
    teamMembers: [{ type: Schema.Types.ObjectId, ref: "TeamMember" }],
    razorpayOrderId: { type: String },
  },
  { timestamps: true },
);

/**
 * Validation to ensure a team has a valid number of members.
 * Note: teamLeader is handled separately from teamMembers array in this schema.
 */
teamSchema.path("teamMembers").validate(function (members: unknown[]) {
  return members.length >= 0 && members.length <= 4; // Adjusted to allow 0 if only leader is present
}, "A team must have between 0 and 4 additional members.");

// Create and export the Team model
export const Team = mongoose.model<ITeam>("Team", teamSchema);
