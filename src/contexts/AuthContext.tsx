import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { AuthService } from '@/lib/services/auth-service';
import { User } from '@/lib/models';
import Cookies from 'js-cookie';
import supabase from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, restaurantName: string) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  registerCustomer: (name: string, email: string, phone: string, password: string, restaurantSlug: string) => Promise<boolean>;
  customerLogin: (email: string, password: string, restaurantSlug: string) => Promise<boolean>;
  isLoading: boolean;
  isTokenValid: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Nome do cookie para autenticação
const AUTH_TOKEN_COOKIE = 'comandeja_auth_token';
// Intervalo para verificar a validade do token (a cada 2 minutos)
const TOKEN_CHECK_INTERVAL = 2 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const { toast } = useToast();
  
  // Função para verificar sessão (encapsulada com useCallback para poder reutilizar)
  const checkSession = useCallback(async () => {
    try {
      // Usar o AuthService para verificar se há um usuário autenticado
      const currentUser = await AuthService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setIsTokenValid(true);
      } else {
        // Se não houver usuário, deslogar
        setUser(null);
        setIsTokenValid(false);
      }
      
      return currentUser;
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      // Em caso de erro, deslogar
      setUser(null);
      setIsTokenValid(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Função para atualizar a sessão (pode ser chamada a qualquer momento)
  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    await checkSession();
  }, [checkSession]);
  
  // Verificar se há uma sessão ativa ao carregar a aplicação
  useEffect(() => {
    // Fazer a verificação inicial
    checkSession();
    
    // Configurar verificação periódica de token
    const tokenCheckInterval = setInterval(() => {
      checkSession();
    }, TOKEN_CHECK_INTERVAL);
    
    // Adicionar listener para quando a página fica visível novamente (ex: troca de aba)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Limpar intervalos e listeners na desmontagem
    return () => {
      clearInterval(tokenCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkSession]);
  
  // Restaurant owner login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Usar o serviço de autenticação com PostgreSQL
      const result = await AuthService.login(email, password);
      
      if (!result.user) {
        toast({
          title: "Login falhou",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive"
        });
        setIsTokenValid(false);
        return false;
      }
      
      setUser(result.user);
      setIsTokenValid(true);
      
      // Verificar se o restaurante tem informações completas
      try {
        const restaurantResponse = await fetch(`/api/restaurants/${result.user.restaurantId}`);
        if (restaurantResponse.ok) {
          const restaurantData = await restaurantResponse.json();
          // Se o restaurante não tiver endereço ou telefone, definir flag para completar o cadastro
          if (!restaurantData.address || !restaurantData.phone) {
            sessionStorage.setItem('is_new_registration', 'true');
            console.log('Perfil incompleto detectado. Será necessário completar o cadastro.');
          }
        } else {
          // Se houver algum erro ao buscar o restaurante, também marcar para completar cadastro
          sessionStorage.setItem('is_new_registration', 'true');
        }
      } catch (error) {
        console.error('Erro ao verificar dados do restaurante:', error);
        // Em caso de erro, também marcar para completar cadastro
        sessionStorage.setItem('is_new_registration', 'true');
      }
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
      
      return true;
    } catch (error) {
      console.error('Login falhou', error);
      toast({
        title: "Login falhou",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
      setIsTokenValid(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Restaurant owner registration
  const register = async (name: string, email: string, password: string, restaurantName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Iniciando registro via AuthContext:', { name, email, restaurantName });
      
      // Verificar se o servidor está operacional
      try {
        const statusResponse = await fetch(`${window.location.origin}/api/status`);
        if (!statusResponse.ok) {
          console.error('Servidor não está respondendo corretamente. Status:', statusResponse.status);
        } else {
          const statusData = await statusResponse.json();
          console.log('Status do servidor:', statusData);
        }
      } catch (statusError) {
        console.warn('Não foi possível verificar o status do servidor:', statusError);
      }
      
      // Tentar o registro
      const result = await AuthService.register(name, email, password, restaurantName);
      
      if (!result.user) {
        toast({
          title: "Registro falhou",
          description: result.error || "Erro ao criar conta.",
          variant: "destructive"
        });
        return false;
      }
      
      // Registro bem-sucedido
      setUser(result.user);
      setIsTokenValid(true);
      
      toast({
        title: "Registro bem-sucedido",
        description: "Sua conta foi criada com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Registro falhou', error);
      toast({
        title: "Registro falhou",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Request password reset
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await AuthService.requestPasswordReset(email);
      
      if (!result.success) {
        toast({
          title: "Falha na solicitação",
          description: result.error || "Erro ao solicitar redefinição de senha.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Solicitação enviada",
        description: "Verifique seu email para instruções de redefinição de senha.",
      });
      
      return true;
    } catch (error) {
      console.error('Solicitação de redefinição falhou', error);
      toast({
        title: "Falha na solicitação",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await AuthService.resetPassword(token, newPassword);
      
      if (!result.success) {
        toast({
          title: "Falha na redefinição",
          description: result.error || "Erro ao redefinir senha.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi alterada com sucesso. Você já pode fazer login.",
      });
      
      return true;
    } catch (error) {
      console.error('Redefinição de senha falhou', error);
      toast({
        title: "Falha na redefinição",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Customer registration
  const registerCustomer = async (name: string, email: string, phone: string, password: string, restaurantSlug: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await AuthService.registerCustomer(name, email, phone, password, restaurantSlug);
      
      if (!result.success) {
        toast({
          title: "Registro falhou",
          description: result.error || "Erro ao criar conta.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Registro bem-sucedido",
        description: "Sua conta foi criada com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Registro de cliente falhou', error);
      toast({
        title: "Registro falhou",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Customer login
  const customerLogin = async (email: string, password: string, restaurantSlug: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Usar o serviço de autenticação com PostgreSQL
      const result = await AuthService.customerLogin(email, password, restaurantSlug);
      
      if (!result.user) {
        toast({
          title: "Login falhou",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive"
        });
        setIsTokenValid(false);
        return false;
      }
      
      setUser(result.user);
      setIsTokenValid(true);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
      
      return true;
    } catch (error) {
      console.error('Login de cliente falhou', error);
      toast({
        title: "Login falhou",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
      setIsTokenValid(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    try {
      setIsLoading(true);
      
      // Confirmar com o usuário antes de sair
      if (typeof window !== 'undefined') {
        // Definir flag para indicar que o logout foi explicitamente solicitado
        sessionStorage.setItem('explicit_logout', 'true');
      }
      
      // Executar logout na API
      AuthService.logout();
      
      // Limpar estado
      setUser(null);
      setIsTokenValid(false);
      
      // Não mostrar toast de confirmação
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      registerCustomer,
      customerLogin,
      isLoading,
      isTokenValid,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
