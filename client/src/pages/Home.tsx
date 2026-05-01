import { authClient } from "../lib/auth-client";

export default function HomePage() {
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Iotricity Registry</h1>
      
      <div className="text-center space-y-4">
        <p className="text-xl text-zinc-400">Welcome, {session?.user?.name}</p>
        <h2 className="text-2xl font-semibold text-[#9505F7]">
          Create a team or join a team
        </h2>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-3 bg-[#9505F7] hover:bg-[#7a04cc] rounded-md font-medium transition-colors">
          Create Team
        </button>
        <button className="px-6 py-3 border border-zinc-800 hover:bg-zinc-900 rounded-md font-medium transition-colors">
          Join Team
        </button>
      </div>

      <button
        onClick={handleSignOut}
        className="text-sm text-zinc-500 hover:text-white underline underline-offset-4"
      >
        Sign Out
      </button>
    </div>
  );
}
