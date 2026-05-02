import mongoose, { Document, Schema } from "mongoose";

// Interface representing a Team Member document in MongoDB.
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

/**
 * Mongoose schema for the TeamMember model.
 * Defines the structure, validation, and unique constraints for team members.
 */
const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    // Google email used for authentication and primary identification
    googleEmail: { type: String, required: true, unique: true },
    googleProfilePicture: { type: String, required: true },
    // Academic email for institutional verification
    collegeEmail: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return v.endsWith("@aot.edu.in");
        },
        message: (props: any) =>
          `${props.value} is not a valid college email! It must end with @aot.edu.in`,
      },
    },
    // Unique institutional identification number
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return v.startsWith("169");
        },
        message: (props: any) =>
          `${props.value} is not a valid roll number! It must start with 169`,
      },
    },
    semester: { type: Number, required: true },
    department: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    // Status flags for event-specific requirements
    teamBuildingProgram: { type: Boolean, required: true, default: false },
    readCodeOfConduct: { type: Boolean, required: true, default: false },
    joinedDiscord: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

// Create and export the TeamMember model
export const TeamMember = mongoose.model<ITeamMember>(
  "TeamMember",
  teamMemberSchema,
);
