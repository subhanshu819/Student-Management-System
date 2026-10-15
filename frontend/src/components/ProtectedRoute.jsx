/**
 * ProtectedRoute — wraps routes that require authentication.
 * Redirects unauthenticated users to /login.
 * Shows a centered spinner while auth state is loading.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Icon from '../components/Icon.jsx';

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading, isLoggedIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9ff' }}>
        <div className="flex flex-col items-center gap-3 text-[#434655]">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eff4ff' }}>
            <Icon name="hourglass_empty" size={28} className="text-[#004ac6] animate-spin" />
          </div>
          <span className="text-body-md font-medium">Verifying credentials...</span>
          <span className="text-label-sm text-[#737686]">Connecting to institutional identity server</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Role authorization barrier
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
