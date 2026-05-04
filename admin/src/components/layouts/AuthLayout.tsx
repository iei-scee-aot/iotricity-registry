import { Navigate, Outlet } from "react-router-dom";


const AuthLayout = () => {
  const isAuthenticated = false;
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Outlet />
    </div>
  )
}

export default AuthLayout