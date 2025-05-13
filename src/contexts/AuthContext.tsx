
import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

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
      
      // Mock login - in a real app, this would be a PostgreSQL query
      // Wait 1 second to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a restaurant slug based on email (in a real app, would be fetched from DB)
      const restaurantSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');

      // Create a sample user
      const mockUser: User = {
        id: '1',
        name: 'Restaurant Owner',
        email,
        restaurantId: 'resto-1',
        restaurantSlug,
        role: 'owner'
      };

      setUser(mockUser);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      return true;
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
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
      
      // Mock registration - in a real app, this would be a PostgreSQL insertion
      // Wait 1 second to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a restaurant slug based on restaurant name
      const restaurantSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-');

      // Create a new user
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        restaurantId: `resto-${Date.now()}`,
        restaurantSlug,
        role: 'owner'
      };

      setUser(mockUser);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      toast({
        title: "Registration failed",
        description: "Please try again later.",
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
      
      // Mock API call - in a real app this would send a reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password reset requested",
        description: "If an account exists with this email, you will receive reset instructions.",
      });
      
      return true;
    } catch (error) {
      console.error('Password reset request failed', error);
      toast({
        title: "Request failed",
        description: "Please try again later.",
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
      
      // Mock API call - in a real app this would validate the token and update password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now login with your new password.",
      });
      
      return true;
    } catch (error) {
      console.error('Password reset failed', error);
      toast({
        title: "Reset failed",
        description: "Invalid or expired token. Please request a new reset link.",
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
      
      // Mock customer registration - in a real app, this would be a PostgreSQL insertion
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a new customer user
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'customer'
      };

      setUser(mockUser);
      
      toast({
        title: "Registration successful",
        description: "Your customer account has been created!",
      });
      
      return true;
    } catch (error) {
      console.error('Customer registration failed', error);
      toast({
        title: "Registration failed",
        description: "Please try again later.",
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
      
      // Mock customer login - in a real app, this would be a PostgreSQL query
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a sample customer user
      const mockUser: User = {
        id: Date.now().toString(),
        name: 'Customer User',
        email,
        role: 'customer'
      };

      setUser(mockUser);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      return true;
    } catch (error) {
      console.error('Customer login failed', error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
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
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading,
      requestPasswordReset,
      resetPassword,
      registerCustomer,
      customerLogin
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
