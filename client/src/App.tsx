import { useState } from "react";
import { authClient } from "./lib/auth-client";

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
      setActionError(
        error instanceof Error ? error.message : "Google sign-in failed.",
      );
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
      setActionError(
        error instanceof Error ? error.message : "Sign-out failed.",
      );
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden grid place-items-center py-8 px-5">
      <div
        className="absolute inset-auto rounded-full blur-[10px] opacity-90 pointer-events-none w-[34rem] h-[34rem] top-[-10rem] right-[-10rem] bg-[radial-gradient(circle,rgba(233,125,49,0.28),transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-auto rounded-full blur-[10px] opacity-90 pointer-events-none w-[28rem] h-[28rem] bottom-[-9rem] left-[-8rem] bg-[radial-gradient(circle,rgba(74,169,160,0.26),transparent_70%)]"
        aria-hidden="true"
      />

      <section className="relative z-10 w-[min(100%,38rem)] p-6 sm:p-8 border border-border-main rounded-3xl sm:rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,241,234,0.93)),var(--color-surface)] shadow-[0_32px_80px_rgba(47,36,28,0.15)] backdrop-blur-[18px]">
        <div className="inline-flex py-2 px-3 rounded-full text-[0.8rem] font-bold tracking-[0.08em] uppercase text-accent-strong bg-accent-soft">
          Iotricity Registry
        </div>
        <h1 className="my-[18px] mb-[12px] text-[clamp(2.4rem,6vw,3.3rem)] leading-[0.95] tracking-[-0.05em]">
          Google sign-in for your MERN app
        </h1>
        <p className="m-0 mb-7 max-w-[34rem] text-text-muted text-base leading-[1.7]">
          Better Auth is mounted on the Express API and this Vite app reads the
          session through secure cookie-based auth.
        </p>

        {session.isPending ? (
          <div className="flex items-center gap-3 p-[22px] border border-[rgba(92,80,69,0.12)] rounded-[22px] bg-[rgba(255,255,255,0.7)]">
            <span
              className="w-3 h-3 rounded-full bg-accent shadow-[0_0_0_8px_rgba(224,118,47,0.15)] animate-pulse"
              aria-hidden="true"
            />
            <p className="m-0 text-text-muted">Checking your session…</p>
          </div>
        ) : user ? (
          <div className="grid gap-5 p-[22px] border border-[rgba(92,80,69,0.12)] rounded-[22px] bg-[rgba(255,255,255,0.7)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {user.image ? (
                <img
                  className="w-[72px] h-[72px] rounded-2xl object-cover shadow-[0_12px_30px_rgba(39,28,19,0.12)]"
                  src={user.image}
                  alt={user.name}
                />
              ) : (
                <div
                  className="grid place-items-center text-surface text-[1.35rem] font-bold bg-[linear-gradient(135deg,var(--color-accent),var(--color-teal))] w-[72px] h-[72px] rounded-2xl object-cover shadow-[0_12px_30px_rgba(39,28,19,0.12)]"
                  aria-hidden="true"
                >
                  {getInitials(user.name)}
                </div>
              )}

              <div>
                <p className="m-0 text-text-muted">Signed in as</p>
                <h2 className="my-1 text-[1.5rem]">{user.name}</h2>
                <p className="m-0 text-text-muted">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
              <div className="p-4 rounded-[18px] bg-[rgba(243,235,227,0.78)]">
                <span className="m-0 text-text-muted">Session mode</span>
                <strong className="block mt-1.5 text-text-main">
                  Cookie session
                </strong>
              </div>
              <div className="p-4 rounded-[18px] bg-[rgba(243,235,227,0.78)]">
                <span className="m-0 text-text-muted">Email verified</span>
                <strong className="block mt-1.5 text-text-main">
                  {user.emailVerified ? "Yes" : "No"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="border-0 rounded-[18px] py-4 px-5 font-bold text-text-main bg-[linear-gradient(135deg,rgba(233,125,49,0.16),rgba(74,169,160,0.22))] cursor-pointer transition-all duration-160 ease-out hover:-translate-y-[1px] disabled:cursor-wait disabled:opacity-75"
              onClick={handleSignOut}
              disabled={isWorking}
            >
              {isWorking ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : (
          <div className="grid gap-5 p-[22px] border border-[rgba(92,80,69,0.12)] rounded-[22px] bg-[rgba(255,255,255,0.7)]">
            <div className="grid gap-[14px]">
              <div className="p-4 rounded-[18px] bg-[rgba(243,235,227,0.78)]">
                <span className="block mb-2 text-accent-strong text-[0.82rem] font-bold tracking-[0.08em] uppercase">
                  OAuth
                </span>
                <p className="m-0 text-text-muted">
                  Google sign-in returns here after the Better Auth callback
                  completes.
                </p>
              </div>
              <div className="p-4 rounded-[18px] bg-[rgba(243,235,227,0.78)]">
                <span className="block mb-2 text-accent-strong text-[0.82rem] font-bold tracking-[0.08em] uppercase">
                  API
                </span>
                <p className="m-0 text-text-muted">
                  Auth endpoints live at{" "}
                  <code className="text-[0.95em] text-accent-strong">
                    /api/auth/*
                  </code>{" "}
                  on the Express server.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="border-0 rounded-[18px] py-4 px-5 font-bold text-[#fffaf4] bg-[linear-gradient(135deg,var(--color-accent),#d84e33)] shadow-[0_16px_30px_rgba(216,78,51,0.24)] cursor-pointer transition-all duration-160 ease-out hover:-translate-y-[1px] hover:shadow-[0_20px_36px_rgba(216,78,51,0.3)] disabled:cursor-wait disabled:opacity-75"
              onClick={handleGoogleSignIn}
              disabled={isWorking}
            >
              {isWorking ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>
        )}

        {actionError ? (
          <p className="mt-[18px] mb-0 text-error font-semibold">
            {actionError}
          </p>
        ) : null}
        {!actionError && session.error ? (
          <p className="mt-[18px] mb-0 text-error font-semibold">
            {session.error.message}
          </p>
        ) : null}

        <footer className="mt-[18px] mb-0 text-[0.92rem] text-text-muted">
          Client origin:{" "}
          <code className="text-[0.95em] text-accent-strong">
            {window.location.origin}
          </code>
        </footer>
      </section>
    </main>
  );
}

export default App;
