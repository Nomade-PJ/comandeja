import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

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
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const { toast } = useToast();

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsAdminLoading(true);
      
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({
          title: "Login falhou",
          description: data.message || "Credenciais inválidas",
          variant: "destructive"
        });
        return false;
      }

      setAdminUser(data.user);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao painel administrativo!",
      });
      
      return true;
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

      const response = await fetch('http://localhost:3000/api/admin/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: adminUser.email,
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({
          title: "Falha na atualização",
          description: data.message || "Não foi possível atualizar a senha",
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
    setAdminUser(null);
    toast({
      title: "Logout realizado",
      description: "Você saiu do painel administrativo",
    });
  };

  return (
    <AdminAuthContext.Provider value={{ 
      adminUser, 
      adminLogin, 
      adminLogout, 
      isAdminLoading,
      updateAdminPassword
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
