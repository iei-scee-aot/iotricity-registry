import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../lib/auth-client";
import axios from "axios";
import { Loader2, Send } from "lucide-react";

export default function ProjectSubmissionPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projectName: "",
    projectThemes: "",
    projectTracks: "",
    githubUrl: "",
    presentationUrl: "",
    demoVideoUrl: "",
  });

  useEffect(() => {
    if (!isSessionPending && !session) {
      navigate("/");
      return;
    }

    if (session?.user?.email) {
      fetchTeam();
    }
  }, [session, isSessionPending]);

  const fetchTeam = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/teams/member/${session?.user?.email}`
      );
      setTeam(response.data);
      if (response.data.registrationStatus !== 'VERIFIED') {
        navigate('/team');
      }
    } catch (err: any) {
      setError("Failed to fetch team details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/projects`, {
        ...formData,
        projectThemes: formData.projectThemes.split(',').map(s => s.trim()).filter(s => s),
        projectTracks: formData.projectTracks.split(',').map(s => s.trim()).filter(s => s),
        teamSecret: team.teamSecret,
        round: 1,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit project. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking submission eligibility...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-card p-8 rounded-2xl shadow-lg border border-border">
      <h2 className="text-2xl font-bold text-card-foreground mb-2">Submit Your Project</h2>
      <p className="text-muted-foreground mb-8">
        Provide the details of your innovative project for Round 1 evaluation.
      </p>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Project Name
          </label>
          <input
            type="text"
            name="projectName"
            required
            placeholder="Enter a catchy name for your project"
            value={formData.projectName}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Project Themes (comma separated)
            </label>
            <input
              type="text"
              name="projectThemes"
              required
              placeholder="AI, IoT, Blockchain, etc."
              value={formData.projectThemes}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Project Tracks (comma separated)
            </label>
            <input
              type="text"
              name="projectTracks"
              required
              placeholder="Web, Mobile, Hardware, etc."
              value={formData.projectTracks}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            GitHub Repository URL
          </label>
          <input
            type="url"
            name="githubUrl"
            required
            placeholder="https://github.com/your-username/your-repo"
            value={formData.githubUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Presentation URL (Drive/Canva/Slides)
            </label>
            <input
              type="url"
              name="presentationUrl"
              required
              placeholder="https://..."
              value={formData.presentationUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Demo Video URL (YouTube/Drive)
            </label>
            <input
              type="url"
              name="demoVideoUrl"
              required
              placeholder="https://..."
              value={formData.demoVideoUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none text-foreground"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Submit for Evaluation
          </button>
        </div>
      </form>
    </div>
  );
}
