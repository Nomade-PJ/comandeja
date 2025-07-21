import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface AuthContext {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, role?: string, restaurantId?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}

// Configurações de sessão
export const SESSION_CONFIG = {
  // Tempo máximo de inatividade antes de exigir nova autenticação (em milissegundos)
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  
  // Tempo máximo de vida da sessão, independente da atividade (em milissegundos)
  SESSION_MAX_DURATION: 24 * 60 * 60 * 1000, // 24 horas
  
  // Quanto tempo antes da expiração deve-se tentar renovar o token (em milissegundos)
  RENEW_BEFORE_EXPIRY: 5 * 60 * 1000, // 5 minutos
};

// Variáveis para controle de sessão
let lastActivity = Date.now();
let sessionStartTime = Date.now();
let tokenRenewalTimeout: NodeJS.Timeout | null = null;

// Atualiza o timestamp da última atividade
export function updateActivity() {
  lastActivity = Date.now();
}

// Verifica se a sessão expirou por inatividade
export function hasSessionExpiredByInactivity(): boolean {
  return Date.now() - lastActivity > SESSION_CONFIG.INACTIVITY_TIMEOUT;
}

// Verifica se a sessão excedeu a duração máxima
export function hasSessionExceededMaxDuration(): boolean {
  return Date.now() - sessionStartTime > SESSION_CONFIG.SESSION_MAX_DURATION;
}

// Gerencia a renovação automática de tokens
export function setupTokenRenewal() {
  // Limpa qualquer timeout existente
  if (tokenRenewalTimeout) {
    clearTimeout(tokenRenewalTimeout);
  }
  
  // Obtém a sessão atual
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      // Calcula quando o token irá expirar
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAt - Date.now();
      
      // Configura a renovação para ocorrer antes da expiração
      const renewalTime = Math.max(0, timeUntilExpiry - SESSION_CONFIG.RENEW_BEFORE_EXPIRY);
      
      tokenRenewalTimeout = setTimeout(async () => {
        const { error } = await supabase.auth.refreshSession();
        if (!error) {
          // Reconfigura a renovação após sucesso
          setupTokenRenewal();
        } else {
          // Forçar logout se não conseguir renovar
          await supabase.auth.signOut();
          window.location.href = '/login';
        }
      }, renewalTime);
    }
  });
}

// Configura listeners para renovação de token e verificação de sessão
export function setupSessionMonitoring() {
  // Renovação automática de token
  setupTokenRenewal();
  
  // Monitorar atividade do usuário
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(eventType => {
    window.addEventListener(eventType, updateActivity, { passive: true });
  });
  
  // Verificar periodicamente se a sessão expirou
  setInterval(() => {
    if (hasSessionExpiredByInactivity()) {
      // Sessão expirada por inatividade
      supabase.auth.signOut().then(() => {
        window.location.href = '/login?expired=inactivity';
      });
    }
    
    if (hasSessionExceededMaxDuration()) {
      // Sessão excedeu duração máxima
      supabase.auth.signOut().then(() => {
        window.location.href = '/login?expired=maxduration';
      });
    }
  }, 60000); // Verificar a cada minuto
}

// Reinicia o controle de sessão após login
export function resetSessionTimers() {
  lastActivity = Date.now();
  sessionStartTime = Date.now();
  setupTokenRenewal();
}

export const signUp = async (email: string, password: string, fullName: string, role: string = 'restaurant_owner', restaurantId?: string) => {
  try {
    // Primeiro, criar o usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          is_profile_complete: false,
          registered_at: new Date().toISOString(),
          // Incluir o restaurante registrado nos metadados do usuário se for cliente
          ...(role === 'customer' && restaurantId ? { registered_restaurant_id: restaurantId } : {})
        },
        emailRedirectTo: `${window.location.origin}/${role === 'restaurant_owner' ? 'painel' : ''}`
      }
    });

    if (authError) {
      throw authError;
    }

    // Se o usuário foi criado com sucesso, criar o perfil
    if (authData?.user) {
      const profileData = {
        id: authData.user.id,
        full_name: fullName,
        email: email,
        role: role,
        updated_at: new Date().toISOString(),
        // Incluir registered_restaurant_id para clientes se fornecido
        ...(role === 'customer' && restaurantId ? { registered_restaurant_id: restaurantId } : {})
      };
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          // Silenciar erro de limpeza
        }
        throw profileError;
      }
    }

    return { error: null };
  } catch (error: any) {
    return { 
      error: {
        message: error.message || 'Erro ao criar conta',
        details: error.details || error.hint || ''
      }
    };
  }
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (!error) {
    resetSessionTimers();
  }
  
  return { error };
};

export const signOut = async () => {
  // Limpar o timeout de renovação
  if (tokenRenewalTimeout) {
    clearTimeout(tokenRenewalTimeout);
    tokenRenewalTimeout = null;
  }
  
  return await supabase.auth.signOut();
};
