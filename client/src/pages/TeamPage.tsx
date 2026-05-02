import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, signOut } from "../lib/auth-client";
import axios from "axios";
import { Loader2, UserPlus, Users, Shield, LogOut, Trash2 } from "lucide-react";

export default function TeamPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [createTeamName, setCreateTeamName] = useState("");
  const [joinTeamSecret, setJoinTeamSecret] = useState("");

  useEffect(() => {
    if (!isSessionPending && !session) {
      navigate("/");
      return;
    }

    if (session?.user?.email) {
      fetchUserTeam();
    }
  }, [session, isSessionPending]);

  const fetchUserTeam = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/teams/member/${session?.user?.email}`
      );
      setTeam(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setTeam(null);
      } else {
        setError("Failed to fetch team details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/teams`, {
        teamName: createTeamName,
        teamLeaderEmail: session?.user?.email,
      });
      setTeam(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create team.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/teams/${joinTeamSecret}/members`,
        {
          memberEmail: session?.user?.email,
        }
      );
      setTeam(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join team. Check the secret key.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    setActionLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/api/teams/${team.teamSecret}/members/${session?.user?.email}`
      );
      setTeam(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to leave team.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;
    setActionLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/teams/${team.teamSecret}`, {
        data: { teamLeaderEmail: session?.user?.email },
      });
      setTeam(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete team.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isSessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading team information...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">Team Management</h2>
            <p className="text-muted-foreground">You are not part of any team yet. Create one or join an existing one.</p>
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border flex flex-col">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">Create a Team</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-grow">
              Become a team leader and invite others to join your innovative project.
            </p>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <input
                type="text"
                placeholder="Team Name"
                required
                value={createTeamName}
                onChange={(e) => setCreateTeamName(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
              />
              <button
                disabled={actionLoading}
                className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                Create Team
              </button>
            </form>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border flex flex-col">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">Join a Team</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-grow">
              Have a secret key from your team leader? Enter it here to join their team.
            </p>
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <input
                type="text"
                placeholder="Team Secret Key"
                required
                value={joinTeamSecret}
                onChange={(e) => setJoinTeamSecret(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
              />
              <button
                disabled={actionLoading}
                className="w-full bg-secondary text-secondary-foreground font-bold py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                Join Team
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const isLeader = team.teamLeader.googleEmail === session?.user?.email;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold text-card-foreground">{team.teamName}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                team.registrationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                team.registrationStatus === 'PAID' ? 'bg-primary/10 text-primary border border-primary/20' :
                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
              }`}>
                {team.registrationStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Shield className="w-4 h-4" />
              <span>Secret Key: <code className="bg-background px-2 py-0.5 rounded font-mono select-all cursor-pointer border border-border" title="Click to copy">{team.teamSecret}</code></span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-border bg-background"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            {team.registrationStatus === 'UNREGISTERED' && (
              isLeader ? (
                <button
                  onClick={handleDeleteTeam}
                  className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-destructive/20 bg-destructive/5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              ) : (
                <button
                  onClick={handleLeaveTeam}
                  className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-destructive/20 bg-destructive/5"
                >
                  <LogOut className="w-4 h-4" />
                  Leave
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Members
            </h3>
            <div className="space-y-4">
              {/* Leader */}
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <img src={team.teamLeader.googleProfilePicture} className="w-10 h-10 rounded-full border border-primary/20" alt="" />
                <div className="flex-grow">
                  <p className="font-bold text-card-foreground">{team.teamLeader.name}</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">Team Leader</p>
                </div>
              </div>

              {/* Members */}
              {team.teamMembers.map((member: any) => (
                <div key={member._id} className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border">
                  <img src={member.googleProfilePicture} className="w-10 h-10 rounded-full border border-border" alt="" />
                  <div>
                    <p className="font-bold text-card-foreground">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Member</p>
                  </div>
                </div>
              ))}

              {team.teamMembers.length < 4 && team.registrationStatus === 'UNREGISTERED' && (
                <div className="p-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-sm italic">
                  Waiting for more members...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-card-foreground mb-4">Registration Progress</h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${team.registrationStatus !== 'UNREGISTERED' ? 'bg-green-500/5 border-green-500/20' : 'bg-background border-border opacity-60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Step 1: Team Formation</span>
                  {team.registrationStatus !== 'UNREGISTERED' && <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Completed</span>}
                </div>
                <p className="text-xs text-muted-foreground">Form a team of at least 1 and up to 5 members.</p>
              </div>

              <div className={`p-4 rounded-xl border ${team.registrationStatus === 'PAID' || team.registrationStatus === 'VERIFIED' ? 'bg-green-500/5 border-green-500/20' : 'bg-background border-border'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Step 2: Payment</span>
                  {team.registrationStatus === 'PAID' || team.registrationStatus === 'VERIFIED' ? (
                    <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Completed</span>
                  ) : (
                    isLeader && team.registrationStatus === 'REGISTERED' ? (
                      <button
                        onClick={() => navigate('/payment')}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Pending</span>
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Pay the registration fee to confirm your participation.</p>
              </div>

              <div className={`p-4 rounded-xl border ${team.registrationStatus === 'VERIFIED' ? 'bg-green-500/5 border-green-500/20' : 'bg-background border-border opacity-60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Step 3: Verification</span>
                  {team.registrationStatus === 'VERIFIED' && <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Verified</span>}
                </div>
                <p className="text-xs text-muted-foreground">Wait for the organizers to verify your details.</p>
              </div>
            </div>

            {isLeader && team.registrationStatus === 'UNREGISTERED' && (
              <div className="pt-4 border-t border-border">
                <button
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      await axios.patch(`${import.meta.env.VITE_SERVER_URL}/api/teams/${team.teamSecret}/status`, {
                        registrationStatus: 'REGISTERED'
                      });
                      fetchUserTeam();
                    } catch (err: any) {
                      setError(err.response?.data?.message || "Failed to update status.");
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Finalize Team & Proceed
                </button>
                <p className="text-[10px] text-muted-foreground mt-2 text-center italic">
                  Note: You won't be able to add or remove members after finalizing.
                </p>
              </div>
            )}

            {team.registrationStatus === 'VERIFIED' && (
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {import.meta.env.DEV && team.registrationStatus !== 'VERIFIED' && (
              <div className="pt-4 border-t border-border">
                 <button
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      await axios.patch(`${import.meta.env.VITE_SERVER_URL}/api/teams/${team.teamSecret}/status`, {
                        registrationStatus: 'VERIFIED'
                      });
                      fetchUserTeam();
                    } catch (err: any) {
                      setError("Bypass failed.");
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  className="w-full bg-secondary text-secondary-foreground font-bold py-2 rounded-lg hover:opacity-90 transition-all text-[10px]"
                >
                  [DEV] Bypass: Mark as VERIFIED
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
