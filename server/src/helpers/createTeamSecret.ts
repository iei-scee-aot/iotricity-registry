import { Team } from "../models/index.js";

/**
 * Generates a unique 8-character team secret consisting of A-Z and 0-9.
 * 
 * @returns A unique 8-character string.
 */
export const generateUniqueTeamSecret = async (): Promise<string> => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let secret = "";
  let isUnique = false;

  while (!isUnique) {
    secret = "";
    for (let i = 0; i < 8; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Verify uniqueness in the database
    const existingTeam = await Team.findOne({ teamSecret: secret });
    if (!existingTeam) {
      isUnique = true;
    }
  }
  
  return secret;
};
