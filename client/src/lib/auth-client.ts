import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_API_URL?.trim();

if (!baseURL) {
  throw new Error("Missing VITE_API_URL for Better Auth client.");
}

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});
