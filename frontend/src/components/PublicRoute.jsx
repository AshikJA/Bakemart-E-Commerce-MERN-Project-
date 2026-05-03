import { Navigate } from 'react-router-dom';
import { isUserAuthenticated, isAdminAuthenticated } from '../utils/auth';

export default function PublicRoute({ children, adminRoute = false }) {
  if (adminRoute) {
    if (isAdminAuthenticated()) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return children;
  }

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (isUserAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
