import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, RefreshCcw } from "lucide-react";
import { Modal } from "../components/Modal";

interface Team {
  _id: string;
  teamName: string;
  teamSecret: string;
  registrationStatus: string;
  teamLeader: any;
  teamMembers: any[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ teamName: "", teamLeaderEmail: "" });

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`);
      setTeams(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch teams");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/teams`, newTeam);
      setIsModalOpen(false);
      setNewTeam({ teamName: "", teamLeaderEmail: "" });
      fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create team");
    }
  };

  const handleDelete = async (teamSecret: string) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    
    const team = teams.find(t => t.teamSecret === teamSecret);
    if (!team) return;

    try {
      await axios.delete(`${API_BASE_URL}/teams/${teamSecret}`, {
        data: { teamLeaderEmail: team.teamLeader?.googleEmail }
      });
      fetchTeams();
    } catch (err) {
      alert("Failed to delete team. Make sure it's UNREGISTERED.");
    }
  };

  const handleUpdateStatus = async (teamSecret: string, currentStatus: string) => {
    const statuses = ["UNREGISTERED", "REGISTERED", "PAID", "VERIFIED"];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    
    try {
      await axios.patch(`${API_BASE_URL}/teams/${teamSecret}/status`, {
        registrationStatus: nextStatus
      });
      fetchTeams();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teams</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            <Plus className="w-4" />
            Create Team
          </button>
          <button 
            onClick={fetchTeams}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            title="Refresh"
          >
            <RefreshCcw className={`w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-destructive/20 text-destructive rounded-md">{error}</div>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold">Team Name</th>
              <th className="px-6 py-3 text-sm font-semibold">Secret</th>
              <th className="px-6 py-3 text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-sm font-semibold">Leader</th>
              <th className="px-6 py-3 text-sm font-semibold">Members</th>
              <th className="px-6 py-3 text-sm font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teams.map((team) => (
              <tr key={team._id} className="hover:bg-accent/50 transition-colors">
                <td className="px-6 py-4">{team.teamName}</td>
                <td className="px-6 py-4 font-mono text-xs">{team.teamSecret}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    team.registrationStatus === 'VERIFIED' ? 'bg-green-500/20 text-green-500' :
                    team.registrationStatus === 'PAID' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {team.registrationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{team.teamLeader?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{team.teamMembers?.length || 0}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleUpdateStatus(team.teamSecret, team.registrationStatus)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title="Cycle Status"
                  >
                    <Pencil className="w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(team.teamSecret)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {teams.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                  No teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Name</label>
            <input 
              type="text" 
              value={newTeam.teamName}
              onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Leader Email (Google)</label>
            <input 
              type="email" 
              value={newTeam.teamLeaderEmail}
              onChange={(e) => setNewTeam({ ...newTeam, teamLeaderEmail: e.target.value })}
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
              Create Team
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
