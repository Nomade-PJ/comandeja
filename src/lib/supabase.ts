import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './env';
import type { Database } from './database.types';

// Carrega as variáveis de ambiente (para desenvolvimento)
const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

// Verificar se as credenciais estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Credenciais do Supabase não encontradas no ambiente.');
  console.error('Verifique se o arquivo .env está configurado corretamente.');
}

// Opções de cookie
const cookieOptions = {
  name: 'sb-auth-token',
  lifetime: 60 * 60 * 24 * 30, // 30 dias em segundos
  domain: window.location.hostname,
  path: '/',
  sameSite: 'lax' as const,
  secure: window.location.protocol === 'https:',
};

// Criar cliente Supabase
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Configuração para debug no console (comentado, descomente para depuração)
  // global: {
  //   fetch: (...args) => {
  //     console.log('Supabase API call:', args[0]);
  //     return fetch(...args);
  //   }
  // }
});

console.log('Cliente Supabase inicializado:', !!supabase);

export default supabase;

// Verificar se as credenciais do Supabase estão configuradas
export function isSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL e chave anônima são necessárias. Verifique as variáveis de ambiente.');
    return false;
  }
  return true;
}

// Função para testar a conexão com o Supabase
export async function testConnection() {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: "Credenciais do Supabase não configuradas",
      timestamp: new Date().toISOString()
    };
  }

  try {
    const { data, error } = await supabase.from('restaurants').select('id').limit(1);
    
    if (error) {
      return {
        success: false,
        message: `Erro ao conectar: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      message: data && data.length > 0 
        ? `Conectado com sucesso! ${data.length} restaurante(s) encontrado(s).` 
        : "Conectado, mas nenhum restaurante encontrado.",
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return {
      success: false,
      message: `Erro inesperado: ${(e as Error).message}`,
      timestamp: new Date().toISOString()
    };
  }
}
