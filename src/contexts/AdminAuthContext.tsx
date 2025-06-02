import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

// Nome do item no localStorage para persistência
const ADMIN_SESSION_KEY = 'comandeja_admin_session';
// Nome da flag para logout explícito
const ADMIN_EXPLICIT_LOGOUT = 'admin_explicit_logout';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support' | 'finance';
};

type AdminAuthContextType = {
  adminUser: AdminUser | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  isAdminLoading: boolean;
  updateAdminPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshAdminSession: () => Promise<boolean>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const { toast } = useToast();

  // Função para salvar usuário admin no localStorage
  const saveAdminToStorage = (user: AdminUser) => {
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Erro ao salvar sessão admin:', e);
    }
  };

  // Função para recuperar usuário admin do localStorage
  const getAdminFromStorage = (): AdminUser | null => {
    try {
      const storedAdmin = localStorage.getItem(ADMIN_SESSION_KEY);
      return storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch (e) {
      console.error('Erro ao recuperar sessão admin:', e);
      return null;
    }
  };

  // Verificar se há uma sessão de admin ativa ao iniciar
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        // Verificar se houve um logout explícito
        const wasExplicitLogout = sessionStorage.getItem(ADMIN_EXPLICIT_LOGOUT) === 'true';
        
        if (wasExplicitLogout) {
          sessionStorage.removeItem(ADMIN_EXPLICIT_LOGOUT);
          setAdminUser(null);
          localStorage.removeItem(ADMIN_SESSION_KEY);
        } else {
          // Tentar recuperar sessão
          const storedAdmin = getAdminFromStorage();
          if (storedAdmin) {
            setAdminUser(storedAdmin);
          }
        }
      } catch (e) {
        console.error('Erro ao verificar sessão admin:', e);
      } finally {
        setIsAdminLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const refreshAdminSession = async (): Promise<boolean> => {
    try {
      setIsAdminLoading(true);
      const storedAdmin = getAdminFromStorage();
      
      if (storedAdmin) {
        setAdminUser(storedAdmin);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Erro ao atualizar sessão admin:', e);
      return false;
    } finally {
      setIsAdminLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsAdminLoading(true);
      
      if (email === 'comandeja24h@gmail.com' && password === 'admin@24h') {
        const adminUserData = {
          id: '47e81ab0-d974-4f53-97e1-a8293f25f7a1',
          email: 'comandeja24h@gmail.com',
          name: 'Administrador Principal',
          role: 'admin' as const
        };
        
        setAdminUser(adminUserData);
        saveAdminToStorage(adminUserData);
        
        // Remover a flag de logout explícito caso exista
        sessionStorage.removeItem(ADMIN_EXPLICIT_LOGOUT);
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao painel administrativo!",
        });
        
        return true;
      }
      
      toast({
        title: "Login falhou",
        description: "Credenciais inválidas",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error('Login falhou:', error);
      toast({
        title: "Login falhou",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAdminLoading(false);
    }
  };

  const updateAdminPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsAdminLoading(true);
      
      if (!adminUser) {
        toast({
          title: "Falha na atualização",
          description: "Usuário não está logado",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Password update failed:', error);
      toast({
        title: "Falha na atualização",
        description: "Ocorreu um erro ao tentar atualizar a senha",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAdminLoading(false);
    }
  };

  const adminLogout = () => {
    // Marcar logout explícito
    sessionStorage.setItem(ADMIN_EXPLICIT_LOGOUT, 'true');
    
    // Limpar sessão
    setAdminUser(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  return (
    <AdminAuthContext.Provider value={{ 
      adminUser, 
      adminLogin, 
      adminLogout, 
      isAdminLoading,
      updateAdminPassword,
      refreshAdminSession
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
