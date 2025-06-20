import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para verificar e preencher o perfil do usuário
  const ensureUserProfile = async (userId: string) => {
    try {
      // Verificar se o perfil já existe
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar perfil:', error);
        return;
      }

      // Se o perfil não existir, criar um novo
      if (!profile) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        
        if (!user) return;

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: user.user_metadata?.name || '',
            email: user.email,
          });

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar/criar perfil:', err);
    }
  };

  useEffect(() => {
    console.log('Inicializando AuthContext');
    
    // Verificar sessão atual
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Usuário já autenticado:', session.user.email);
          // Verificar se o usuário tem um perfil
          await ensureUserProfile(session.user.id);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de autenticação:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Verificar se o usuário tem um perfil quando fizer login
        await ensureUserProfile(session.user.id);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } finally {
      // O estado isLoading será atualizado pelo evento onAuthStateChange
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'customer') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            role: role
          }
        }
      });
      
      return { error };
    } finally {
      // O estado isLoading será atualizado pelo evento onAuthStateChange
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    // O estado isLoading será atualizado pelo evento onAuthStateChange
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 