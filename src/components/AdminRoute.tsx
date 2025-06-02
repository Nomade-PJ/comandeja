import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { adminUser, isAdminLoading, refreshAdminSession } = useAdminAuth();
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [forceAuth, setForceAuth] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const verifySession = async () => {
      // Verificar se houve um logout explícito
      const wasExplicitLogout = sessionStorage.getItem('admin_explicit_logout') === 'true';
      
      if (wasExplicitLogout) {
        // Se o usuário fez logout explicitamente, não recuperar a sessão
        sessionStorage.removeItem('admin_explicit_logout');
        setIsVerifyingSession(false);
        setForceAuth(false);
        return;
      }
      
      if (adminUser) {
        // Se já temos o usuário admin, podemos continuar
        setIsVerifyingSession(false);
        setForceAuth(true);
      } else {
        // Tentar recuperar a sessão
        const sessionRecovered = await refreshAdminSession();
        setForceAuth(sessionRecovered);
        setIsVerifyingSession(false);
      }
    };
    
    verifySession();
    
    // Verificar se a página foi recarregada com uma sessão válida
    const checkReload = () => {
      try {
        const wasAuthenticated = sessionStorage.getItem('admin_was_authenticated');
        if (wasAuthenticated === 'true') {
          setForceAuth(true);
        }
      } catch (e) {
        console.error("Erro ao verificar estado anterior de autenticação:", e);
      }
    };
    
    checkReload();
    
    // Se a página for recarregada, tentar recuperar a sessão novamente
    const handleBeforeUnload = () => {
      try {
        // Verificar se o logout foi explícito
        const wasExplicitLogout = sessionStorage.getItem('admin_explicit_logout') === 'true';
        
        if (!wasExplicitLogout && adminUser) {
          // Somente armazenar status de autenticação se não foi logout explícito e há um usuário
          sessionStorage.setItem('admin_was_authenticated', 'true');
        }
      } catch (e) {
        console.error("Erro ao armazenar estado de autenticação:", e);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [adminUser, refreshAdminSession]);
  
  // Mostrar tela de loading enquanto verifica a sessão
  if (isVerifyingSession || isAdminLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }
  
  // Se estamos forçando a autenticação (devido ao localStorage) ou temos um usuário admin
  if (forceAuth || adminUser) {
    return <>{children}</>;
  }
  
  // Caso contrário, redirecionar para o login admin
  return <Navigate to="/admin/login" state={{ from: location }} replace />;
};

export default AdminRoute;
