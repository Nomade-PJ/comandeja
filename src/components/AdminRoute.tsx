
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { adminUser, isAdminLoading } = useAdminAuth();
  
  if (isAdminLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }
  
  return adminUser ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
