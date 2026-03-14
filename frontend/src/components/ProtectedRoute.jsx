import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated, isUserAuthenticated } from '../utils/auth';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  if (requireAdmin) {
    const ok = isAdminAuthenticated();
    if (!ok) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }

  const ok = isUserAuthenticated();
  if (!ok) {
    return <Navigate to="/login" replace />;
  }

  return children;
}