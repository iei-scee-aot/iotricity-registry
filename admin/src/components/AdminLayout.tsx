import React from "react";
import { Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, Users, UserRound, FolderKanban } from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6" />
            Admin Panel
          </h2>
        </div>
        <nav className="mt-6">
          <Link
            to="/teams"
            className="flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors"
          >
            <Users className="w-5" />
            Teams
          </Link>
          <Link
            to="/team-members"
            className="flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors"
          >
            <UserRound className="w-5" />
            Team Members
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors"
          >
            <FolderKanban className="w-5" />
            Projects
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut className="w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};
