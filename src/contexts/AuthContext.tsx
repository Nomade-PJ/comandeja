import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, logDebug } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { signIn, signUp, signOut, resetSessionTimers, setupSessionMonitoring } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<any>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
    logDebug('Inicializando AuthContext');
    
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        setSession(data.session);
        setUser(data.session?.user || null);

        if (data.session) {
          // Verificar se o usuário tem um perfil
          await ensureUserProfile(data.session.user.id);
          // Iniciar monitoramento de sessão se o usuário estiver autenticado
          setupSessionMonitoring();
        }
      } catch (error: any) {
        console.error('Erro ao obter sessão:', error.message);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Configurar o listener de mudança de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      if (session) {
        // Reiniciar os timers de sessão quando o estado de autenticação mudar
        resetSessionTimers();
        // Verificar se o usuário tem um perfil quando fizer login
        ensureUserProfile(session.user.id);
      }
    });

    // Cleanup do listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Erro de login:', error.message);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string, role: string = 'restaurant_owner') => {
    try {
      setLoading(true);
      const { error } = await signUp(email, password, fullName, role);
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Erro de registro:', error.message);
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error: any) {
      console.error('Erro ao sair:', error.message);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
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