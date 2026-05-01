import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useRegistration } from "./hooks/use-registration";
import LoginPage from "./pages/Login";
import OnboardingPage from "./pages/Onboarding";
import HomePage from "./pages/Home";

/**
 * Main Application Component.
 * Handles the global routing and authentication flow:
 * 1. Login: If not logged in, force /login.
 * 2. Onboarding: If logged in but not in TeamMembers DB, force /onboarding.
 * 3. Home: If logged in and registered, allow /.
 */
function App() {
  const { isRegistered, isLoading } = useRegistration();

  // Show a global loading spinner while session and registration status are being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#9505F7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/**
         * Onboarding Route:
         * Accessible only to logged-in users who haven't completed their profile.
         */}
        <Route
          path="/onboarding"
          element={
            isRegistered === false ? (
              <OnboardingPage />
            ) : isRegistered === true ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/**
         * Login Route:
         * Accessible only to non-authenticated users.
         */}
        <Route
          path="/login"
          element={
            isRegistered === null ? (
              <LoginPage />
            ) : (
              <Navigate to={isRegistered ? "/" : "/onboarding"} replace />
            )
          }
        />

        {/**
         * Home Route (Protected):
         * Requires both authentication and registration.
         */}
        <Route
          path="/"
          element={
            isRegistered === true ? (
              <HomePage />
            ) : isRegistered === false ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
