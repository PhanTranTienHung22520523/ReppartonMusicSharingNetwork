import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ 
  children, 
  requireAuth = false,
  requireArtist = false, 
  requireAdmin = false 
}) {
  const { user, isAuthenticated, isArtist, isAdmin } = useAuth();

  // Check if user is authenticated
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has artist role
  if (requireArtist && !isArtist()) {
    return <Navigate to="/" replace />;
  }

  // Check if user has admin role
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
