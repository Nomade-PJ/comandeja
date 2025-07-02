import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean; // Opcional: para rotas que exigem admin
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiresAdmin = false
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) return;
      if (!user) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }
      const isProfilePage = location.pathname === '/perfil';
      if (isProfilePage) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }
      try {
        let profileData = null;
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (error) {
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  full_name: user.user_metadata?.name || '',
                  email: user.email,
                  role: user.user_metadata?.role || 'customer',
                  updated_at: new Date().toISOString(),
                }
              ])
              .select('role')
              .single();
            if (createError) {
              const metadataRole = user.user_metadata?.role;
              if (metadataRole === 'admin' || metadataRole === 'restaurant_owner') {
                if (requiresAdmin && metadataRole !== 'admin') {
                  setIsAuthorized(false);
                } else {
                  setIsAuthorized(true);
                }
              } else {
                setIsAuthorized(false);
              }
              setIsChecking(false);
              return;
            }
            profileData = newProfile;
          } else {
            const metadataRole = user.user_metadata?.role;
            if (metadataRole === 'admin' || metadataRole === 'restaurant_owner') {
              if (requiresAdmin && metadataRole !== 'admin') {
                setIsAuthorized(false);
              } else {
                setIsAuthorized(true);
              }
            } else {
              setIsAuthorized(false);
            }
            setIsChecking(false);
            return;
          }
        } else {
          profileData = data;
        }
        const userRole = profileData?.role;
        const isDashboardRoute = location.pathname.startsWith('/dashboard');
        if (isDashboardRoute) {
          if (userRole === 'customer') {
            setIsAuthorized(false);
          } else if (requiresAdmin && userRole !== 'admin') {
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(true);
        }
      } catch (err) {
        setIsAuthorized(false);
      }
      setIsChecking(false);
    };
    checkAuthorization();
  }, [user, loading, location.pathname, requiresAdmin]);

  // Mostrar um estado de carregamento enquanto verificamos a autenticação
  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-primary/30 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não estiver autorizado, redirecionar para a página configurada
  if (!isAuthorized) {
    return <Navigate to={redirectPath} state={{ message: "Acesso negado." }} replace />;
  }

  // Se estiver autenticado e autorizado, renderizar o conteúdo protegido
  return <>{children}</>;
}; 