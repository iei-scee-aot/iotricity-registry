import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AdminLayout } from "./components/AdminLayout";
import { TeamsPage } from "./pages/TeamsPage";
import { TeamMembersPage } from "./pages/TeamMembersPage";
import { ProjectsPage } from "./pages/ProjectsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/teams" replace />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="team-members" element={<TeamMembersPage />} />
            <Route path="projects" element={<ProjectsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
