import mongoose, { Document, Schema } from "mongoose";
import { IProject } from "./Project.model.js";
import { ITeamMember } from "./TeamMember.model.js";

export type RegistrationStatus =
  | "UNREGISTERED"
  | "REGISTERED"
  | "PAID"
  | "VERIFIED";

export interface ITeam extends Document {
  teamName: string;
  teamSecret: string;
  registrationStatus: RegistrationStatus;
  project: IProject["_id"] | IProject;
  teamLeader: ITeamMember["_id"] | ITeamMember;
  teamMembers: (ITeamMember["_id"] | ITeamMember)[];
}

const teamSchema = new Schema<ITeam>(
  {
    teamName: { type: String, required: true, unique: true },
    teamSecret: { type: String, required: true },
    registrationStatus: {
      type: String,
      enum: ["UNREGISTERED", "REGISTERED", "PAID", "VERIFIED"],
      default: "UNREGISTERED",
    },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    teamLeader: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
      required: true,
    },
    teamMembers: [{ type: Schema.Types.ObjectId, ref: "TeamMember" }],
  },
  { timestamps: true },
);

teamSchema.path("teamMembers").validate(function (members: unknown[]) {
  return members.length >= 1 && members.length <= 3;
}, "A team must have between 1 and 3 members (excluding the leader).");

export const Team = mongoose.model<ITeam>("Team", teamSchema);
