import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { FullPageLoader } from './FullPageLoader';

export function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Login/register: signed-in users go straight to the app. */
export function GuestRoute() {
  const { user, initializing } = useAuth();
  if (initializing) return <FullPageLoader />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
