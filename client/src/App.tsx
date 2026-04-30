import { useState } from "react";
import { authClient } from "./lib/auth-client";
import "./App.css";

const getInitials = (name: string) => {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
};

function App() {
  const session = authClient.useSession();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const user = session.data?.user ?? null;

  const handleGoogleSignIn = async () => {
    setActionError(null);
    setIsWorking(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Google sign-in failed.");
      setIsWorking(false);
    }
  };

  const handleSignOut = async () => {
    setActionError(null);
    setIsWorking(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message ?? "Sign-out failed.");
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Sign-out failed.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="app-backdrop app-backdrop-primary" aria-hidden="true" />
      <div className="app-backdrop app-backdrop-secondary" aria-hidden="true" />

      <section className="auth-card">
        <div className="eyebrow">Iotricity Registry</div>
        <h1>Google sign-in for your MERN app</h1>
        <p className="lede">
          Better Auth is mounted on the Express API and this Vite app reads the
          session through secure cookie-based auth.
        </p>

        {session.isPending ? (
          <div className="status-panel">
            <span className="status-dot" aria-hidden="true" />
            <p>Checking your session…</p>
          </div>
        ) : user ? (
          <div className="signed-in-panel">
            <div className="profile-row">
              {user.image ? (
                <img className="avatar" src={user.image} alt={user.name} />
              ) : (
                <div className="avatar avatar-fallback" aria-hidden="true">
                  {getInitials(user.name)}
                </div>
              )}

              <div>
                <p className="profile-label">Signed in as</p>
                <h2>{user.name}</h2>
                <p className="profile-email">{user.email}</p>
              </div>
            </div>

            <div className="detail-grid">
              <div>
                <span>Session mode</span>
                <strong>Cookie session</strong>
              </div>
              <div>
                <span>Email verified</span>
                <strong>{user.emailVerified ? "Yes" : "No"}</strong>
              </div>
            </div>

            <button
              type="button"
              className="primary-button secondary-button"
              onClick={handleSignOut}
              disabled={isWorking}
            >
              {isWorking ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : (
          <div className="signed-out-panel">
            <div className="feature-list">
              <div>
                <span className="feature-kicker">OAuth</span>
                <p>Google sign-in returns here after the Better Auth callback completes.</p>
              </div>
              <div>
                <span className="feature-kicker">API</span>
                <p>Auth endpoints live at <code>/api/auth/*</code> on the Express server.</p>
              </div>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={handleGoogleSignIn}
              disabled={isWorking}
            >
              {isWorking ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>
        )}

        {actionError ? <p className="error-text">{actionError}</p> : null}
        {!actionError && session.error ? (
          <p className="error-text">{session.error.message}</p>
        ) : null}

        <footer className="footer-note">
          Client origin: <code>{window.location.origin}</code>
        </footer>
      </section>
    </main>
  );
}

export default App;
