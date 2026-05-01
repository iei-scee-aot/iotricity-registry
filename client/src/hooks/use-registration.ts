import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { fetchFromApi } from "../helpers/api";

/**
 * Custom hook to check if the current user is registered in the teamMembers database.
 * 
 * @returns {Object} { isRegistered, isLoading, error }
 * - isRegistered: null (not logged in), false (logged in but not registered), true (fully registered)
 */
export const useRegistration = () => {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRegistration = async () => {
      // Wait for session to be determined
      if (isSessionPending) return;
      
      // If no session, user is definitely not registered
      if (!session?.user) {
        setIsRegistered(null);
        setIsLoading(false);
        return;
      }

      try {
        const email = session.user.email;
        /**
         * Check if the user's email exists in the TeamMembers database.
         * The API returns the team member object if found, or 404 if not found.
         */
        await fetchFromApi(`/api/team-members/${email}`);
        setIsRegistered(true);
      } catch (err: any) {
        // A 404 error from the API means the user is logged in but not registered yet
        if (err.message === "Team member not found") {
          setIsRegistered(false);
        } else {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, [session, isSessionPending]);

  return { isRegistered, isLoading: isLoading || isSessionPending, error };
};
