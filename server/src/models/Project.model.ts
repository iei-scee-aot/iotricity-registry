import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  projectName: string;
  projectThemes: string[];
  projectTracks: string[];
  githubUrl: string;
  presentationUrl: string;
  demoVideoUrl: string;
}

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

export const Project = mongoose.model<IProject>("Project", projectSchema);
