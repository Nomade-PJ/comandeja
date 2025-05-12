
import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const { toast } = useToast();
  
  // Check if admin is logged in on mount
  useEffect(() => {
    const storedAdminUser = localStorage.getItem('comandeJaAdminUser');
    
    if (storedAdminUser) {
      try {
        setAdminUser(JSON.parse(storedAdminUser));
      } catch (error) {
        console.error('Failed to parse admin user data', error);
        localStorage.removeItem('comandeJaAdminUser');
      }
    }
    
    setIsAdminLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsAdminLoading(true);
      
      // In a real app, this would validate against the database
      // For now we'll hardcode the admin credentials
      if (email === 'admin@comandeja.com' && password === 'comandeja@24h') {
        const adminUser: AdminUser = {
          id: 'admin-1',
          name: 'Administrador',
          email: 'admin@comandeja.com',
          role: 'admin'
        };

        setAdminUser(adminUser);
        localStorage.setItem('comandeJaAdminUser', JSON.stringify(adminUser));
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao painel administrativo do ComandeJá!",
        });
        
        return true;
      } else {
        toast({
          title: "Falha no login",
          description: "Credenciais inválidas. Por favor, tente novamente.",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      console.error('Admin login failed', error);
      toast({
        title: "Falha no login",
        description: "Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.",
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
      
      // Verify current password is correct
      if (currentPassword !== 'comandeja@24h') {
        toast({
          title: "Falha na atualização",
          description: "Senha atual incorreta.",
          variant: "destructive"
        });
        return false;
      }
      
      // In a real app, this would update the password in the database
      // For demo purposes, we'll just show a success message
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      // Note: In a real implementation, we would update the stored password
      // and require re-login with the new password
      
      return true;
    } catch (error) {
      console.error('Password update failed', error);
      toast({
        title: "Falha na atualização",
        description: "Ocorreu um erro ao tentar atualizar a senha.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAdminLoading(false);
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('comandeJaAdminUser');
    toast({
      title: "Logout realizado",
      description: "Você saiu do painel administrativo.",
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

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
