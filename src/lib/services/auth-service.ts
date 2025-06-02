import supabase from '@/lib/supabase';
import { User } from '@/lib/models';
import { getApiUrl, getEnvironmentInfo } from '@/lib/env';
import Cookies from 'js-cookie';

export type AuthResponse = {
  user: User | null;
  error: string | null;
}

export type SuccessResponse = {
  success: boolean;
  error: string | null;
}

// URL base da API
const API_URL = getApiUrl();

// Nome do cookie para armazenar o token de autenticação
const AUTH_TOKEN_COOKIE = 'comandeja_auth_token';
// Cookie de backup para persistência entre páginas
const SESSION_BACKUP_COOKIE = 'comandeja_session_backup';
// Tempo de expiração do cookie em dias (30 dias)
const COOKIE_EXPIRY_DAYS = 30;

// Função auxiliar para log
function logError(context: string, error: any) {
  console.error(`[AuthService] ${context}:`, error);
  console.error(`[AuthService] Ambiente:`, getEnvironmentInfo());
}

// Função para configurar o cookie de forma consistente
function setAuthCookie(token: string) {
  const cookieDomain = window.location.hostname;
  
  // Define o cookie com opções adequadas para persistência
  Cookies.set(AUTH_TOKEN_COOKIE, token, {
    expires: COOKIE_EXPIRY_DAYS,
    secure: window.location.protocol === 'https:',
    sameSite: 'lax',
    path: '/'
  });
  
  // Salva um backup do token com tempo de expiração maior
  try {
    document.cookie = `${SESSION_BACKUP_COOKIE}=${encodeURIComponent(token)}; expires=${new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toUTCString()}; path=/; domain=${cookieDomain};`;
  } catch (e) {
    console.warn('Erro ao salvar cookie de backup:', e);
  }
}

export const AuthService = {
  /**
   * Fazer login com email e senha
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log(`[AuthService] Tentando login em: ${API_URL}/api/auth/login`);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        logError('Login falhou', { 
          status: response.status,
          statusText: response.statusText,
          message: data.message 
        });
        return { 
          user: null, 
          error: data.message || 'Erro ao fazer login' 
        };
      }
      
      // Salvar o token em cookies seguros
      if (data.session) {
        setAuthCookie(data.session.access_token);
        
        // Garantir que a sessão do Supabase também seja configurada
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token || ''
        });
      }
      
      return { 
        user: data.user, 
        error: null 
      };
    } catch (error) {
      logError('Erro de login', error);
      return { 
        user: null, 
        error: (error as Error).message 
      };
    }
  },

  /**
   * Registrar um novo usuário
   */
  async register(name: string, email: string, password: string, restaurantName: string): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Iniciando registro de usuário:', { name, email, restaurantName });
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password, restaurantName }),
        credentials: 'same-origin', // Mais compatível em desenvolvimento local
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.error('[AuthService] Falha no registro:', data.message, 'Status:', response.status);
        
        // Verificar se o erro é porque o usuário já existe no Auth mas não no banco público
        if (response.status === 500) {
          console.log('[AuthService] Tentando mecanismo de fallback - forçando login');
          // Tentar fazer login diretamente como fallback
          const loginResponse = await fetch(`${API_URL}/api/auth/force-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
          });
          
          const loginData = await loginResponse.json();
          
          if (loginResponse.ok && loginData.success) {
            console.log('[AuthService] Login forçado bem-sucedido após falha no registro');
            
            // Configurar a sessão
            if (loginData.session && loginData.session.access_token) {
              setAuthCookie(loginData.session.access_token);
              try {
                await supabase.auth.setSession({
                  access_token: loginData.session.access_token,
                  refresh_token: loginData.session.refresh_token || '',
                });
                console.log('[AuthService] Sessão do Supabase configurada após login forçado');
              } catch (sessionError) {
                console.error('[AuthService] Erro ao configurar sessão do Supabase após login forçado:', sessionError);
              }
            }
            
            return { 
              user: loginData.user, 
              error: null 
            };
          }
        }
        
        return { 
          user: null, 
          error: data.message || 'Erro ao registrar usuário' 
        };
      }
      
      console.log('[AuthService] Registro bem-sucedido, configurando sessão');
      
      // Salvar o token em cookies seguros
      if (data.session && data.session.access_token) {
        console.log('[AuthService] Token recebido, configurando cookie');
        setAuthCookie(data.session.access_token);
        
        // Garantir que a sessão do Supabase também seja configurada
        try {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token || ''
          });
          console.log('[AuthService] Sessão do Supabase configurada com sucesso');
        } catch (sessionError) {
          console.error('[AuthService] Erro ao configurar sessão do Supabase:', sessionError);
        }
      } else {
        console.warn('[AuthService] Aviso: Registro bem-sucedido, mas sem token de sessão');
      }
      
      return { 
        user: data.user, 
        error: null 
      };
    } catch (error) {
      console.error('[AuthService] Erro crítico durante o registro:', error);
      return { 
        user: null, 
        error: (error as Error).message 
      };
    }
  },

  /**
   * Fazer logout do usuário atual
   */
  async logout(): Promise<boolean> {
    try {
      // Definir que estamos em processo de logout explícito
      sessionStorage.setItem('explicit_logout', 'true');
      
      // Remover todos os cookies relacionados à autenticação
      Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
      Cookies.remove(SESSION_BACKUP_COOKIE, { path: '/' });
      
      // Remover todos os cookies
      const allCookies = document.cookie.split(';');
      for (const cookie of allCookies) {
        const [name] = cookie.trim().split('=');
        if (name) {
          const trimmedName = name.trim();
          Cookies.remove(trimmedName, { path: '/' });
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; samesite=lax`;
        }
      }
      
      // Limpar todo o localStorage e sessionStorage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Erro ao limpar storage:', e);
      }
      
      // Fazer logout no Supabase (escopo global para garantir)
      await supabase.auth.signOut({ scope: 'global' });
      
      // Tentar fazer logout na API se houver token
      const token = Cookies.get(AUTH_TOKEN_COOKIE);
      if (token) {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (apiError) {
          console.warn('Erro ao fazer logout na API:', apiError);
        }
      }
      
      // Remover cookies específicos do Supabase novamente como garantia
      document.cookie.split(';')
        .filter(c => c.trim().startsWith('sb-'))
        .forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; samesite=lax`;
          }
        });
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, tenta remover os cookies e storage
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Forçar limpeza de todos os cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; samesite=lax`;
          }
        });
      } catch (e) {
        console.error('Erro ao limpar dados:', e);
      }
      return false;
    }
  },

  /**
   * Verificar se há um usuário autenticado
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Primeiro verificar se há sessão no Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        // Atualizar o cookie com o token mais recente
        setAuthCookie(sessionData.session.access_token);
        
        // Buscar dados do usuário
        const { data } = await supabase.auth.getUser();
        
        if (data.user) {
          // Buscar dados adicionais do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
          }

          return {
            id: data.user.id,
            email: data.user.email!,
            name: userData?.name || '',
            created_at: new Date(data.user.created_at!),
            last_login: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
            is_active: userData?.is_active ?? true,
            restaurantId: userData?.restaurant_id,
            restaurantSlug: userData?.restaurant_slug,
            role: userData?.role
          };
        }
        
        return null;
      }
      
      // Se não houver sessão no Supabase, verificar o cookie
      const token = Cookies.get(AUTH_TOKEN_COOKIE) || this.getBackupToken();
      
      if (!token) {
        return null;
      }
      
      // Tentar restaurar a sessão com o token do cookie
      const { data: restoredSession, error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
      });
      
      if (sessionError || !restoredSession.session) {
        console.error('Erro ao validar sessão:', sessionError);
        Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
        document.cookie = `${SESSION_BACKUP_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        return null;
      }
      
      // Atualizar o cookie com o token mais recente
      setAuthCookie(restoredSession.session.access_token);
      
      // Buscar dados do usuário
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        // Buscar dados adicionais do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('Erro ao buscar dados do usuário:', userError);
        }

        return {
          id: data.user.id,
          email: data.user.email!,
          name: userData?.name || '',
          created_at: new Date(data.user.created_at!),
          last_login: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
          is_active: userData?.is_active ?? true,
          restaurantId: userData?.restaurant_id,
          restaurantSlug: userData?.restaurant_slug,
          role: userData?.role
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  },
  
  /**
   * Recuperar o token de backup
   */
  getBackupToken(): string | null {
    try {
      const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${SESSION_BACKUP_COOKIE}=`));
      
      if (match) {
        const value = match.split('=')[1];
        return decodeURIComponent(value);
      }
      return null;
    } catch (e) {
      console.error('Erro ao recuperar token de backup:', e);
      return null;
    }
  },

  /**
   * Enviar link de recuperação de senha
   */
  async requestPasswordReset(email: string): Promise<SuccessResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  },

  /**
   * Atualizar senha do usuário
   */
  async resetPassword(token: string, newPassword: string): Promise<SuccessResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  },
  
  /**
   * Registrar um novo cliente
   */
  async registerCustomer(name: string, email: string, phone: string, password: string, restaurantSlug: string): Promise<SuccessResponse> {
    try {
      // Buscar ID do restaurante pelo slug
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', restaurantSlug)
        .single();
        
      if (restaurantError) {
        throw new Error('Restaurante não encontrado');
      }
      
      // Registrar usuário com Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Criar entrada na tabela de usuários com role = customer
        const { error: userInsertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name,
            password_hash: 'gerenciado_pelo_supabase_auth', // Valor temporário apenas para satisfazer a constraint
            created_at: new Date().toISOString(),
            is_active: true,
            restaurant_id: restaurantData.id,
            role: 'customer'
          });

        if (userInsertError) {
          console.error('Erro ao criar usuário na tabela de usuários:', userInsertError);
          throw userInsertError;
        }

        // Criar entrada na tabela de clientes
        const { error: insertError } = await supabase
          .from('customers')
          .insert({
            id: data.user.id,
            restaurant_id: restaurantData.id,
            name,
            email,
            phone,
            created_at: new Date().toISOString(),
            total_orders: 0,
            total_spent: 0
          });

        if (insertError) {
          console.error('Erro ao criar cliente:', insertError);
          throw insertError;
        }

        return { success: true, error: null };
      }
      
      return { success: false, error: 'Falha ao registrar cliente' };
    } catch (error) {
      console.error('Erro de registro de cliente:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  },
  
  /**
   * Login de cliente
   */
  async customerLogin(email: string, password: string, restaurantSlug: string): Promise<AuthResponse> {
    try {
      // Buscar ID do restaurante pelo slug
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', restaurantSlug)
        .single();
        
      if (restaurantError) {
        throw new Error('Restaurante não encontrado');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Verificar se é um cliente do restaurante
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .eq('restaurant_id', restaurantData.id)
          .eq('role', 'customer')
          .single();

        if (userError) {
          console.error('Erro ao buscar dados do usuário:', userError);
          throw new Error('Cliente não encontrado para este restaurante');
        }

        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', data.user.id)
          .eq('restaurant_id', restaurantData.id)
          .single();

        if (customerError) {
          console.error('Erro ao buscar dados do cliente:', customerError);
          throw new Error('Cliente não encontrado para este restaurante');
        }

        // Salvar o token em cookies seguros
        if (data.session) {
          setAuthCookie(data.session.access_token);
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: userData.name,
          created_at: new Date(data.user.created_at!),
          last_login: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
          is_active: userData.is_active,
          restaurantId: restaurantData.id,
          restaurantSlug: restaurantSlug,
          role: 'customer'
        };

        return { user, error: null };
      }
      
      return { user: null, error: 'Usuário não encontrado' };
    } catch (error) {
      console.error('Erro de login de cliente:', error);
      return { 
        user: null, 
        error: (error as Error).message 
      };
    }
  }
};
