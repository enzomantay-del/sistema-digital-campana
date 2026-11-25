import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/application/contexts/AuthContext';
import { LoadingScreen } from '@/presentation/components/common/LoadingScreen';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verificando acceso..." />;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};
