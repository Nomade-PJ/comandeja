import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import supabase from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// Constante para o cookie de autenticação
const AUTH_TOKEN_COOKIE = 'comandeja_auth_token';
const SB_COOKIE_PREFIX = 'sb-';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading, isTokenValid, refreshSession } = useAuth();
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [forceAuth, setForceAuth] = useState(false);
  const location = useLocation();
  
  // Adicionando logs para debug
  console.log('PrivateRoute: Current Path:', location.pathname);
  console.log('PrivateRoute: User:', user);
  console.log('PrivateRoute: IsLoading:', isLoading);
  console.log('PrivateRoute: IsTokenValid:', isTokenValid);
  console.log('PrivateRoute: ForceAuth:', forceAuth);
  console.log('PrivateRoute: IsVerifyingSession:', isVerifyingSession);
  
  // Verificação rápida de cookies para evitar redirecionamento indevido
  const hasCookies = (): boolean => {
    try {
      // Verificar cookies do Supabase
      const allCookies = document.cookie;
      const hasSupabaseCookie = allCookies.split(';').some(c => 
        c.trim().startsWith(SB_COOKIE_PREFIX) || 
        c.trim().startsWith(AUTH_TOKEN_COOKIE)
      );
      
      // Verificar cookies da aplicação
      const appCookie = Cookies.get(AUTH_TOKEN_COOKIE);
      
      console.log('PrivateRoute: Has Supabase Cookies:', hasSupabaseCookie);
      console.log('PrivateRoute: Has App Cookie:', !!appCookie);
      
      return hasSupabaseCookie || !!appCookie;
    } catch (e) {
      console.error("Erro ao verificar cookies:", e);
      return false;
    }
  };
  
  // Verificação mais aprofundada que tenta recuperar a sessão
  const attemptSessionRecovery = async (): Promise<boolean> => {
    try {
      // Verificar se há uma sessão ativa no Supabase
      const { data } = await supabase.auth.getSession();
      console.log('PrivateRoute: Supabase Session:', data.session);
      
      if (data.session) {
        return true;
      }
      
      // Tentar usar cookies existentes
      if (hasCookies()) {
        await refreshSession();
        return true;
      }
      
      return false;
    } catch (e) {
      console.error("Erro ao recuperar sessão:", e);
      return false;
    }
  };
  
  useEffect(() => {
    const verifySession = async () => {
      // Verificar se houve um logout explícito
      const wasExplicitLogout = sessionStorage.getItem('explicit_logout') === 'true';
      console.log('PrivateRoute: Was Explicit Logout:', wasExplicitLogout);
      
      if (wasExplicitLogout) {
        // Se o usuário fez logout explicitamente, não recuperar a sessão
        sessionStorage.removeItem('explicit_logout');
        setIsVerifyingSession(false);
        setForceAuth(false);
        return;
      }
      
      if (user) {
        // Se já temos o usuário, podemos continuar
        console.log('PrivateRoute: User already authenticated');
        setIsVerifyingSession(false);
        setForceAuth(true);
      } else if (hasCookies()) {
        // Se há cookies, tentar recuperar a sessão antes de redirecionar
        console.log('PrivateRoute: Has cookies, attempting recovery');
        const recovered = await attemptSessionRecovery();
        console.log('PrivateRoute: Session recovered:', recovered);
        setForceAuth(recovered);
        setIsVerifyingSession(false);
      } else {
        // Não há indícios de sessão
        console.log('PrivateRoute: No session indicators found');
        setIsVerifyingSession(false);
        setForceAuth(false);
      }
    };
    
    verifySession();
    
    // Se a página for recarregada, tentar recuperar a sessão novamente
    const handleBeforeUnload = () => {
      try {
        // Verificar se o logout foi explícito
        const wasExplicitLogout = sessionStorage.getItem('explicit_logout') === 'true';
        
        if (!wasExplicitLogout) {
          // Somente armazenar status de autenticação se não foi logout explícito
          sessionStorage.setItem('was_authenticated', hasCookies() ? 'true' : 'false');
        }
      } catch (e) {
        console.error("Erro ao armazenar estado de autenticação:", e);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Verificar se a página foi recarregada com uma sessão válida
    const checkReload = () => {
      try {
        // Verificar se o logout foi explícito
        const wasExplicitLogout = sessionStorage.getItem('explicit_logout') === 'true';
        
        if (!wasExplicitLogout) {
          const wasAuthenticated = sessionStorage.getItem('was_authenticated');
          console.log('PrivateRoute: Was authenticated before reload:', wasAuthenticated);
          if (wasAuthenticated === 'true') {
            setForceAuth(true);
          }
        }
      } catch (e) {
        console.error("Erro ao verificar estado anterior de autenticação:", e);
      }
    };
    
    checkReload();
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, refreshSession]);
  
  // Mostrar tela de loading somente no primeiro carregamento
  if (isVerifyingSession) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }
  
  // Se estamos forçando a autenticação (devido a cookies) ou temos um usuário válido, mostrar a rota protegida
  if (forceAuth || (user && isTokenValid)) {
    console.log('PrivateRoute: Authentication successful, rendering children');
    return <>{children}</>;
  }
  
  // Caso contrário, redirecionar para o login
  console.log('PrivateRoute: Authentication failed, redirecting to login');
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
