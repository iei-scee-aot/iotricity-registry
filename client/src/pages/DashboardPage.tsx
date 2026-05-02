import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, signOut } from "../lib/auth-client";
import axios from "axios";
import { Loader2, Plus, ExternalLink, Video, FileText, Layout as LayoutIcon, CheckCircle2, Clock, Shield, LogOut, GitBranch } from "lucide-react";

export default function DashboardPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionPending && !session) {
      navigate("/");
      return;
    }

    if (session?.user?.email) {
      fetchData();
    }
  }, [session, isSessionPending]);

  const fetchData = async () => {
    try {
      // 1. Get Team
      const teamResponse = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/teams/member/${session?.user?.email}`
      );
      setTeam(teamResponse.data);

      if (teamResponse.data.registrationStatus !== 'VERIFIED') {
        navigate('/team');
        return;
      }

      // 2. Get Project (assuming Round 1)
      try {
        const projectResponse = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/projects/${teamResponse.data.teamSecret}/1`
        );
        setProject(projectResponse.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setProject(null);
        } else {
          setError("Failed to fetch project details.");
        }
      }
    } catch (err: any) {
      setError("Failed to fetch team details.");
    } finally {
      setLoading(false);
    }
  };

  if (isSessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Manage your project and track progress.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-border bg-card"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          {!project && (
            <button
              onClick={() => navigate('/submit-project')}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Submit Project
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!project ? (
        <div className="bg-card p-12 rounded-2xl shadow-lg border border-border text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutIcon className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-card-foreground mb-2">No Project Submitted Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Your team is verified! Now it's time to submit your amazing project for Round 1.
          </p>
          <button
            onClick={() => navigate('/submit-project')}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-1">{project.projectName}</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.projectThemes.map((theme: string) => (
                      <span key={theme} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded border border-primary/20 tracking-wider">
                        {theme}
                      </span>
                    ))}
                    {project.projectTracks.map((track: string) => (
                      <span key={track} className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded border border-green-500/20 tracking-wider">
                        {track}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  project.status === 'VERIFIED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  project.status === 'SUBMITTED' ? 'bg-primary/10 text-primary border-primary/20' :
                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}>
                  {project.status === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {project.status}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-3 p-4 bg-background rounded-xl border border-border hover:bg-accent transition-colors group"
                >
                  <GitBranch className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-bold text-sm text-foreground">GitHub Repo</span>
                </a>
                <a
                  href={project.presentationUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-3 p-4 bg-background rounded-xl border border-border hover:bg-accent transition-colors group"
                >
                  <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-bold text-sm text-foreground">Presentation</span>
                </a>
                <a
                  href={project.demoVideoUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-3 p-4 bg-background rounded-xl border border-border hover:bg-accent transition-colors group"
                >
                  <Video className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-bold text-sm text-foreground">Demo Video</span>
                </a>
              </div>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
              <h3 className="text-xl font-bold text-card-foreground mb-6">Submission Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Round</span>
                  <span className="font-bold text-foreground">{project.round}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Submission Date</span>
                  <span className="font-bold text-foreground">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-bold text-foreground">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border text-center">
              <h3 className="text-xl font-bold text-card-foreground mb-6">Team Status</h3>
              <div className="flex items-center gap-4 p-4 bg-green-500/5 rounded-xl border border-green-500/20 mb-6 text-left">
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-green-500 text-sm">Verified Team</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{team.teamName}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/team')}
                className="w-full flex items-center justify-center gap-2 text-primary font-bold py-3 border border-primary/20 rounded-lg hover:bg-primary/5 transition-all text-sm"
              >
                View Team Details
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
