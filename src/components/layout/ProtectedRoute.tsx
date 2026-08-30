import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import Spinner from '@/components/ui/Spinner';

/**
 * Everything under /app requires a session — the product rule is that you can
 * refer without an account, but you must sign in to see any detail.
 * `adminOnly` additionally gates the oversight screens.
 */
export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking your session…" />
      </div>
    );
  }

  if (!session) {
    // Remember where they were headed so sign-in can send them back.
    return <Navigate to="/sign-in" replace state={{ from: location.pathname + location.search }} />;
  }

  if (adminOnly && !profile?.isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
