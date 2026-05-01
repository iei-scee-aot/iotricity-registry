import mongoose, { Document, Schema } from "mongoose";

type ProjectStatus = "DRAFT" | "SUBMITTED" | "VERIFIED";

// Interface representing a Project document in MongoDB.
interface IProject extends Document {
  projectName: string;
  projectThemes: string[];
  projectTracks: string[];
  teamSecret: string;
  round: number;
  githubUrl: string;
  presentationUrl: string;
  demoVideoUrl: string;
  status: ProjectStatus;
}

/**
 * Mongoose schema for the Project model.
 * Stores information about the project a team is developing.
 */
const projectSchema = new Schema<IProject>(
  {
    projectName: { type: String, required: true },
    projectThemes: [{ type: String, required: true }],
    projectTracks: [{ type: String, required: true }],
    teamSecret: { type: String, required: true },
    round: { type: Number, required: true },
    githubUrl: { type: String, required: true },
    presentationUrl: { type: String, required: true },
    demoVideoUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "VERIFIED"],
      default: "DRAFT",
      required: true,
    },
  },
  { timestamps: true },
);

// Create and export the Project model
export const Project = mongoose.model<IProject>("Project", projectSchema);
