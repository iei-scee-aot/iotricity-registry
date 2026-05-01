import mongoose, { Document, Schema } from "mongoose";

/**
 * Interface representing a Project document in MongoDB.
 */
export interface IProject extends Document {
  projectName: string;
  projectThemes: string[];
  projectTracks: string[];
  githubUrl: string;
  presentationUrl: string;
  demoVideoUrl: string;
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
    githubUrl: { type: String, required: true },
    presentationUrl: { type: String, required: true },
    demoVideoUrl: { type: String, required: true },
  },
  { timestamps: true },
);

// Create and export the Project model
export const Project = mongoose.model<IProject>("Project", projectSchema);
