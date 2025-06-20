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
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    const checkAuthorization = async () => {
      if (isLoading) return;

      // Se não houver usuário, não está autorizado
      if (!user) {
        console.log("Usuário não autenticado, redirecionando para login");
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // Verificar se estamos acessando a página de perfil
      const isProfilePage = location.pathname === '/perfil';

      // Se for página de perfil, sempre permitir acesso para usuários autenticados
      if (isProfilePage) {
        console.log("Acesso à página de perfil autorizado para usuário autenticado");
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      try {
        // Verificar o papel do usuário
        console.log("Verificando papel do usuário:", user.id);
        let profileData = null;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar perfil:', error);
          
          // Se o erro for que não existe registro na tabela profiles
          if (error.code === 'PGRST116') {
            console.log('Perfil não encontrado, criando um novo...');
            
            // Criar um novo perfil para o usuário
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
              console.error('Erro ao criar novo perfil:', createError);
          setIsAuthorized(false);
          setIsChecking(false);
          return;
            }
            
            console.log('Novo perfil criado com sucesso:', newProfile);
            
            // Use o papel do novo perfil
            profileData = newProfile;
          } else {
            setIsAuthorized(false);
            setIsChecking(false);
            return;
          }
        } else {
          profileData = data;
        }

        // Determinar se o usuário tem acesso com base no papel
        const userRole = profileData?.role;
        console.log("Papel do usuário:", userRole);

        // Verificar se está tentando acessar o dashboard
        const isDashboardRoute = location.pathname.startsWith('/dashboard');

        if (isDashboardRoute) {
          // Para rotas do dashboard, apenas admin e proprietários têm acesso
          if (userRole === 'customer') {
            toast({
              title: "Acesso restrito",
              description: "Apenas administradores e proprietários de restaurantes podem acessar o dashboard.",
              variant: "destructive",
            });
            
            // Se for cliente, redirecionar para seu restaurante registrado
            const registeredRestaurantId = user.user_metadata?.registered_restaurant_id;
            if (registeredRestaurantId) {
              // Buscar slug do restaurante
              const { data: restaurant } = await supabase
                .from('restaurants')
                .select('slug')
                .eq('id', registeredRestaurantId)
                .single();
                
              if (restaurant?.slug) {
                setRedirectPath(`/restaurante/${restaurant.slug}`);
              }
            }
            
            setIsAuthorized(false);
          } else if (requiresAdmin && userRole !== 'admin') {
            // Se a rota requer admin, verificar se o usuário é admin
            toast({
              title: "Acesso restrito",
              description: "Esta área é restrita apenas para administradores.",
              variant: "destructive",
            });
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        } else {
          // Para rotas que não são do dashboard, autoriza qualquer usuário logado
          setIsAuthorized(true);
        }
      } catch (err) {
        console.error('Erro ao verificar autorização:', err);
        setIsAuthorized(false);
      }

      setIsChecking(false);
    };

    checkAuthorization();
  }, [user, isLoading, location.pathname, requiresAdmin]);

  // Mostrar um estado de carregamento enquanto verificamos a autenticação
  if (isChecking || isLoading) {
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