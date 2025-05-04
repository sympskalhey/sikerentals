
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-garage-blue"></div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
