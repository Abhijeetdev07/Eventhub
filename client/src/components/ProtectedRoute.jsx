import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ redirectTo = '/login', children }) {
  const auth = useAuth();

  if (!auth?.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (children) return children;

  return <Outlet />;
}
