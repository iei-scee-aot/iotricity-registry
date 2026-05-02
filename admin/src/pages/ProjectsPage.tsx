import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, RefreshCcw, ExternalLink } from "lucide-react";
import { Modal } from "../components/Modal";

interface Project {
  _id: string;
  projectName: string;
  projectThemes: string[];
  projectTracks: string[];
  teamSecret: string;
  round: number;
  githubUrl: string;
  presentationUrl: string;
  demoVideoUrl: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProjects(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      await axios.patch(`${API_BASE_URL}/projects/${editingProject.teamSecret}/${editingProject.round}`, editingProject);
      setIsModalOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update project.");
    }
  };

  const handleDeleteProject = async (teamSecret: string, round: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/projects/${teamSecret}/${round}`, {
        data: { teamLeaderEmail: "admin@system.com" }
      });
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button 
          onClick={fetchProjects}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          title="Refresh"
        >
          <RefreshCcw className={`w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <div className="p-4 bg-destructive/20 text-destructive rounded-md">{error}</div>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Project Name</th>
                <th className="px-6 py-3 text-sm font-semibold">Themes/Tracks</th>
                <th className="px-6 py-3 text-sm font-semibold">Round</th>
                <th className="px-6 py-3 text-sm font-semibold">Links</th>
                <th className="px-6 py-3 text-sm font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-accent/50 transition-colors text-sm">
                  <td className="px-6 py-4">
                    <div className="font-medium">{project.projectName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{project.teamSecret}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.projectThemes.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px]">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">Round {project.round}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" title="GitHub">
                        <ExternalLink className="w-4" />
                      </a>
                      <a href={project.presentationUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" title="Presentation">
                        <ExternalLink className="w-4 text-blue-400" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setEditingProject(project); setIsModalOpen(true); }}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project.teamSecret, project.round)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingProject(null); }} 
        title="Edit Project"
      >
        {editingProject && (
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <input 
                type="text" 
                value={editingProject.projectName}
                onChange={(e) => setEditingProject({ ...editingProject, projectName: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub URL</label>
              <input 
                type="url" 
                value={editingProject.githubUrl}
                onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Presentation URL</label>
              <input 
                type="url" 
                value={editingProject.presentationUrl}
                onChange={(e) => setEditingProject({ ...editingProject, presentationUrl: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
