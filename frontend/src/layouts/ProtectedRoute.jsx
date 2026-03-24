import { Navigate } from 'react-router-dom';

/**
 * Protects a route by checking localStorage for a logged-in user
 * with the required role. Redirects to /login if not authenticated
 * or to / if the role doesn't match.
 */
function ProtectedRoute({ role, children }) {
  const stored = localStorage.getItem('kuppi_user');
  const user = stored ? JSON.parse(stored) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Wrong role — send to their own home
    return <Navigate to={user.role === 'conductor' ? '/conductor' : '/student'} replace />;
  }

  return children;
}

export default ProtectedRoute;
