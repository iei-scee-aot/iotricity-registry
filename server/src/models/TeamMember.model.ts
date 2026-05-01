import mongoose, { Document, Schema } from "mongoose";

export interface ITeamMember extends Document {
  name: string;
  googleEmail: string;
  googleProfilePicture: string;
  collegeEmail: string;
  rollNumber: string;
  semester: number;
  department: string;
  phoneNumber: string;
  teamBuildingProgram: boolean;
  readCodeOfConduct: boolean;
  joinedDiscord: boolean;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    googleEmail: { type: String, required: true },
    googleProfilePicture: { type: String, required: true },
    collegeEmail: { type: String, required: true },
    rollNumber: { type: String, required: true },
    semester: { type: Number, required: true },
    department: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    teamBuildingProgram: { type: Boolean, required: true, default: false },
    readCodeOfConduct: { type: Boolean, required: true, default: false },
    joinedDiscord: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

export const TeamMember = mongoose.model<ITeamMember>(
  "TeamMember",
  teamMemberSchema,
);
