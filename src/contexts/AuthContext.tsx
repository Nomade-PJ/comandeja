
import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  restaurantId?: string;
  restaurantSlug?: string; // Added restaurant slug for subdomain
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, restaurantName: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
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
        restaurantSlug
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
        restaurantSlug
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

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
