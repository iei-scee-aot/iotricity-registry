import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, RefreshCcw, Search } from "lucide-react";
import { Modal } from "../components/Modal";

interface TeamMember {
  _id: string;
  name: string;
  googleEmail: string;
  collegeEmail: string;
  rollNumber: string;
  semester: number;
  department: string;
  phoneNumber: string;
  teamBuildingProgram: boolean;
  joinedDiscord: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const TeamMembersPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/team-members`);
      setMembers(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch team members");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await axios.patch(`${API_BASE_URL}/team-members/${editingMember.googleEmail}`, editingMember);
      setIsModalOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update member");
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.googleEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button 
            onClick={fetchMembers}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            title="Refresh"
          >
            <RefreshCcw className={`w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-destructive/20 text-destructive rounded-md">{error}</div>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-sm font-semibold">Roll No</th>
                <th className="px-6 py-3 text-sm font-semibold">Dept/Sem</th>
                <th className="px-6 py-3 text-sm font-semibold">Discord</th>
                <th className="px-6 py-3 text-sm font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((member) => (
                <tr key={member._id} className="hover:bg-accent/50 transition-colors text-sm">
                  <td className="px-6 py-4 font-medium">{member.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{member.googleEmail}</span>
                      <span className="text-xs text-muted-foreground">{member.collegeEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">{member.rollNumber}</td>
                  <td className="px-6 py-4">
                    {member.department} / S{member.semester}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      member.joinedDiscord ? 'bg-indigo-500/20 text-indigo-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      {member.joinedDiscord ? 'Joined' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setEditingMember(member); setIsModalOpen(true); }}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingMember(null); }} 
        title="Edit Team Member"
      >
        {editingMember && (
          <form onSubmit={handleUpdateMember} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input 
                type="text" 
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Roll Number</label>
              <input 
                type="text" 
                value={editingMember.rollNumber}
                onChange={(e) => setEditingMember({ ...editingMember, rollNumber: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <input 
                  type="text" 
                  value={editingMember.department}
                  onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <input 
                  type="number" 
                  value={editingMember.semester}
                  onChange={(e) => setEditingMember({ ...editingMember, semester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="discord"
                checked={editingMember.joinedDiscord}
                onChange={(e) => setEditingMember({ ...editingMember, joinedDiscord: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="discord" className="text-sm font-medium">Joined Discord</label>
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
