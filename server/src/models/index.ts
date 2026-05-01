/**
 * Central export point for all Mongoose models and their associated types.
 * Simplifies imports in other parts of the application.
 */

export { Team } from "./Team.model.js";
export { Project } from "./Project.model.js";
export { TeamMember } from "./TeamMember.model.js";

// Export types for use in controllers and services
export type { ITeam, RegistrationStatus } from "./Team.model.js";
export type { IProject } from "./Project.model.js";
export type { ITeamMember } from "./TeamMember.model.js";
