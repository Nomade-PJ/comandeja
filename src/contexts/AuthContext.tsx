import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { AuthService } from '@/lib/services/auth-service';

type User = {
  id: string;
  name: string;
  email: string;
  restaurantId?: string;
  restaurantSlug?: string; // Added restaurant slug for subdomain
  role?: 'owner' | 'customer' | 'team_member';
};

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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Restaurant owner login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Usar o serviço de autenticação com PostgreSQL
      const loggedUser = await AuthService.login(email, password);
      
      if (!loggedUser) {
        toast({
          title: "Login falhou",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive"
        });
        return false;
      }
      
      // Converter formato para o padrão do nosso contexto
      const contextUser: User = {
        id: loggedUser.id,
        name: loggedUser.name,
        email: loggedUser.email,
        restaurantId: loggedUser.restaurantId,
        restaurantSlug: loggedUser.restaurantSlug,
        role: 'owner'
      };
      
      setUser(contextUser);
      
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
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Restaurant registration
  const register = async (name: string, email: string, password: string, restaurantName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Usar o serviço de autenticação com PostgreSQL
      const newUser = await AuthService.register(name, email, password, restaurantName);
      
      if (!newUser) {
        toast({
          title: "Registro falhou",
          description: "Não foi possível criar sua conta. O email já pode estar em uso.",
          variant: "destructive"
        });
        return false;
      }
      
      // Converter formato para o padrão do nosso contexto
      const contextUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        restaurantId: newUser.restaurantId,
        restaurantSlug: newUser.restaurantSlug,
        role: 'owner'
      };
      
      setUser(contextUser);
      
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
      
      // Usar o serviço de autenticação com PostgreSQL
      const success = await AuthService.requestPasswordReset(email);
      
      toast({
        title: "Redefinição de senha solicitada",
        description: "Se uma conta existir com este email, você receberá instruções de redefinição.",
      });
      
      return success;
    } catch (error) {
      console.error('Solicitação de redefinição de senha falhou', error);
      toast({
        title: "Solicitação falhou",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password with token
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Usar o serviço de autenticação com PostgreSQL
      const success = await AuthService.resetPassword(token, newPassword);
      
      if (!success) {
        toast({
          title: "Redefinição falhou",
          description: "Token inválido ou expirado. Por favor, solicite um novo link de redefinição.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Senha redefinida com sucesso",
        description: "Sua senha foi atualizada. Você pode agora fazer login com sua nova senha.",
      });
      
      return true;
    } catch (error) {
      console.error('Redefinição de senha falhou', error);
      toast({
        title: "Redefinição falhou",
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
      
      // Usar o serviço de autenticação com PostgreSQL
      const success = await AuthService.registerCustomer(name, email, phone, password, restaurantSlug);
      
      if (!success) {
        toast({
          title: "Registro falhou",
          description: "Não foi possível criar sua conta de cliente.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Registro bem-sucedido",
        description: "Sua conta de cliente foi criada com sucesso!",
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
      const customerUser = await AuthService.customerLogin(email, password, restaurantSlug);
      
      if (!customerUser) {
        toast({
          title: "Login falhou",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive"
        });
        return false;
      }
      
      // Converter formato para o padrão do nosso contexto
      const contextUser: User = {
        id: customerUser.id,
        name: customerUser.name,
        email: customerUser.email,
        restaurantId: customerUser.restaurantId,
        role: 'customer'
      };
      
      setUser(contextUser);
      
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
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        registerCustomer,
        customerLogin,
        isLoading
      }}
    >
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
