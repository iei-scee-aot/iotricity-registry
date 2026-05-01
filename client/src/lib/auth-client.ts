import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client configuration.
 * Connects to the backend API and handles session management via cookies.
 */
const baseURL = import.meta.env.VITE_API_URL?.trim();

if (!baseURL) {
  throw new Error("Missing VITE_API_URL for Better Auth client.");
}

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    // Ensure cookies are sent with every request for session persistence
    credentials: "include",
  },
});
